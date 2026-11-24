// 루트 한눈에 보기: 산 위치 지도 + 고도 그래프 (PLAN 20번)
//
// 첫 화면(3D)과 같은 밤하늘 색을 쓴다. (app/globals.css 의 --night-*, --accent 값)
// 규칙: 등록된 값과 다르게 그리지 않는다. 지점이 2개 미만이면 그래프 대신 "정보 없음"을 보여 준다.
//  - 지도: 3D 지형을 만든 색 이미지(public/terrain)에서 산 둘레를 잘라 보여 준다. 위성 사진이 아니다.
//  - 그래프: 출처에 고도가 적힌 지점만 걷는 순서대로 잇는다. 지점 사이 거리는 자료에 없어 같은 간격으로 놓는다.

import { makeT, type Locale } from "@/lib/i18n/messages";
import { sourceText } from "@/lib/i18n/names";
import type { Mountain, Route } from "@/types/mountain";

// public/terrain/himalaya-meta.json 의 범위와 같은 값
const BOUNDS = { lonW: 73.2, lonE: 89.2, latS: 27, latN: 36.6 };
const SPAN = 1.6; // 지도에 보여 줄 범위(도). 산을 가운데 두고 위아래·좌우로 이만큼

function locatorStyle(lat: number, lon: number) {
  const w = BOUNDS.lonE - BOUNDS.lonW;
  const h = BOUNDS.latN - BOUNDS.latS;
  // 산이 가운데 오도록 잘라 낼 때, 이미지 가장자리를 벗어나지 않게 중심을 조정한다.
  const cLon = Math.min(BOUNDS.lonE - SPAN / 2, Math.max(BOUNDS.lonW + SPAN / 2, lon));
  const cLat = Math.min(BOUNDS.latN - SPAN / 2, Math.max(BOUNDS.latS + SPAN / 2, lat));
  const sizeX = (w / SPAN) * 100; // 이미지를 얼마나 키워 보여 줄지(%)
  const sizeY = (h / SPAN) * 100;
  const posX = ((cLon - SPAN / 2 - BOUNDS.lonW) / (w - SPAN)) * 100;
  const posY = ((BOUNDS.latN - (cLat + SPAN / 2)) / (h - SPAN)) * 100;
  return {
    background: {
      backgroundImage: "url(/terrain/himalaya-color.png)",
      backgroundSize: `${sizeX}% ${sizeY}%`,
      backgroundPosition: `${posX}% ${posY}%`,
    },
    // 표시 점의 위치(지도 안 %)
    dotX: ((lon - (cLon - SPAN / 2)) / SPAN) * 100,
    dotY: (((cLat + SPAN / 2) - lat) / SPAN) * 100,
  };
}

function Chart({ route, locale }: { route: Route; locale: Locale }) {
  const t = makeT(locale);
  const profile = route.elevationProfile;
  if (!profile || profile.points.length < 2) {
    return (
      <p className="rounded-xl border border-dashed border-white/25 p-4 text-sm text-white/75">
        {t("common.noInfo")} — {t("visual.chartNone")}
      </p>
    );
  }
  const pts = profile.points;
  const W = 640, H = 270, padL = 44, padR = 28, padT = 46, padB = 58;
  const lo = Math.floor((Math.min(...pts.map((p) => p.elevationM)) - 300) / 500) * 500;
  const hi = Math.ceil((Math.max(...pts.map((p) => p.elevationM)) + 300) / 500) * 500;
  const x = (i: number) => padL + (i * (W - padL - padR)) / (pts.length - 1);
  const y = (m: number) => padT + ((hi - m) / (hi - lo)) * (H - padT - padB);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.elevationM).toFixed(1)}`).join(" ");
  const area = `${line} L${x(pts.length - 1)} ${H - padB} L${x(0)} ${H - padB} Z`;
  const ticks = [lo, (lo + hi) / 2, hi];
  const fmt = (n: number) => n.toLocaleString(locale === "en" ? "en-US" : "ko-KR");

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" className="w-full" aria-label={t("visual.chartTitle")}>
        <defs>
          <linearGradient id="rv-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffb454" stopOpacity=".55" />
            <stop offset="1" stopColor="#ffb454" stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((tk) => (
          <g key={tk}>
            <line x1={padL} x2={W - padR} y1={y(tk)} y2={y(tk)} stroke="#fff" strokeOpacity=".16" strokeDasharray="3 5" />
            <text x={padL - 8} y={y(tk) + 4} textAnchor="end" fontSize="11" fill="#fff" fillOpacity=".65">{fmt(tk)}</text>
          </g>
        ))}
        <path d={area} fill="url(#rv-area)" />
        <path d={line} fill="none" stroke="#ffb454" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => {
          const above = i % 2 === 0 || i === pts.length - 1 ? true : false;
          const name = locale === "en" ? p.nameEn : p.name;
          return (
            <g key={p.name}>
              <circle cx={x(i)} cy={y(p.elevationM)} r="5" fill="#fff" stroke="#ffb454" strokeWidth="2.5" />
              <text x={x(i)} y={y(p.elevationM) + (above ? -26 : 30)} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#fff">{name}</text>
              <text x={x(i)} y={y(p.elevationM) + (above ? -11 : 45)} textAnchor="middle" fontSize="11.5" fill="#ffe2bd">{t("visual.meters", { n: fmt(p.elevationM) })}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-1 text-xs leading-5 text-white/70">
        {t("visual.chartNote")}
        <span className="mt-1 block text-white/55">
          {t("route.source")}: {sourceText(profile.source, locale)} · {t("route.asOf")}: {profile.asOf}
        </span>
      </figcaption>
    </figure>
  );
}

export default function RouteVisual({ mountain, route, locale }: { mountain: Mountain; route: Route; locale: Locale }) {
  const t = makeT(locale);
  const hasPoint = mountain.lat !== null && mountain.lon !== null;
  const loc = hasPoint ? locatorStyle(mountain.lat as number, mountain.lon as number) : null;

  return (
    <section
      aria-label={t("visual.title")}
      className="mb-8 overflow-hidden rounded-3xl border p-5 text-white sm:p-6"
      style={{ background: "linear-gradient(180deg, #101c30 0%, var(--night-bottom) 100%)", borderColor: "var(--glass-line)" }}
    >
      <h2 className="mb-4 text-lg font-semibold" style={{ fontFamily: "var(--serif)" }}>{t("visual.title")}</h2>
      <div className="grid gap-6 md:grid-cols-[minmax(0,260px)_1fr]">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-white/85">{t("visual.mapTitle")}</h3>
          {loc ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/25" style={loc.background} role="img" aria-label={`${t("visual.mapTitle")}: ${locale === "en" ? mountain.nameEn : mountain.nameKo}`}>
              <span className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#ffb454] shadow-[0_0_0_6px_rgba(255,180,84,.28)]" style={{ left: `${loc.dotX}%`, top: `${loc.dotY}%` }} />
              <span className="absolute -translate-x-1/2 text-[11px] font-semibold text-white [text-shadow:0_1px_6px_rgba(10,10,40,.9)]" style={{ left: `${loc.dotX}%`, top: `calc(${loc.dotY}% + 12px)` }}>
                {locale === "en" ? mountain.nameEn : mountain.nameKo}
              </span>
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-white/25 p-4 text-sm text-white/75">{t("common.noInfo")}</p>
          )}
          <p className="mt-2 text-xs leading-5 text-white/65">{t("visual.mapNote")}</p>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold text-white/85">{t("visual.chartTitle")}</h3>
          <Chart route={route} locale={locale} />
        </div>
      </div>
    </section>
  );
}
