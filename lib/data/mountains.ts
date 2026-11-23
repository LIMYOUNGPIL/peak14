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

// 산 설명(의미·역사)의 출처: 각 산의 위키백과 영어 문서 서두.
// 서두에 적힌 내용만 한국어로 옮겨 적었다. (서두에 없는 내용은 넣지 않았다. 옮기는 과정의 오류가 있을 수 있어
// 화면에 "AI가 한국어로 옮김"과 원문 링크를 함께 보여 준다.)
function story(page: string, text: string) {
  return {
    text,
    source: `https://en.wikipedia.org/wiki/${page}`,
    asOf: AS_OF,
  };
}

const NEPAL = "네팔";
const CHINA = "중국";
const INDIA = "인도";
const PAKISTAN = "파키스탄";

// ---------------------------------------------------------------------------
// 등록된 루트 (출처를 직접 읽어 확인한 값만 넣는다. 자료에 없는 값은 null → 화면에서 "정보 없음")
// ---------------------------------------------------------------------------

// 안전 유의사항의 출처: 히말라야 구조협회(Himalayan Rescue Association, HRA) 공식 사이트.
// 두 페이지 모두 갱신일이 적혀 있지 않아서, 기준일에는 우리가 읽어서 확인한 날을 적는다.
// 문구는 영어 원문 그대로이며 번역하지 않는다. (PRD: 안전 유의사항은 AI가 만들거나 바꾸지 않는다)
const HRA_ALTITUDE =
  "히말라야 구조협회(HRA) https://www.himalayanrescue.org/altitude (확인일 2026-11-23, 페이지에 갱신일 표시 없음)";
const HRA_HEALTH =
  "히말라야 구조협회(HRA) https://www.himalayanrescue.org/health-problems (확인일 2026-11-23, 페이지에 갱신일 표시 없음)";

const annapurnaCircuit: Route = {
  id: "annapurna-circuit",
  name: "안나푸르나 서킷 (Annapurna Circuit)",
  // 위키백과 본문: "The total length of the route varies between 160 and 230 km (100-145 mi)"
  // (정보 상자에는 131 km 도 적혀 있으나 본문과 달라서, 본문의 범위를 따른다. 왕복·편도 여부는 자료에 없다.)
  distanceKm: { min: 160, max: 230 },
  // 위키백과 본문: "The trek usually takes about 15–20 days"
  durationDays: { min: 15, max: 20 },
  // 숙소 수·편의시설은 자료를 확인하지 못했다.
  lodgingCount: null,
  amenities: null,
  // 위키백과는 "Difficult"라고만 적었고 별점 기준은 없어서, 난이도(별 1~5개)는 비워 둔다.
  difficulty: null,
  difficultySource: null,
  difficultyAsOf: null,
  safetyNotes: [
    {
      text: "…after 3000 meters your sleeping altitude is no more than 300 meters to 400 meters higher than the previous day's sleeping altitude",
      language: "en",
      source: HRA_ALTITUDE,
      asOf: "2026-11-23",
    },
    {
      text: "a willingness to rest or DESCEND if symptoms worsen",
      language: "en",
      source: HRA_ALTITUDE,
      asOf: "2026-11-23",
    },
    {
      text: "Never ascend with obvious symptoms.",
      language: "en",
      source: HRA_HEALTH,
      asOf: "2026-11-23",
    },
    {
      text: "Descend if symptoms increase.",
      language: "en",
      source: HRA_HEALTH,
      asOf: "2026-11-23",
    },
    {
      text: "every second or third day should be rest day for acclimatization",
      language: "en",
      source: HRA_HEALTH,
      asOf: "2026-11-23",
    },
  ],
  source:
    "위키백과 Annapurna Circuit https://en.wikipedia.org/wiki/Annapurna_Circuit (확인일 2026-11-23, 문서 마지막 편집 2026-11-04)",
  asOf: "2026-11-23",
};

// 히말라야·카라코람 8,000m 14좌.
// 루트 정보는 출처를 확인한 뒤 routes 에 추가한다. 지금은 모든 산의 루트가 비어 있다.
export const mountains: Mountain[] = [
  { slug: "everest", nameKo: "에베레스트", nameEn: "Everest", routes: [],
    elevationM: 8849, lat: 27.98833333, lon: 86.92527778, countries: [NEPAL, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Mount_Everest", "에베레스트는 네팔어로 사가르마타, 셰르파어로 차몰랑마, 티베트어로 조모랑마라고 불립니다. 해발 기준으로 지구에서 가장 높은 산이며, 정상이 중국과 네팔의 국경에 걸쳐 있습니다. 가장 최근 높이는 2020년 네팔과 중국의 공동 측량으로 8,848.86 m로 측정되었습니다.\n처음 정상에 오르려 한 이들은 영국 등반가들이었습니다. 1924년 조지 맬러리와 앤드루 어빈이 정상 도전에 나섰다가 돌아오지 못해, 이들이 먼저 정상에 올랐는지는 지금도 논쟁거리입니다. 기록으로 확인된 첫 등정은 1953년 텐징 노르가이와 에드먼드 힐러리가 남동릉 루트로 이루었습니다.\n고산병, 날씨, 바람, 눈사태, 쿰부 아이스폴 같은 위험이 있어, 2024년 5월까지 340명이 이 산에서 숨졌습니다.") },
  { slug: "k2", nameKo: "K2", nameEn: "K2", routes: [],
    elevationM: 8611, lat: 35.8825, lon: 76.51333333, countries: [PAKISTAN, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("K2", "K2는 ‘마운트 고드윈오스틴’이라고도 불리며, 에베레스트 다음으로 높은 산입니다. 카라코람 산맥에 있고, 파키스탄이 관할하는 길기트발티스탄과 중국 신장 지역에 걸쳐 있습니다.\n‘야만적인 산(Savage Mountain)’이라는 별명은 1953년 미국 원정대의 조지 벨이 “당신을 죽이려 드는 야만적인 산”이라고 말한 데서 나왔습니다. ‘산 중의 산’, ‘등반가들의 산’이라는 별명도 있습니다.\n1954년 아르디토 데지오가 이끈 이탈리아 원정대의 리노 라체델리와 아킬레 콤파뇨니가 처음 정상에 올랐습니다. 2021년 1월에는 니르말 푸르자와 밍마 갤제 셰르파가 이끄는 네팔 등반가 10명이 8,000m 봉우리 가운데 마지막으로 겨울 등정에 성공했습니다.") },
  { slug: "kangchenjunga", nameKo: "칸첸중가", nameEn: "Kangchenjunga", routes: [],
    elevationM: 8586, lat: 27.7025, lon: 88.14666667, countries: [NEPAL, INDIA], source: SOURCE, asOf: AS_OF,
    story: story("Kangchenjunga", "칸첸중가는 세계에서 세 번째로 높은 산이며, 네팔 코시주와 인도 시킴주의 경계 지역에 있습니다. 네팔과 시킴에서 신성한 산으로 여겨집니다.\n1852년까지는 세계에서 가장 높은 산으로 알려져 있었습니다. 1849년 인도 대삼각측량의 정밀한 측정으로 에베레스트가 더 높다는 것이 밝혀졌고, 검증을 거쳐 1856년 칸첸중가가 세 번째로 높다고 공식 발표되었습니다.\n1955년 5월 25일 영국 원정대의 조 브라운과 조지 밴드가 처음 올랐습니다. 이들은 시킴 왕국의 초갈에게 한 ‘산의 정상은 침범하지 않겠다’는 약속을 지키려고 진짜 정상 바로 아래에서 멈췄습니다. 인도 쪽 사면은 등반이 금지되어 있고, 2016년 인접한 칸첸중가 국립공원은 유네스코 세계유산으로 지정되었습니다.") },
  { slug: "lhotse", nameKo: "로체", nameEn: "Lhotse", routes: [],
    elevationM: 8516, lat: 27.9617, lon: 86.9333, countries: [NEPAL, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Lhotse", "로체는 티베트어로 ‘남쪽 봉우리(South Peak)’라는 뜻으로, 에베레스트와의 가까운 관계를 이름에 담고 있습니다. 세계에서 네 번째로 높고, 정상이 중국 티베트 자치구와 네팔 쿰부 지역의 경계에 있습니다.\n북쪽의 에베레스트, 서쪽의 눕체와 함께 에베레스트 산군의 거대한 말굽 모양 능선을 이룹니다. 남벽과 북동벽은 높이 솟아 있지만, 에베레스트와의 사이에 있는 사우스콜이 매우 높아서 8,000m급 봉우리 가운데 상대적 높이가 가장 작습니다.\n서쪽 사면은 서쪽 쿰(Western Cwm)에 자리해 두 산의 표준 등반 루트에서 중요한 역할을 합니다. 능선에는 로체 메인, 로체 미들, 로체 센트럴 II, 로체 샤르의 네 봉우리가 있습니다.") },
  { slug: "makalu", nameKo: "마칼루", nameEn: "Makalu", routes: [],
    elevationM: 8485, lat: 27.88972222, lon: 87.08888889, countries: [NEPAL, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Makalu", "마칼루는 세계에서 다섯 번째로 높은 산입니다. 에베레스트에서 남동쪽으로 19 km 떨어진 중국–네팔 국경의 마할랑구르 히말라야에 있으며, 네 면의 피라미드 모양으로 홀로 솟은 봉우리입니다.\n북북서쪽 약 3 km에는 캉충체(마칼루 II, 7,678 m)가, 북북동쪽 약 5 km에는 초모 론조(7,804 m)가 있습니다. 동쪽 30 km의 아룬강 계곡에서 7,000 m 넘게 솟아, 지구에서 가장 큰 고도 차이 가운데 하나를 보여 줍니다.") },
  { slug: "cho-oyu", nameKo: "초오유", nameEn: "Cho Oyu", routes: [],
    elevationM: 8188, lat: 28.09416667, lon: 86.66083333, countries: [NEPAL, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Cho_Oyu", "초오유는 티베트어로 ‘터키석 여신(Turquoise Goddess)’이라는 뜻입니다. 세계에서 여섯 번째로 높고, 에베레스트에서 서쪽으로 20 km 떨어진 중국–네팔 국경에 있습니다.\n서쪽 몇 km에는 티베트 사람들과 쿰부의 셰르파들이 오가는 주요 교역로인 낭파 라(5,716 m) 고개가 있습니다. 이 고개와 가깝고 표준 북서릉 루트의 경사가 대체로 완만해서, 8,000m 봉우리 가운데 가장 오르기 쉬운 산으로 여겨지며 전문 가이드와 함께하는 원정대가 즐겨 찾습니다.") },
  { slug: "dhaulagiri", nameKo: "다울라기리", nameEn: "Dhaulagiri", routes: [],
    elevationM: 8167, lat: 28.69611111, lon: 83.49527778, countries: [NEPAL], source: SOURCE, asOf: AS_OF,
    story: story("Dhaulagiri", "다울라기리는 네팔에 있으며 세계에서 일곱 번째로 높고, 한 나라의 국경 안에 있는 산으로는 가장 높습니다. 간다키강 유역에서 가장 높은 지점이기도 합니다.\n1960년 5월 13일 스위스·오스트리아·네팔 합동 원정대가 처음 올랐습니다. 동쪽 34 km에는 안나푸르나 I봉이 있고, 두 산 사이를 흐르는 칼리 간다키강의 협곡은 세계에서 가장 깊다고 합니다. 남쪽의 포카라는 두 산군을 찾는 등반가와 트레커의 관문입니다.") },
  { slug: "manaslu", nameKo: "마나슬루", nameEn: "Manaslu", routes: [],
    elevationM: 8163, lat: 28.54944444, lon: 84.56194444, countries: [NEPAL], source: SOURCE, asOf: AS_OF,
    story: story("Manaslu", "마나슬루는 ‘영혼의 산(mountain of the spirit)’이라는 뜻이며, 지성이나 영혼을 뜻하는 산스크리트어 ‘마나사(manasa)’에서 왔습니다. 쿠탕(Kutang)이라고도 불립니다. 세계에서 여덟 번째로 높고, 네팔 서중부 고르카 지구에서 가장 높은 봉우리입니다.\n1956년 5월 9일 일본 원정대의 이마니시 도시오와 걀젠 노르부가 처음 올랐습니다. 긴 능선과 계곡 빙하 덕분에 사방에서 접근할 수 있고, 멀리서도 눈에 띄는 우뚝한 봉우리입니다.\n네팔 정부는 마나슬루 일대 트레킹을 1991년에야 허가했습니다. 트레킹 길은 부디 간다키강을 따라가는 옛 소금 교역로를 따릅니다.") },
  { slug: "nanga-parbat", nameKo: "낭가파르바트", nameEn: "Nanga Parbat", routes: [],
    elevationM: 8125, lat: 35.2375, lon: 74.58916667, countries: [PAKISTAN], source: SOURCE, asOf: AS_OF,
    story: story("Nanga_Parbat", "낭가파르바트는 시나어로 ‘디아미르(Diamer)’라고도 불리며, 세계에서 아홉 번째로 높은 산입니다. 파키스탄 관할 길기트발티스탄에서 인더스강이 가장 북쪽으로 굽는 곳의 남동쪽에 있으며, 히말라야에서 가장 서쪽에 있는 주요 봉우리라 히말라야 산맥의 서쪽 끝을 지키는 기둥으로 여겨집니다.\n주변 지형 위로 크게 솟아 있어, 세계 100대 고봉 가운데 에베레스트 다음으로 상대적 높이가 큽니다. 몹시 어려운 등반으로 유명하고 사망자가 많아 ‘킬러 마운틴(Killer Mountain)’이라는 별명이 붙었습니다. 기네스 세계 기록에 따르면 해마다 약 7 mm씩 높아지는, 세계에서 가장 빨리 자라는 산입니다.") },
  { slug: "annapurna", nameKo: "안나푸르나", nameEn: "Annapurna", routes: [annapurnaCircuit],
    elevationM: 8091, lat: 28.59611111, lon: 83.82027778, countries: [NEPAL], source: SOURCE, asOf: AS_OF,
    story: story("Annapurna", "안나푸르나는 네팔 중북부 간다키주의 안나푸르나 산군에 있으며, 세계에서 열 번째로 높고 등반이 어렵고 위험하기로 유명합니다.\n1950년 모리스 에르조그가 이끈 프랑스 원정대가 북벽으로 정상에 올라, 사상 처음으로 오른 8,000m 봉우리가 되었습니다. 산군 일대는 네팔에서 처음이자 가장 큰 보호구역인 안나푸르나 보호지역으로 지정되어 있고, 안나푸르나 생추어리와 안나푸르나 서킷 같은 세계적인 트레킹 코스가 있습니다.\n수십 년 동안 주요 8,000m 봉우리 가운데 등정자 대비 사망률이 가장 높았습니다. 기네스 세계 기록 기준 2025년 2월의 사망률은 13.42%(등정 559회 중 사망 75명)입니다.") },
  { slug: "gasherbrum-1", nameKo: "가셔브룸 1봉", nameEn: "Gasherbrum I", routes: [],
    elevationM: 8080, lat: 35.72444444, lon: 76.69638889, countries: [PAKISTAN, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Gasherbrum_I", "가셔브룸 I은 ‘히든 피크(Hidden Peak)’라고도 하며, 처음 측량될 때는 K5라고 불렸습니다. 카라코람의 가셔브룸 산군에 있고, 파키스탄 길기트발티스탄과 중국 신장 사이에 걸쳐 있습니다.\n‘가셔브룸’은 흔히 ‘빛나는 벽(Shining Wall)’이라는 뜻이라고 하지만, 실제로는 발티어로 ‘아름답다’는 뜻의 ‘rgasha’와 ‘산’을 뜻하는 ‘brum’에서 온 말이라 ‘아름다운 산’이라는 뜻입니다.\nK5라는 이름은 1856년 T.G. 몽고메리가 인도 대삼각측량 중 200 km 넘게 떨어진 곳에서 카라코람 봉우리들을 처음 발견하며 붙였습니다. 1892년 윌리엄 마틴 콘웨이는 앞쪽 봉우리들에 가려 발토로 빙하를 따라 걷는 동안 대부분 보이지 않는 외진 위치 때문에 ‘히든 피크’라는 이름을 붙였습니다.\n1958년 7월 5일 니컬러스 클린치가 이끈 미국 8인 원정대의 피트 쇠닝과 앤디 카우프먼이 처음 올랐습니다.") },
  { slug: "broad-peak", nameKo: "브로드피크", nameEn: "Broad Peak", routes: [],
    elevationM: 8051, lat: 35.81361111, lon: 76.56527778, countries: [PAKISTAN, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Broad_Peak", "브로드피크는 세계에서 열두 번째로 높은 산으로, 카라코람에 있으며 파키스탄 길기트발티스탄과 중국 신장에 걸쳐 있습니다.\n1957년 6월 오스트리아 원정대의 프리츠 빈터슈텔러, 마르쿠스 슈무크, 쿠르트 디엠베르거, 헤르만 불이 처음 올랐습니다.") },
  { slug: "gasherbrum-2", nameKo: "가셔브룸 2봉", nameEn: "Gasherbrum II", routes: [],
    elevationM: 8034, lat: 35.75833333, lon: 76.65333333, countries: [PAKISTAN, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Gasherbrum_II", "가셔브룸 II는 처음 측량될 때 K4라고 불렸습니다. 가셔브룸 산군에서 세 번째로 높은 봉우리이며, 카라코람에서 파키스탄 길기트발티스탄과 중국 신장의 경계에 있습니다.\n1956년 7월 7일 프리츠 모라베츠, 요제프 라르히, 한스 빌렌파르트가 속한 오스트리아 원정대가 처음 올랐습니다.") },
  { slug: "shishapangma", nameKo: "시샤팡마", nameEn: "Shishapangma", routes: [],
    elevationM: 8027, lat: 28.35222222, lon: 85.77972222, countries: [CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Shishapangma", "시샤팡마는 시샤스방마, 시아바방마(중국어 希夏邦马, Xīxiàbāngmǎ)라고도 불립니다. 세계에서 열네 번째로 높으며, 8,000m 봉우리 가운데 가장 낮은 산입니다. 전부 티베트 안에 있습니다.") },
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
