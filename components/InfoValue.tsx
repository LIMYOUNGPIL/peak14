// 값이 있으면 보여 주고, 없으면 "정보 없음"을 보여 주는 부품
//
// Design Ref: §1.1 — 모르는 값은 "정보 없음"으로 정직하게 보여 준다.
// Plan SC: 정보 탐색 편의 — 값이 없는 항목은 "정보 없음"으로 표시한다.

import { translate, type Locale } from "@/lib/i18n/messages";

type Props = {
  value: string | number | null | undefined;
  locale: Locale; // 화면 언어 ("정보 없음" 문구에 쓴다)
  unit?: string; // 값 뒤에 붙일 단위 (예: " km"). 값이 없으면 붙이지 않는다.
};

export default function InfoValue({ value, unit = "", locale }: Props) {
  // null, undefined, 빈 글자는 모두 "값을 모름"으로 본다. 0 은 실제 값이다.
  if (value === null || value === undefined || value === "") {
    return (
      <span className="text-zinc-500 dark:text-zinc-400">
        {translate(locale, "common.noInfo")}
      </span>
    );
  }
  return (
    <span>
      {value}
      {unit}
    </span>
  );
}
