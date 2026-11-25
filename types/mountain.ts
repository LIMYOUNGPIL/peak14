// 산·루트 데이터 구조 (DESIGN 4번)
//
// 규칙(PRD 5번): 값을 모르면 추측해서 채우지 않고 null 로 둔다.
// 화면에서는 null 을 "정보 없음"으로 표시한다.

// 난이도: 별 1~5개. 근거가 없으면 null.
export type Difficulty = 1 | 2 | 3 | 4 | 5;

// 숫자 하나 또는 범위. 자료가 "160~230km"처럼 범위로 적었다면 범위 그대로 담는다.
// (하나의 숫자로 바꾸면 자료에 없는 값이 되기 때문이다)
export type Measure = number | { min: number; max: number };

// 안전 유의사항 한 건. 공식 기관이나 현지 자료로 등록한 것만 넣는다.
// AI가 새로 만들거나 바꾸지 않는다.
export type SafetyNote = {
  text: string; // 유의사항 내용 (등록된 자료 원문 그대로. 원문은 고치지 않는다)
  textKo?: string; // 한국어 번역 (사람이 옮겨 등록한 참고용. 있으면 원문 아래에 함께 보여 준다)
  language: "ko" | "en"; // 원문 언어. 영어 원문은 영어 그대로 보여 주고 그 사실을 표시한다
  source: string; // 출처
  asOf: string; // 정보 기준일 (YYYY-MM-DD)
};

export type Route = {
  id: string;
  name: string; // 한국어 이름
  nameEn: string; // 영어 이름
  distanceKm: Measure | null; // 총 거리(km)
  durationDays: Measure | null; // 소요 시간(일)
  lodgingCount: number | null; // 숙소 개수
  dailyWalkHours?: Measure | null; // 하루 걷는 시간(시간). 업체 안내를 비교한 범위일 수 있다
  bestSeason?: string | null; // 추천 시기 (출처가 적은 그대로)
  permits?: string | null; // 허가·규정 요약 (출처가 적은 그대로)
  amenities: string[] | null; // 편의시설
  difficulty: Difficulty | null; // 난이도 (루트 등록 시 근거와 함께 직접 부여)
  difficultySource: string | null; // 난이도 근거(출처). 근거가 없으면 난이도도 null
  difficultyAsOf: string | null; // 난이도 근거의 기준일 (YYYY-MM-DD)
  safetyNotes: SafetyNote[]; // 안전 유의사항. 빈 배열이면 "정보 없음"
  // 고도 그래프용 주요 지점(출처에 고도가 적힌 지점만, 가는 순서대로). 2개 미만이면 그래프를 그리지 않고 "정보 없음".
  // 지점 사이의 거리·오르내림은 자료에 없어서 그래프에 반영하지 않는다.
  elevationProfile?: {
    points: { name: string; nameEn: string; elevationM: number }[];
    source: string;
    asOf: string;
  } | null;
  // 여러 트레킹 업체 안내를 비교해 정리한 글과 읽은 업체 주소 (위키 개요와 별도로 보여 준다)
  operatorInfo?: { text: string; sources: { name: string; url: string }[]; asOf: string } | null;
  // true 이면 값이 여러 트레킹 업체 안내를 비교한 범위다. (업체 홍보 자료라 서로 다르고 날씨·컨디션에 따라 달라질 수 있어 화면에 그 사실을 밝힌다)
  operatorRange?: boolean;
  // 루트 개요: 출처에 적힌 사실을 한국어로 옮긴 글. 출처 링크와 기준일을 함께 가진다. 없으면 null
  overview: { text: string; source: string; asOf: string } | null;
  source: string | null; // 출처
  asOf: string | null; // 정보 기준일 (YYYY-MM-DD)
};

export type Mountain = {
  slug: string;
  nameKo: string;
  nameEn: string;
  routes: Route[];

  // 산 정보 (DESIGN 4.2). 값을 모르면 null → 화면에서 "정보 없음"
  elevationM: number | null; // 높이(m)
  lat: number | null; // 위도 (십진수 도)
  lon: number | null; // 경도 (십진수 도)
  countries: string[] | null; // 걸쳐 있는 나라
  source: string | null; // 출처
  asOf: string | null; // 정보 기준일 (YYYY-MM-DD)

  // 산의 의미·역사 설명. 출처(원문 링크)와 기준일을 함께 가진다. 없으면 null → "정보 없음"
  story: { text: string; source: string; asOf: string } | null;
};

// 로그인 전에도 볼 수 있는 산 정보 (PRD 4번: 루트 목록까지 공개, 세부 정보는 로그인 후)
// 루트의 세부 내용(안전 유의사항, 거리 등)은 일부러 담지 않는다. 화면(브라우저)으로 보내는 값이기 때문이다.
// 산 대표 사진: 위키미디어 커먼즈의 자유 이용 사진을 색감·크기만 가공해 쓴다. 글쓴이·라이선스·원문 링크를 함께 보여 준다.
export type PeakPhoto = {
  file: string; // /peaks/{file}.webp, /peaks/{file}-thumb.webp
  alt: string;
  author: string;
  license: string; // 예: CC BY-SA 4.0
  licenseUrl: string;
  sourceUrl: string; // 커먼즈 파일 페이지
  year: number | null;
  focalX: number; // 0~1, 화면에서 정상이 놓일 가로 위치
};

export type PublicMountain = Pick<
  Mountain,
  | "slug"
  | "nameKo"
  | "nameEn"
  | "elevationM"
  | "lat"
  | "lon"
  | "countries"
  | "source"
  | "asOf"
  | "story"
> & {
  routeCount: number;
  photo: PeakPhoto | null;
};

// 로그인 전 루트 목록에 보여 줄 수 있는 루트 정보: 이름과 안전 유의사항 "건수"만
export type PublicRoute = {
  id: string;
  name: string;
  nameEn: string;
  safetyCount: number;
};
