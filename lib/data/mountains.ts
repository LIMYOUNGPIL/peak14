// Peak14 산·루트 데이터
//
// 타입은 types/mountain.ts 에 있다.
// 규칙(PRD 5번): 값을 모르면 추측해서 채우지 않고 null 로 둔다.
// 루트 정보는 출처(source)와 기준일(asOf)과 함께 등록한다.

import type { Mountain, Route } from "@/types/mountain";

// 히말라야·카라코람 8,000m 14좌의 이름만 등록한다.
// 높이, 위치 등 다른 정보는 출처를 확인한 뒤 추가한다.
export const mountains: Mountain[] = [
  { slug: "everest", nameKo: "에베레스트", nameEn: "Everest", routes: [] },
  { slug: "k2", nameKo: "K2", nameEn: "K2", routes: [] },
  { slug: "kangchenjunga", nameKo: "칸첸중가", nameEn: "Kangchenjunga", routes: [] },
  { slug: "lhotse", nameKo: "로체", nameEn: "Lhotse", routes: [] },
  { slug: "makalu", nameKo: "마칼루", nameEn: "Makalu", routes: [] },
  { slug: "cho-oyu", nameKo: "초오유", nameEn: "Cho Oyu", routes: [] },
  { slug: "dhaulagiri", nameKo: "다울라기리", nameEn: "Dhaulagiri", routes: [] },
  { slug: "manaslu", nameKo: "마나슬루", nameEn: "Manaslu", routes: [] },
  { slug: "nanga-parbat", nameKo: "낭가파르바트", nameEn: "Nanga Parbat", routes: [] },
  { slug: "annapurna", nameKo: "안나푸르나", nameEn: "Annapurna", routes: [] },
  { slug: "gasherbrum-1", nameKo: "가셔브룸 1봉", nameEn: "Gasherbrum I", routes: [] },
  { slug: "broad-peak", nameKo: "브로드피크", nameEn: "Broad Peak", routes: [] },
  { slug: "gasherbrum-2", nameKo: "가셔브룸 2봉", nameEn: "Gasherbrum II", routes: [] },
  { slug: "shishapangma", nameKo: "시샤팡마", nameEn: "Shishapangma", routes: [] },
];

export function getMountain(slug: string): Mountain | undefined {
  return mountains.find((m) => m.slug === slug);
}

export function getRoute(
  mountain: Mountain,
  routeId: string,
): Route | undefined {
  return mountain.routes.find((r) => r.id === routeId);
}
