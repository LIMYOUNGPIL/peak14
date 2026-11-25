"use client";

// 피크 한 곳씩 보기: 산 사진이 화면을 채우고, 양옆에 이전·다음 산이 작게 보이는 화면
//
// 사진은 위키미디어 커먼즈의 자유 이용 사진을 색감·크기만 가공한 것이다.
// 모든 사진에 글쓴이·라이선스·원문 링크를 표시한다. (PRD: 모든 정보에 출처 표시)

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import InfoValue from "@/components/InfoValue";
import { countryName } from "@/lib/i18n/countries";
import { makeT, type Locale } from "@/lib/i18n/messages";
import { sourceText } from "@/lib/i18n/names";
import type { PublicMountain } from "@/types/mountain";

type Props = {
  mountains: PublicMountain[];
  locale: Locale;
};

const SWIPE_PX = 50;

export default function Spotlight({ mountains, locale }: Props) {
  const t = makeT(locale);
  const total = mountains.length;
  const [index, setIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + total) % total), [total]);

  // 키보드 방향키로도 넘길 수 있다.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const current = mountains[index];
  const prev = mountains[(index - 1 + total) % total];
  const next = mountains[(index + 1) % total];
  // 사진은 지금 산과 양옆 산만 불러 두어, 넘길 때 바로 보이게 하면서 한꺼번에 14장을 받지 않는다.
  const layers = [prev, current, next];
  const name = (m: PublicMountain) => (locale === "en" ? m.nameEn : m.nameKo);
  const photo = current.photo;

  return (
    <div
      className="sp-root"
      aria-label={t("explore.spotlightLabel")}
      onPointerDown={(e) => {
        if (e.pointerType === "touch") touchStart.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        const s = touchStart.current;
        touchStart.current = null;
        if (!s) return;
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;
        if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
      }}
    >
      {/* 배경 사진: 바뀔 때 부드럽게 겹쳐 보인다 */}
      <div className="sp-photos" aria-hidden="true">
        {layers.map((m) =>
          m.photo ? (
            <Image
              key={m.slug}
              src={`/peaks/${m.photo.file}.webp`}
              alt=""
              fill
              sizes="100vw"
              unoptimized
              priority={m.slug === current.slug}
              className={`sp-photo ${m.slug === current.slug ? "is-active" : ""}`}
              style={{ objectPosition: `${Math.round(m.photo.focalX * 100)}% 40%` }}
            />
          ) : null,
        )}
      </div>
      {/* 글자가 잘 읽히도록 위·아래를 어둡게 덮는다 */}
      <div className="sp-scrim" aria-hidden="true" />

      <div key={current.slug} className="sp-hero hx-rise">
        <p className="sp-eyebrow">{t("explore.spotlightEyebrow", { n: String(index + 1).padStart(2, "0"), total })}</p>
        <h1 className="sp-title" style={{ fontSize: `clamp(28px, ${Math.min(10.5, 118 / current.nameEn.length)}vw, 150px)` }}>
          {current.nameEn.toUpperCase()}
        </h1>
        <p className="sp-sub">{current.nameKo}</p>
        <span className="sp-rule" aria-hidden="true" />
        <dl className="sp-facts">
          <div>
            <dt>{t("explore.elevation")}</dt>
            <dd>
              <InfoValue
                value={current.elevationM === null ? null : current.elevationM.toLocaleString(locale === "en" ? "en-US" : "ko-KR")}
                unit=" m"
                locale={locale}
              />
            </dd>
          </div>
          <div>
            <dt>{t("explore.countries")}</dt>
            <dd>
              <InfoValue value={current.countries?.map((c) => countryName(c, locale)).join(" · ")} locale={locale} />
            </dd>
          </div>
          <div>
            <dt>{t("explore.routes")}</dt>
            <dd>{current.routeCount > 0 ? t("explore.routeCount", { count: current.routeCount }) : t("explore.noRoutes")}</dd>
          </div>
        </dl>
        <p className="sp-source">
          {t("explore.source")}: <InfoValue value={sourceText(current.source, locale)} locale={locale} /> ({current.asOf ?? t("common.noInfo")})
        </p>
      </div>

      <div className="sp-bottom">
        <button type="button" className="sp-card sp-card-l" onClick={() => go(-1)} aria-label={`${t("explore.prevPeak")}: ${name(prev)}`}>
          <PeakThumb m={prev} missing={t("explore.photoMissing")} />
          <span className="sp-card-cap">
            <span>
              <small>{String(((index - 1 + total) % total) + 1).padStart(2, "0")}</small>
              {name(prev)}
            </span>
            <em aria-hidden="true">←</em>
          </span>
        </button>

        <Link href={`/mountains/${current.slug}`} className="sp-cta">
          {t("explore.viewRoutes")} →
        </Link>

        <button type="button" className="sp-card sp-card-r" onClick={() => go(1)} aria-label={`${t("explore.nextPeak")}: ${name(next)}`}>
          <PeakThumb m={next} missing={t("explore.photoMissing")} />
          <span className="sp-card-cap">
            <span>
              <small>{String(((index + 1) % total) + 1).padStart(2, "0")}</small>
              {name(next)}
            </span>
            <em aria-hidden="true">→</em>
          </span>
        </button>
      </div>

      <div className="sp-dots" role="tablist" aria-label={t("explore.spotlightLabel")}>
        {mountains.map((m, i) => (
          <button
            key={m.slug}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={t("explore.goPeak", { name: name(m) })}
            className={`sp-dot ${i === index ? "is-on" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>

      {/* 사진 출처: 글쓴이·라이선스·원문 링크와 가공했다는 표시 */}
      <p className="sp-credit">
        {photo ? (
          <>
            {t("explore.photoBy")}: {photo.author} ·{" "}
            <a href={photo.licenseUrl} target="_blank" rel="noopener noreferrer">
              {photo.license}
            </a>{" "}
            ·{" "}
            <a href={photo.sourceUrl} target="_blank" rel="noopener noreferrer">
              {t("explore.photoSource")}
            </a>
            {photo.year ? ` (${photo.year})` : ""} · {t("explore.photoEdited")}
          </>
        ) : (
          t("explore.photoMissing")
        )}
      </p>
    </div>
  );
}

function PeakThumb({ m, missing }: { m: PublicMountain; missing: string }) {
  if (!m.photo) return <span className="sp-thumb sp-thumb-none">{missing}</span>;
  return (
    <span className="sp-thumb">
      <Image
        src={`/peaks/${m.photo.file}-thumb.webp`}
        alt=""
        fill
        sizes="240px"
        unoptimized
        style={{ objectPosition: `${Math.round(m.photo.focalX * 100)}% 40%`, objectFit: "cover" }}
      />
    </span>
  );
}
