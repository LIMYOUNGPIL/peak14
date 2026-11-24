"use client";

// 첫 화면: 히말라야 3D 전경 (진입 연출 + 드래그 + 산 터치 정보)
//
// 흐름: 지형 파일을 내려받는다(로딩 숫자) → 장면을 준비한다 → 100%가 되면 로딩 화면이 사라지고
//       카메라가 멀리서 날아 들어온다 → 드래그로 돌려 보고, 산을 누르면 그 산으로 날아가
//       이름과 수집된 정보가 나타난다.
//
// 3D를 쓸 수 없거나 불러오지 못하면 14좌 목록으로 바꿔 보여 준다. (Design Ref: §3.1)

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
} from "react";
import MountainGrid from "@/components/MountainGrid";
import { makeT, type Locale } from "@/lib/i18n/messages";
import type { PublicMountain } from "@/types/mountain";
import CustomCursor from "./CustomCursor";
import PeakInfo from "./PeakInfo";
import PeakList from "./PeakList";
import Preloader from "./Preloader";
import { EXAGGERATION } from "./geo";
import { loadTerrain, type TerrainData } from "./terrain";
import type { PeakPoint, Phase } from "./Scene";

type SceneComponent = ComponentType<{
  terrain: TerrainData;
  peaks: PeakPoint[];
  selected: string | null;
  phase: Phase;
  reducedMotion: boolean;
  coarsePointer: boolean;
  onSelect: (slug: string | null) => void;
  onHover: (slug: string | null) => void;
  labelRefs: React.RefObject<(HTMLElement | null)[]>;
  onReady: () => void;
  onIntroDone: () => void;
}>;

// 이 기기가 3D(WebGL)를 지원하는지. 한 번만 확인하고 기억해 둔다.
let webglCache: boolean | null = null;
function getWebGL(): boolean {
  if (webglCache === null) {
    try {
      const canvas = document.createElement("canvas");
      webglCache = !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
    } catch {
      webglCache = false;
    }
  }
  return webglCache;
}
const subscribeNothing = () => () => {};

// 화면 설정(움직임 줄이기, 터치 기기 등)을 읽는다. 설정이 바뀌면 다시 읽는다.
function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export default function Experience({ mountains, locale }: { mountains: PublicMountain[]; locale: Locale }) {
  const t = useMemo(() => makeT(locale), [locale]);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);

  const [view, setView] = useState<"scene" | "list">("scene");
  const [loadError, setLoadError] = useState(false);
  const [terrain, setTerrain] = useState<TerrainData | null>(null);
  const [SceneComp, setSceneComp] = useState<SceneComponent | null>(null);
  const [dataFraction, setDataFraction] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [shownPercent, setShownPercent] = useState(0);
  const [preloaderGone, setPreloaderGone] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const finePointer = useMediaQuery("(pointer: fine)");
  const webglOk = useSyncExternalStore(subscribeNothing, getWebGL, () => true);
  const failure: "webgl" | "load" | null = !webglOk ? "webgl" : loadError ? "load" : null;

  const peaks = useMemo<PeakPoint[]>(
    () =>
      mountains.flatMap((m, i) =>
        m.lat !== null && m.lon !== null
          ? [{ slug: m.slug, number: i + 1, nameKo: m.nameKo, nameEn: m.nameEn, lat: m.lat, lon: m.lon }]
          : [],
      ),
    [mountains],
  );

  // 시작: 3D 장면 코드와 지형 파일을 함께 내려받는다.
  useEffect(() => {
    if (!webglOk) return;
    let cancelled = false;
    import("./Scene")
      .then((m) => !cancelled && setSceneComp(() => m.default as SceneComponent))
      .catch(() => !cancelled && setLoadError(true));
    loadTerrain((f) => !cancelled && setDataFraction(f))
      .then((data) => !cancelled && setTerrain(data))
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [webglOk]);

  // 로딩 숫자의 목표: 장면 코드 10% + 지형 파일 80% + 첫 장면 준비 10%
  const target = (SceneComp ? 0.1 : 0) + 0.8 * dataFraction + (sceneReady ? 0.1 : 0);

  // 숫자가 갑자기 뛰지 않도록 목표를 향해 부드럽게 올라간다.
  useEffect(() => {
    if (preloaderGone || failure) return;
    let frame = 0;
    const tick = () => {
      setShownPercent((p) => {
        const goal = target * 100;
        if (p >= goal) return p;
        return Math.min(goal, p + Math.max(0.35, (goal - p) * 0.1));
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, preloaderGone, failure]);

  // 100%가 되면 로딩 화면이 사라지고, 카메라가 날아 들어온다.
  const leaving = !failure && sceneReady && shownPercent >= 99.9;
  const phase: Phase = !leaving
    ? "waiting"
    : reducedMotion || introDone
      ? "explore"
      : "intro";
  useEffect(() => {
    if (!leaving) return;
    const id = window.setTimeout(() => setPreloaderGone(true), 1100);
    return () => window.clearTimeout(id);
  }, [leaving]);

  const onSelect = useCallback((slug: string | null) => setSelected(slug), []);
  const onHover = useCallback((slug: string | null) => setHovered(slug), []);
  const onReady = useCallback(() => setSceneReady(true), []);
  const onIntroDone = useCallback(() => setIntroDone(true), []);

  const selectedMountain = mountains.find((m) => m.slug === selected) ?? null;
  const showScene = view === "scene" && !failure;
  const exploring = phase === "explore";
  const cursorLabel = hovered ? t("explore.cursorOpen") : t("explore.cursorDrag");

  return (
    <div
      ref={containerRef}
      className={`hx-root ${showScene && exploring ? "hx-fine-cursor" : ""}`}
    >
      {/* 3D 장면: 로딩 화면 뒤에서 미리 준비한다 */}
      {showScene && SceneComp && terrain && (
        <div className="hx-scene" aria-label={t("explore.title")}>
          <SceneComp
            terrain={terrain}
            peaks={peaks}
            selected={selected}
            phase={phase}
            reducedMotion={reducedMotion}
            coarsePointer={coarsePointer}
            onSelect={onSelect}
            onHover={onHover}
            labelRefs={labelRefs}
            onReady={onReady}
            onIntroDone={onIntroDone}
          />
        </div>
      )}

      {/* 산 이름표: 3D 위에 겹친 일반 버튼 (위치는 Scene 이 매 프레임 옮긴다) */}
      {showScene && exploring && (
        <div className="hx-labels">
          {peaks.map((p, i) => (
            <button
              key={p.slug}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              type="button"
              className={`hx-label ${p.slug === selected ? "is-selected" : ""}`}
              onClick={() => onSelect(p.slug)}
              onPointerEnter={() => onHover(p.slug)}
              onPointerLeave={() => onHover(null)}
            >
              <span className="hx-label-no">{String(p.number).padStart(2, "0")}</span>
              <span className="hx-label-name">{locale === "en" ? p.nameEn : p.nameKo}</span>
            </button>
          ))}
        </div>
      )}

      {/* 글자가 잘 읽히도록 아래쪽을 어둡게 */}
      {showScene && <div className="hx-shade" aria-hidden="true" />}

      {/* 장면 위의 화면 요소들: 카메라가 자리를 잡으면 나타난다 */}
      {showScene && exploring && (
        <>
          <PeakList mountains={mountains} selected={selected} onSelect={onSelect} locale={locale} />
          <div className="hx-topright">
            <button type="button" className="hx-pill" onClick={() => setView("list")}>
              {t("explore.listView")}
            </button>
          </div>
          <PeakInfo mountain={selectedMountain} onClose={() => setSelected(null)} locale={locale} />
          {terrain && (
            <p className="hx-credit">
              {t("explore.exaggeration", { n: EXAGGERATION })} ·{" "}
              {t("explore.terrainSource", { text: terrain.meta.sources.attribution })}{" "}
              {t("explore.colorNote")} {t("explore.outerNote")}
            </p>
          )}
          <CustomCursor enabled={finePointer} containerRef={containerRef} label={cursorLabel} hovering={hovered !== null} />
        </>
      )}

      {/* 목록 화면: 3D를 쓸 수 없거나 사용자가 고른 경우 */}
      {!showScene && (
        <div className="hx-list-view">
          <div className="mx-auto w-full max-w-5xl px-6 py-10">
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{t("explore.title")}</h1>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("common.tagline")}</p>
                {failure && (
                  <p role="status" className="mt-3 text-sm text-amber-700 dark:text-amber-300">
                    {failure === "webgl" ? t("explore.noWebgl") : t("explore.loadFailed")}
                  </p>
                )}
              </div>
              {!failure && (
                <button type="button" className="hx-pill" onClick={() => setView("scene")}>
                  {t("explore.sceneView")}
                </button>
              )}
            </div>
            <MountainGrid mountains={mountains} locale={locale} />
          </div>
        </div>
      )}

      {/* 로딩 화면 */}
      {showScene && !preloaderGone && <Preloader percent={shownPercent} leaving={leaving} locale={locale} />}
    </div>
  );
}
