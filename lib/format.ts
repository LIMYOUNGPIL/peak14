// 화면에 보여 줄 값 만들기

import type { Measure } from "@/types/mountain";

// 숫자 또는 범위를 글자로 바꾼다. 값이 없으면 null (화면에서 "정보 없음").
// 예) 12 → "12", { min: 160, max: 230 } → "160~230"
export function formatMeasure(value: Measure | null): string | null {
  if (value === null) return null;
  if (typeof value === "number") return String(value);
  return `${value.min}~${value.max}`;
}
