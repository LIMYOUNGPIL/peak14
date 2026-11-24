// 나라 이름 영어 표기 (데이터에는 한국어로 저장되어 있다)
// 목록에 없는 이름은 그대로 보여 준다. 새로 지어내지 않는다.

import type { Locale } from "./messages";

const EN: Record<string, string> = { 네팔: "Nepal", 중국: "China", 인도: "India", 파키스탄: "Pakistan" };

export function countryName(name: string, locale: Locale): string {
  return locale === "en" ? (EN[name] ?? name) : name;
}
