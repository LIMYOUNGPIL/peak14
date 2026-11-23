// Peak14 산·루트 데이터
//
// 타입은 types/mountain.ts 에 있다.
// 규칙(PRD 5번): 값을 모르면 추측해서 채우지 않고 null 로 둔다.
// 루트 정보는 출처(source)와 기준일(asOf)과 함께 등록한다.

// 서버 전용: 화면(브라우저) 코드가 이 파일을 직접 불러오면 빌드에서 막힌다.
import "server-only";
import type { Mountain, Route } from "@/types/mountain";

// 산 정보의 출처 (14좌 공통)
//  - 높이·나라: 위키백과 "Eight-thousander" 목록 표 (높이는 이 표가 인용한 Peakbagger 값)
//  - 좌표: 각 산의 위키백과 문서에 적힌 좌표
const SOURCE =
  "위키백과 Eight-thousander 목록(높이·나라), 각 산의 위키백과 문서(좌표)";
const AS_OF = "2026-11-23";

const NEPAL = "네팔";
const CHINA = "중국";
const INDIA = "인도";
const PAKISTAN = "파키스탄";

// 히말라야·카라코람 8,000m 14좌.
// 루트 정보는 출처를 확인한 뒤 routes 에 추가한다. 지금은 모든 산의 루트가 비어 있다.
export const mountains: Mountain[] = [
  { slug: "everest", nameKo: "에베레스트", nameEn: "Everest", routes: [],
    elevationM: 8849, lat: 27.98833333, lon: 86.92527778, countries: [NEPAL, CHINA], source: SOURCE, asOf: AS_OF },
  { slug: "k2", nameKo: "K2", nameEn: "K2", routes: [],
    elevationM: 8611, lat: 35.8825, lon: 76.51333333, countries: [PAKISTAN, CHINA], source: SOURCE, asOf: AS_OF },
  { slug: "kangchenjunga", nameKo: "칸첸중가", nameEn: "Kangchenjunga", routes: [],
    elevationM: 8586, lat: 27.7025, lon: 88.14666667, countries: [NEPAL, INDIA], source: SOURCE, asOf: AS_OF },
  { slug: "lhotse", nameKo: "로체", nameEn: "Lhotse", routes: [],
    elevationM: 8516, lat: 27.9617, lon: 86.9333, countries: [NEPAL, CHINA], source: SOURCE, asOf: AS_OF },
  { slug: "makalu", nameKo: "마칼루", nameEn: "Makalu", routes: [],
    elevationM: 8485, lat: 27.88972222, lon: 87.08888889, countries: [NEPAL, CHINA], source: SOURCE, asOf: AS_OF },
  { slug: "cho-oyu", nameKo: "초오유", nameEn: "Cho Oyu", routes: [],
    elevationM: 8188, lat: 28.09416667, lon: 86.66083333, countries: [NEPAL, CHINA], source: SOURCE, asOf: AS_OF },
  { slug: "dhaulagiri", nameKo: "다울라기리", nameEn: "Dhaulagiri", routes: [],
    elevationM: 8167, lat: 28.69611111, lon: 83.49527778, countries: [NEPAL], source: SOURCE, asOf: AS_OF },
  { slug: "manaslu", nameKo: "마나슬루", nameEn: "Manaslu", routes: [],
    elevationM: 8163, lat: 28.54944444, lon: 84.56194444, countries: [NEPAL], source: SOURCE, asOf: AS_OF },
  { slug: "nanga-parbat", nameKo: "낭가파르바트", nameEn: "Nanga Parbat", routes: [],
    elevationM: 8125, lat: 35.2375, lon: 74.58916667, countries: [PAKISTAN], source: SOURCE, asOf: AS_OF },
  { slug: "annapurna", nameKo: "안나푸르나", nameEn: "Annapurna", routes: [],
    elevationM: 8091, lat: 28.59611111, lon: 83.82027778, countries: [NEPAL], source: SOURCE, asOf: AS_OF },
  { slug: "gasherbrum-1", nameKo: "가셔브룸 1봉", nameEn: "Gasherbrum I", routes: [],
    elevationM: 8080, lat: 35.72444444, lon: 76.69638889, countries: [PAKISTAN, CHINA], source: SOURCE, asOf: AS_OF },
  { slug: "broad-peak", nameKo: "브로드피크", nameEn: "Broad Peak", routes: [],
    elevationM: 8051, lat: 35.81361111, lon: 76.56527778, countries: [PAKISTAN, CHINA], source: SOURCE, asOf: AS_OF },
  { slug: "gasherbrum-2", nameKo: "가셔브룸 2봉", nameEn: "Gasherbrum II", routes: [],
    elevationM: 8034, lat: 35.75833333, lon: 76.65333333, countries: [PAKISTAN, CHINA], source: SOURCE, asOf: AS_OF },
  { slug: "shishapangma", nameKo: "시샤팡마", nameEn: "Shishapangma", routes: [],
    elevationM: 8027, lat: 28.35222222, lon: 85.77972222, countries: [CHINA], source: SOURCE, asOf: AS_OF },
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
