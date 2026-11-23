// 화면 아래에 나타나는 산 정보
//
// 산을 고르지 않았을 때는 제목과 안내 문구를, 고르면 큰 산 이름과 수집된 정보를 보여 준다.
// 값이 없는 항목은 "정보 없음"으로 보여 주고, 출처와 기준일을 함께 적는다. (PRD 5번)

import Link from "next/link";
import InfoValue from "@/components/InfoValue";
import { t } from "@/lib/i18n/messages";
import type { Mountain } from "@/types/mountain";

type Props = {
  mountain: Mountain | null;
  onClose: () => void;
};

function formatCoords(lat: number | null, lon: number | null): string | null {
  if (lat === null || lon === null) return null;
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}°${ns}, ${Math.abs(lon).toFixed(3)}°${ew}`;
}

export default function PeakInfo({ mountain, onClose }: Props) {
  if (!mountain) {
    return (
      <div key="home" className="hx-info hx-rise">
        <div>
          <h1 className="hx-title">HIMALAYA</h1>
          <p className="hx-subtitle">
            {t("explore.title")} · {t("explore.subtitle")}
          </p>
        </div>
        <p className="hx-hint">{t("explore.hint")}</p>
      </div>
    );
  }

  const routeText =
    mountain.routes.length > 0
      ? t("explore.routeCount", { count: mountain.routes.length })
      : t("explore.noRoutes");

  return (
    <div key={mountain.slug} className="hx-info hx-rise">
      <div>
        <h1
          className="hx-title"
          style={{ fontSize: `clamp(44px, ${Math.min(11, 96 / mountain.nameEn.length)}vw, 170px)` }}
        >
          {mountain.nameEn.toUpperCase()}
        </h1>
        <p className="hx-subtitle">{mountain.nameKo}</p>
      </div>

      <div className="hx-facts-wrap">
        <dl className="hx-facts">
          <div className="hx-fact">
            <dt>{t("explore.elevation")}</dt>
            <dd>
              <InfoValue
                value={mountain.elevationM === null ? null : mountain.elevationM.toLocaleString("ko-KR")}
                unit=" m"
              />
            </dd>
          </div>
          <div className="hx-fact">
            <dt>{t("explore.location")}</dt>
            <dd>
              <InfoValue value={formatCoords(mountain.lat, mountain.lon)} />
            </dd>
          </div>
          <div className="hx-fact">
            <dt>{t("explore.countries")}</dt>
            <dd>
              <InfoValue value={mountain.countries?.join(" · ")} />
            </dd>
          </div>
          <div className="hx-fact">
            <dt>{t("explore.routes")}</dt>
            <dd>{routeText}</dd>
          </div>
        </dl>

        <p className="hx-source">
          {t("explore.source")}: <InfoValue value={mountain.source} /> ({mountain.asOf ?? t("common.noInfo")})
        </p>

        <div className="hx-actions">
          <Link href={`/mountains/${mountain.slug}`} className="hx-primary">
            {t("explore.viewRoutes")} →
          </Link>
          <button type="button" onClick={onClose} className="hx-secondary">
            {t("explore.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
