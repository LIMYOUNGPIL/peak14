// 왼쪽의 14좌 목록
//
// 3D 장면에서 산을 누르기 어려운 사람(키보드, 작은 화면)도 같은 산을 고를 수 있게 한다.
// 선택한 산은 하얀 점으로 표시한다.

import { makeT, type Locale } from "@/lib/i18n/messages";
import type { PublicMountain } from "@/types/mountain";

type Props = {
  mountains: PublicMountain[];
  selected: string | null;
  onSelect: (slug: string) => void;
  locale: Locale;
};

export default function PeakList({ mountains, selected, onSelect, locale }: Props) {
  const t = makeT(locale);
  return (
    <nav className="hx-list" aria-label={t("explore.listLabel")}>
      {mountains.map((m, i) => (
        <button
          key={m.slug}
          type="button"
          onClick={() => onSelect(m.slug)}
          aria-current={m.slug === selected ? "true" : undefined}
          className={`hx-list-item ${m.slug === selected ? "is-active" : ""}`}
        >
          <span className="hx-list-no">{String(i + 1).padStart(2, "0")}</span>
          {locale === "en" ? m.nameEn : m.nameKo}
        </button>
      ))}
    </nav>
  );
}
