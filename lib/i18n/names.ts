// 산·루트 이름을 화면 언어에 맞게 고른다

import type { Locale } from "./messages";

export const mountainName = (m: { nameKo: string; nameEn: string }, locale: Locale) =>
  locale === "en" ? m.nameEn : m.nameKo;

export const routeName = (r: { name: string; nameEn: string }, locale: Locale) =>
  locale === "en" ? r.nameEn : r.name;

// 등록된 출처 문구(한국어로 적혀 있다)를 영어 화면에서 읽을 수 있게 단어 단위로 바꾼다.
// 주소·고유명사는 그대로 두고, 아래 목록에 있는 말만 바꾼다. (내용을 새로 지어내지 않는다)
const SOURCE_EN: [string, string][] = [
  ["위키백과", "Wikipedia"],
  ["히말라야 구조협회", "Himalayan Rescue Association"],
  ["목록(높이·나라)", "list (height, country)"],
  ["각 산의 위키백과 문서(좌표)", "each peak's Wikipedia article (coordinates)"],
  ["각 산의 Wikipedia 문서(좌표)", "each peak's Wikipedia article (coordinates)"],
  ["문서 마지막 수정", "article last edited"],
  ["문서 마지막 편집", "article last edited"],
  ["페이지에 갱신일 표시 없음", "no update date shown on the page"],
  ["확인일", "checked"],
];

export function sourceText(text: string | null | undefined, locale: Locale): string | null {
  if (text === null || text === undefined) return null;
  if (locale !== "en") return text;
  return SOURCE_EN.reduce((acc, [ko, en]) => acc.replaceAll(ko, en), text);
}

// 외부 글 글쓴이 표기("Wikivoyage 기여자")를 영어 화면에서 바꿔 보여 준다.
export function authorLabel(name: string, locale: Locale): string {
  return locale === "en" ? name.replace("기여자", "contributors") : name;
}
