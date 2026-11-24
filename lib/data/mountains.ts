// Peak14 산·루트 데이터
//
// 타입은 types/mountain.ts 에 있다.
// 규칙(PRD 5번): 값을 모르면 추측해서 채우지 않고 null 로 둔다.
// 루트 정보는 출처(source)와 기준일(asOf)과 함께 등록한다.

// 서버 전용: 화면(브라우저) 코드가 이 파일을 직접 불러오면 빌드에서 막힌다.
import "server-only";
import type { Mountain, Route } from "@/types/mountain";
import { EXTRA, PATCHES } from "./operator-routes";

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
// 루트 개요의 출처는 각 루트를 다룬 위키백과 영어 문서다. 문서에 적힌 내용만 한국어로 옮겼고,
// 옮기는 과정의 오류가 있을 수 있어 화면에 "AI가 한국어로 옮김"과 원문 링크를 함께 보여 준다.
function overview(page: string, text: string, opts: { host?: string; asOf?: string } = {}) {
  return {
    text,
    source: `https://${opts.host ?? "en.wikipedia.org"}/wiki/${page}`,
    asOf: opts.asOf ?? "2026-11-23",
  };
}

const HRA_ALTITUDE =
  "히말라야 구조협회(HRA) https://www.himalayanrescue.org/altitude (확인일 2026-11-23, 페이지에 갱신일 표시 없음)";
const HRA_HEALTH =
  "히말라야 구조협회(HRA) https://www.himalayanrescue.org/health-problems (확인일 2026-11-23, 페이지에 갱신일 표시 없음)";

// 히말라야 구조협회(HRA)의 고산병 안내. 3,000 m 이상을 걷는 루트에 공통으로 해당하는 일반 안내이며,
// 루트별로 따로 만든 안내가 아니다. 영어 원문은 그대로 두고, 아래 textKo 는 사용자 요청으로 사람이 옮겨 붙인 참고용 번역이다(원문 옆에 함께 표시).
const HRA_SAFETY_NOTES = [
  { text: "…after 3000 meters your sleeping altitude is no more than 300 meters to 400 meters higher than the previous day's sleeping altitude",
    textKo: "…해발 3,000 m를 넘은 뒤에는 잠자는 고도가 전날 잠잔 고도보다 300~400 m를 넘게 높아지지 않아야 합니다.", source: HRA_ALTITUDE },
  { text: "a willingness to rest or DESCEND if symptoms worsen",
    textKo: "증상이 나빠지면 쉬거나 내려갈(하강할) 준비가 되어 있어야 합니다.", source: HRA_ALTITUDE },
  { text: "Never ascend with obvious symptoms.",
    textKo: "뚜렷한 증상이 있을 때는 절대 더 올라가지 마세요.", source: HRA_HEALTH },
  { text: "Descend if symptoms increase.",
    textKo: "증상이 심해지면 내려가세요.", source: HRA_HEALTH },
  { text: "every second or third day should be rest day for acclimatization",
    textKo: "고소 적응을 위해 이틀이나 사흘에 하루는 쉬는 날로 두어야 합니다.", source: HRA_HEALTH },
].map((n) => ({ ...n, language: "en" as const, asOf: "2026-11-23" }));

const annapurnaCircuit: Route = {
  id: "annapurna-circuit",
  name: "안나푸르나 서킷 (Annapurna Circuit)",
  nameEn: "Annapurna Circuit",
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
  safetyNotes: HRA_SAFETY_NOTES,
  overview: overview(
    "Annapurna_Circuit",
    "트레킹은 보통 마르샹디강 계곡의 베시사하르 또는 불불레에서 시작해 칼리 간다키 협곡에서 끝납니다. 길이 가장 높아지는 곳은 토롱 라 고개(5,416 m)입니다.\n10~11월이 네팔에서 가장 인기 있는 시즌입니다. 12~3월에는 5,400 m가 넘는 토롱 라 고개가 눈으로 막혀 며칠씩 닫힐 수 있습니다. 몬순 기간을 포함해 일 년 내내 대부분 구간을 걸을 수 있다고도 합니다.\n위키백과 정보 상자에는 난이도가 ‘어려움(Difficult)’으로, 본문에는 ‘보통에서 상당히 어려운 수준’으로 적혀 있습니다.",
  ),
  source:
    "위키백과 Annapurna Circuit https://en.wikipedia.org/wiki/Annapurna_Circuit (확인일 2026-11-23, 문서 마지막 편집 2026-11-04)",
  asOf: "2026-11-23",
};

// 히말라야·카라코람 8,000m 14좌.
// 루트 정보는 출처를 확인한 뒤 routes 에 추가한다. 출처가 확실하지 않은 산은 routes 를 비워 둔다.
const baseMountains: Mountain[] = [
  { slug: "everest", nameKo: "에베레스트", nameEn: "Everest", routes: [{
      id: "everest-base-camp-trek",
      name: "에베레스트 베이스캠프 트레킹 (남쪽, 네팔)",
      nameEn: "Everest Base Camp Trek (South, Nepal)",
      // 자료에 전체 거리와 전체 일수가 적혀 있지 않아 비워 둔다. (구간별 일정은 개요에 있다)
      distanceKm: null, durationDays: null, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      // 위키백과 Everest base camps 본문에 고도가 적힌 지점. 순서는 본문의 일정 소개 순서다.
      elevationProfile: {
        points: [
          { name: "루클라", nameEn: "Lukla", elevationM: 2846 },
          { name: "남체 바자르", nameEn: "Namche Bazaar", elevationM: 3440 },
          { name: "딩보체", nameEn: "Dingboche", elevationM: 4260 },
          { name: "칼라파타르", nameEn: "Kala Patthar", elevationM: 5545 },
          { name: "베이스캠프", nameEn: "Base camp", elevationM: 5364 },
        ],
        source: "위키백과 Everest base camps https://en.wikipedia.org/wiki/Everest_base_camps (확인일 2026-11-23)",
        asOf: "2026-11-23",
      },
      overview: overview("Everest_base_camps", "남쪽(네팔) 에베레스트 베이스캠프(해발 5,364 m) 트레킹은 히말라야에서 가장 인기 있는 트레킹 코스 가운데 하나로, 해마다 약 4만 명이 루클라 공항(2,846 m)에서 출발해 걷습니다. 보통 카트만두에서 루클라까지 비행기로 간 뒤 걷기 시작합니다. 카트만두에서 루클라까지는 도로가 없습니다.\n일정은 이렇게 소개됩니다. 루클라에서 두드 코시강 계곡을 따라 셰르파의 중심지 남체 바자르(3,440 m)까지 약 이틀이 걸리고, 이곳에서 고소 적응을 위해 하루 쉬는 것이 일반적입니다. 이어 이틀을 더 걸어 딩보체(4,260 m)에 가서 다시 하루 쉬고, 이틀을 더 가면 칼라파타르(5,545 m)와 푸모리 아래의 평지 고락셉을 거쳐 베이스캠프에 닿습니다. 대부분 텡보체 수도원을 지나는 전통 길을 쓰지만, 최근에는 몽라와 폭체를 지나는 높은 길도 인기를 얻고 있습니다.\n2015년 4월 지진으로 일부 길이 손상되어 수리가 필요했습니다. 2022년 6월 17일에는 쿰부 빙하가 빠르게 녹고 얇아져 트레커에게 위험하다는 이유로 베이스캠프를 200~400 m 아래로 옮긴다고 발표되었습니다."),
      source: "위키백과 Everest base camps https://en.wikipedia.org/wiki/Everest_base_camps (확인일 2026-11-23, 문서 마지막 수정 2026-11-22)",
      asOf: "2026-11-23",
    }],
    elevationM: 8849, lat: 27.98833333, lon: 86.92527778, countries: [NEPAL, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Mount_Everest", "에베레스트는 네팔어로 사가르마타, 셰르파어로 차몰랑마, 티베트어로 조모랑마라고 불립니다. 해발 기준으로 지구에서 가장 높은 산이며, 정상이 중국과 네팔의 국경에 걸쳐 있습니다. 가장 최근 높이는 2020년 네팔과 중국의 공동 측량으로 8,848.86 m로 측정되었습니다.\n처음 정상에 오르려 한 이들은 영국 등반가들이었습니다. 1924년 조지 맬러리와 앤드루 어빈이 정상 도전에 나섰다가 돌아오지 못해, 이들이 먼저 정상에 올랐는지는 지금도 논쟁거리입니다. 기록으로 확인된 첫 등정은 1953년 텐징 노르가이와 에드먼드 힐러리가 남동릉 루트로 이루었습니다.\n고산병, 날씨, 바람, 눈사태, 쿰부 아이스폴 같은 위험이 있어, 2024년 5월까지 340명이 이 산에서 숨졌습니다.") },
  { slug: "k2", nameKo: "K2", nameEn: "K2", routes: [{
      id: "baltoro-concordia",
      name: "발토로 빙하·콩코르디아 트레킹 (K2 베이스캠프 방면)",
      nameEn: "Baltoro Glacier – Concordia Trek (towards K2 Base Camp)",
      // 문서에 거리와 일수가 없어 비워 둔다.
      distanceKm: null, durationDays: null, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      overview: overview("Baltoro_Glacier", "발토로 빙하는 파키스탄 길기트발티스탄 시가르 지구의 카라코람에 있으며, K2를 비롯해 반경 20 km 안에 8,000 m가 넘는 봉우리 4개가 둘러싸고 있습니다. ‘발토로’는 발티어로 ‘뼈를 부수는 것(Bone breaker)’이라는 뜻입니다.\n발토로 빙하와 K2에서 내려오는 고드윈오스틴 빙하가 만나는 곳을 콩코르디아(해발 4,600 m)라고 합니다. 콩코르디아는 이름난 트레킹 목적지이고, K2 베이스캠프도 마찬가지입니다."),
      source: "위키백과 Baltoro Glacier https://en.wikipedia.org/wiki/Baltoro_Glacier (확인일 2026-11-23, 문서 마지막 수정 2026-11-22)",
      asOf: "2026-11-23",
    }],
    elevationM: 8611, lat: 35.8825, lon: 76.51333333, countries: [PAKISTAN, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("K2", "K2는 ‘마운트 고드윈오스틴’이라고도 불리며, 에베레스트 다음으로 높은 산입니다. 카라코람 산맥에 있고, 파키스탄이 관할하는 길기트발티스탄과 중국 신장 지역에 걸쳐 있습니다.\n‘야만적인 산(Savage Mountain)’이라는 별명은 1953년 미국 원정대의 조지 벨이 “당신을 죽이려 드는 야만적인 산”이라고 말한 데서 나왔습니다. ‘산 중의 산’, ‘등반가들의 산’이라는 별명도 있습니다.\n1954년 아르디토 데지오가 이끈 이탈리아 원정대의 리노 라체델리와 아킬레 콤파뇨니가 처음 정상에 올랐습니다. 2021년 1월에는 니르말 푸르자와 밍마 갤제 셰르파가 이끄는 네팔 등반가 10명이 8,000m 봉우리 가운데 마지막으로 겨울 등정에 성공했습니다.") },
  { slug: "kangchenjunga", nameKo: "칸첸중가", nameEn: "Kangchenjunga", routes: [{
      id: "goecha-la-trek",
      name: "고차 라 트레킹 (칸첸중가 남동쪽 조망, 인도 시킴)",
      nameEn: "Goecha La Trek (view of Kangchenjunga's south-east, Sikkim, India)",
      // 자료에 적힌 구간 거리(10+7+10+10+14+16+17)를 더한 값이다. 합계는 자료에 없고 우리가 계산했다.
      distanceKm: 84, durationDays: null, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      overview: overview("Goecha_La", "고차 라(해발 4,940 m)는 인도 시킴주 기알싱 지구의 높은 고개입니다. 세계에서 세 번째로 높은 칸첸중가의 남동쪽 면을 볼 수 있고, 칸첸중가 등반을 노리는 이들의 베이스캠프이기도 합니다.\n칸첸중가 국립공원을 지나는 이 트레킹은 하루에 걸어야 하는 거리가 만만치 않을 수 있고, 짧은 시간에 고도 변화가 커서 고소 적응이 중요하다고 합니다.\n문서에 소개된 기본 일정은 다음과 같습니다. Siliguri에서 Yuksom까지 차로 이동한 뒤 걷습니다. Yuksom → Sachen 10 km, Sachen → Tshoka 7 km, Tshoka → Dzongri 10 km. 하루 쉬며 Dzongri La 고개(4,417 m)까지 다녀온 뒤, Dzongri → Thansing 10 km, Thansing → 고차 라 왕복 14 km, Thansing → Tshoka 16 km, Tshoka → Yuksom 17 km를 걷고, 다시 차로 Siliguri로 돌아옵니다. 적힌 구간 거리를 모두 더하면 84 km입니다(합계는 문서에 없고 계산한 값입니다)."),
      source: "위키백과 Goecha La https://en.wikipedia.org/wiki/Goecha_La (확인일 2026-11-23, 문서 마지막 수정 2026-11-22). 거리는 문서의 기본 일정 구간 거리를 더한 값",
      asOf: "2026-11-23",
    }],
    elevationM: 8586, lat: 27.7025, lon: 88.14666667, countries: [NEPAL, INDIA], source: SOURCE, asOf: AS_OF,
    story: story("Kangchenjunga", "칸첸중가는 세계에서 세 번째로 높은 산이며, 네팔 코시주와 인도 시킴주의 경계 지역에 있습니다. 네팔과 시킴에서 신성한 산으로 여겨집니다.\n1852년까지는 세계에서 가장 높은 산으로 알려져 있었습니다. 1849년 인도 대삼각측량의 정밀한 측정으로 에베레스트가 더 높다는 것이 밝혀졌고, 검증을 거쳐 1856년 칸첸중가가 세 번째로 높다고 공식 발표되었습니다.\n1955년 5월 25일 영국 원정대의 조 브라운과 조지 밴드가 처음 올랐습니다. 이들은 시킴 왕국의 초갈에게 한 ‘산의 정상은 침범하지 않겠다’는 약속을 지키려고 진짜 정상 바로 아래에서 멈췄습니다. 인도 쪽 사면은 등반이 금지되어 있고, 2016년 인접한 칸첸중가 국립공원은 유네스코 세계유산으로 지정되었습니다.") },
  { slug: "lhotse", nameKo: "로체", nameEn: "Lhotse", routes: [{
      id: "chukhung-valley-trek",
      name: "추쿵 계곡 트레킹 (로체·눕체 남쪽 사면, 로체 베이스캠프 트레킹이 아님, 네팔)",
      nameEn: "Chukhung Valley Trek (southern slopes of Lhotse and Nuptse; not a Lhotse base camp trek, Nepal)",
      // 일수는 업체 한 곳의 일정이다.
      distanceKm: null, durationDays: 13, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      operatorRange: true,
      overview: { text: "로체를 직접 오르는 등반이 아니라, 로체 남쪽 사면의 추쿵 계곡으로 걷는 트레킹입니다. 위키백과는 추쿵을 쿰부 지역에서 트레커와 등반가를 맞는 롯지 마을(4,730 m)로, 추쿵 계곡을 로체와 눕체의 남쪽 사면에 놓인 계곡이자 에베레스트 베이스캠프 트레커의 고소 적응용 곁가지 코스로 소개합니다.\n트레킹 업체 한 곳(kimkim)은 루클라, 팍딩, 남체, 텡보체, 딩보체, 추쿵을 거쳐 돌아오는 13일 일정(걷는 날 8일)을 안내합니다. 추쿵의 높이는 문서와 업체에 따라 4,730~4,750 m로 적혀 있습니다.\n‘로체 베이스캠프 트레킹’으로 따로 판매하는 상품은 찾지 못했습니다. 로체는 42~56일 등반 원정으로 판매되고, 그 베이스캠프 높이는 에베레스트 베이스캠프와 같은 5,364 m로 적혀 있었습니다(업체 3곳 안내).\n업체 일정은 홍보 자료이며, 날씨와 컨디션에 따라 달라질 수 있습니다.", source: "트레킹 업체 안내 페이지 (아래 출처에 모두 적음)", asOf: "2026-11-24" },
      source: "위키백과 Chukhung https://en.wikipedia.org/wiki/Chukhung (확인일 2026-11-24, 문서 마지막 수정 2026-09-18)와 트레킹 업체 안내 kimkim https://www.kimkim.com/c/chukhung-valley-trek-13-days. 13일은 업체 한 곳의 전체 일정(카트만두 출발·귀환 포함)이며 걷는 날은 8일. 로체 등반 원정 정보는 8K Expeditions https://8kexpeditions.com/package/lhotse-expedition-8516m, Friendship World Trek https://friendshipworldtrek.com/?p=486, Gokyo Treks https://gokyotreksnepal.com/lhotse-expedition. 거리는 업체가 일부 구간만 적어 비워 둠",
      asOf: "2026-11-24",
    }], 
    elevationM: 8516, lat: 27.9617, lon: 86.9333, countries: [NEPAL, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Lhotse", "로체는 티베트어로 ‘남쪽 봉우리(South Peak)’라는 뜻으로, 에베레스트와의 가까운 관계를 이름에 담고 있습니다. 세계에서 네 번째로 높고, 정상이 중국 티베트 자치구와 네팔 쿰부 지역의 경계에 있습니다.\n북쪽의 에베레스트, 서쪽의 눕체와 함께 에베레스트 산군의 거대한 말굽 모양 능선을 이룹니다. 남벽과 북동벽은 높이 솟아 있지만, 에베레스트와의 사이에 있는 사우스콜이 매우 높아서 8,000m급 봉우리 가운데 상대적 높이가 가장 작습니다.\n서쪽 사면은 서쪽 쿰(Western Cwm)에 자리해 두 산의 표준 등반 루트에서 중요한 역할을 합니다. 능선에는 로체 메인, 로체 미들, 로체 센트럴 II, 로체 샤르의 네 봉우리가 있습니다.") },
  { slug: "makalu", nameKo: "마칼루", nameEn: "Makalu", routes: [{
      id: "makalu-barun-valley",
      name: "바룬 계곡 – 마칼루 베이스캠프 트레킹 (네팔)",
      nameEn: "Barun Valley – Makalu Base Camp Trek (Nepal)",
      // 문서에 트레킹 전체 거리·일수·고도별 지점이 없어 비워 둔다. (계곡 길이 46 km 는 트레킹 거리가 아니다)
      distanceKm: null, durationDays: null, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      overview: overview("Barun_Valley", "바룬 계곡은 네팔 상쿠와사바 지구의 마칼루 산기슭에 있는 히말라야 계곡으로, 전체가 마칼루바룬 국립공원 안에 있습니다. 이 계곡은 마칼루 베이스캠프로 가는 트레킹 길에 놓여 있습니다.\n문서는 이 트레킹을 ‘다소 어렵지만 매우 보람 있는’ 코스로 소개합니다. 계곡 전체에는 사람이 살지 않고 대부분 초원(카르카)으로 덮여 있으며, 여름에는 임시 캠프가 만들어집니다. 문서에 이름이 나열된 캠프 지역은 뭄북, 양글레 카르카, 응에, 리푹, 타다소, 야크 카르카, 랑말레, 셰르숀입니다(순서와 고도는 적혀 있지 않습니다).\n요즘은 타시가온 위쪽부터 베이스캠프까지 롯지가 있어 캠핑 장비와 식량을 더 가져갈 필요가 없다고 합니다. 다만 롯지에 담요가 충분하지 않을 수 있어 침낭을 챙기는 것이 좋다고 하며, 길을 찾기 어려운 곳이 있어 현지 가이드를 강력히 권한다고 적혀 있습니다.", { asOf: "2026-11-24" }),
      source: "위키백과 Barun Valley https://en.wikipedia.org/wiki/Barun_Valley (확인일 2026-11-24, 문서 마지막 수정 2026-07-02)",
      asOf: "2026-11-24",
    }], 
    elevationM: 8485, lat: 27.88972222, lon: 87.08888889, countries: [NEPAL, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Makalu", "마칼루는 세계에서 다섯 번째로 높은 산입니다. 에베레스트에서 남동쪽으로 19 km 떨어진 중국–네팔 국경의 마할랑구르 히말라야에 있으며, 네 면의 피라미드 모양으로 홀로 솟은 봉우리입니다.\n북북서쪽 약 3 km에는 캉충체(마칼루 II, 7,678 m)가, 북북동쪽 약 5 km에는 초모 론조(7,804 m)가 있습니다. 동쪽 30 km의 아룬강 계곡에서 7,000 m 넘게 솟아, 지구에서 가장 큰 고도 차이 가운데 하나를 보여 줍니다.") },
  { slug: "cho-oyu", nameKo: "초오유", nameEn: "Cho Oyu", routes: [{
      id: "nangpa-la-trek",
      name: "낭파 라 고개 트레킹 (초오유 서쪽, 네팔–티베트 국경)",
      nameEn: "Nangpa La Pass Trek (west of Cho Oyu, Nepal–Tibet border)",
      // 문서에 거리·일수·숙소·지점별 고도가 없어 비워 둔다. 고개 높이는 문서 안에서 5,806 m 와 5,716 m 로 서로 달라 적지 않는다.
      distanceKm: null, durationDays: null, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      overview: overview("Nangpa_La", "낭파 라는 히말라야를 가로지르는 높은 고개로, 네팔과 티베트 자치구 국경에 걸쳐 있으며 초오유에서 서쪽으로 몇 킬로미터, 에베레스트에서 북서쪽으로 약 30 km 떨어진 곳에 있다고 소개됩니다.\n이 고개를 넘는 발길은 티베트인과 쿰부의 셰르파를 잇는 전통적인 교역·순례 길이며, 옛 이름은 쿰부 라입니다.\n문서에는 ‘낭파 라 트레킹’이 에베레스트 지역에서 잘 알려지지 않은 길이지만 가장 경치가 좋은 길 중 하나라고 적혀 있습니다. 이 길은 셰르파 마을과 외진 히말라야 풍경을 지나 낭파 라에 이른다고 합니다. 이 고개에서는 2006년 국경 경비대가 티베트 난민들에게 총격을 가한 사건이 있었다고도 기록되어 있습니다.\n문서에는 거리, 일정, 숙소, 허가에 관한 내용이 없고, 고개의 해발도 5,806 m와 5,716 m로 서로 다르게 적혀 있습니다.", { asOf: "2026-11-24" }),
      source: "위키백과 Nangpa La https://en.wikipedia.org/wiki/Nangpa_La (확인일 2026-11-24, 문서 마지막 수정 2026-11-06)",
      asOf: "2026-11-24",
    }], 
    elevationM: 8188, lat: 28.09416667, lon: 86.66083333, countries: [NEPAL, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Cho_Oyu", "초오유는 티베트어로 ‘터키석 여신(Turquoise Goddess)’이라는 뜻입니다. 세계에서 여섯 번째로 높고, 에베레스트에서 서쪽으로 20 km 떨어진 중국–네팔 국경에 있습니다.\n서쪽 몇 km에는 티베트 사람들과 쿰부의 셰르파들이 오가는 주요 교역로인 낭파 라(5,716 m) 고개가 있습니다. 이 고개와 가깝고 표준 북서릉 루트의 경사가 대체로 완만해서, 8,000m 봉우리 가운데 가장 오르기 쉬운 산으로 여겨지며 전문 가이드와 함께하는 원정대가 즐겨 찾습니다.") },
  { slug: "dhaulagiri", nameKo: "다울라기리", nameEn: "Dhaulagiri", routes: [{
      id: "dhaulagiri-circuit",
      name: "다울라기리 서킷 (업체 안내 비교, 네팔)",
      nameEn: "Dhaulagiri Circuit (compared from operator itineraries, Nepal)",
      // 업체마다 값이 달라 평균을 내지 않고 최소~최대 범위로 적었다.
      distanceKm: null, durationDays: { min: 18, max: 20 }, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      operatorRange: true,
      overview: { text: "트레킹 업체 4곳의 일정 안내를 비교해 정리한 내용입니다. 4곳 모두 베니에서 출발해 다울라기리 베이스캠프, 프렌치 패스, 히든 밸리, 담푸스 패스, 약 카르카를 거쳐 좀솜이나 마르파로 나오는 서킷 일정을 소개합니다.\n전체 일정은 18~20일이며, 카트만두 출발·귀환과 휴식일을 포함한 값입니다. 걷는 날 수나 총 거리(km)를 적은 업체는 없었습니다.\n업체가 적은 높이(m)는 이렇습니다. 다울라기리 베이스캠프 4,640~4,748, 프렌치 패스 5,010~5,360(한 업체는 한 문서 안에서 서로 다른 값을 적었습니다), 담푸스 패스 5,155~5,280(한 업체가 6,000 m대로 적은 값은 다른 곳과 크게 달라 뺐습니다), 히든 밸리 5,050~5,200, 이탈리안 베이스캠프 3,600~3,660, 글레이셔 캠프 4,200~4,220.\n허가는 업체들이 안나푸르나 보전지역(ACAP) 허가와 TIMS 카드를 안내했고, 한 업체는 다울라기리 제한 구역 허가를 따로 적었습니다. 한 업체는 경험 있는 가이드가 필요하고 혼자 걷는 것은 권하지 않는다고 적었습니다.\n이 값들은 업체 홍보 자료의 범위이며, 날씨와 컨디션에 따라 달라질 수 있습니다.", source: "트레킹 업체 안내 페이지 (아래 출처에 모두 적음)", asOf: "2026-11-24" },
      source: "트레킹 업체 4곳의 일정 안내를 비교한 범위 (확인일 2026-11-24): Himalayan Masters https://himalayan-masters.com/trip/dhaulagiri-circuit-trek, Travel Away Trek https://travelawaytrek.com/trip/dhaulagiri-base-camp-trek/, Nepal Village Trek https://www.nepalvillagetrek.com/trip/dhaulagiri-base-camp-trek, Mission Himalaya Treks https://missionhimalayatreks.com/trips/dhaulagiri-circuit-trek. 소요 일수는 각 업체 전체 일정(이동·휴식 포함)의 최소~최대이며 걷는 날 수가 아니다. 거리는 어느 업체도 적지 않아 비워 둠",
      asOf: "2026-11-24",
    }], 
    elevationM: 8167, lat: 28.69611111, lon: 83.49527778, countries: [NEPAL], source: SOURCE, asOf: AS_OF,
    story: story("Dhaulagiri", "다울라기리는 네팔에 있으며 세계에서 일곱 번째로 높고, 한 나라의 국경 안에 있는 산으로는 가장 높습니다. 간다키강 유역에서 가장 높은 지점이기도 합니다.\n1960년 5월 13일 스위스·오스트리아·네팔 합동 원정대가 처음 올랐습니다. 동쪽 34 km에는 안나푸르나 I봉이 있고, 두 산 사이를 흐르는 칼리 간다키강의 협곡은 세계에서 가장 깊다고 합니다. 남쪽의 포카라는 두 산군을 찾는 등반가와 트레커의 관문입니다.") },
  { slug: "manaslu", nameKo: "마나슬루", nameEn: "Manaslu", routes: [{
      id: "manaslu-circuit",
      name: "마나슬루 서킷 (Manaslu Circuit)",
      nameEn: "Manaslu Circuit",
      // 문서: "The popular Manaslu trekking route of 177 kilometres". 왕복·편도 여부와 일수는 적혀 있지 않다.
      distanceKm: 177, durationDays: null, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      // 지점 고도: 위키보야지 Manaslu Trek(로 바자르·시알라·사마가온·틸체)와 위키백과 Larkya La(라르키아 라). 순서는 걷는 순서다.
      elevationProfile: {
        points: [
          { name: "로 바자르", nameEn: "Lho Bazar", elevationM: 3100 },
          { name: "시알라", nameEn: "Shyala", elevationM: 3500 },
          { name: "사마가온", nameEn: "Samagaon", elevationM: 3500 },
          { name: "라르키아 라 고개", nameEn: "Larkya La", elevationM: 5106 },
          { name: "틸체", nameEn: "Tilche", elevationM: 2100 },
        ],
        source: "위키보야지 Manaslu Trek https://en.wikivoyage.org/wiki/Manaslu_Trek (CC BY-SA 4.0, 확인일 2026-11-24) · 위키백과 Larkya La https://en.wikipedia.org/wiki/Larkya_La (확인일 2026-11-23)",
        asOf: "2026-11-24",
      },
      overview: overview("Manaslu", "마나슬루 서킷으로 알려진 트레킹 코스는 177 km이며, 마나슬루 산군을 돌아 고개를 넘어 안나푸르나 쪽으로 내려갑니다. 네팔 정부는 이 코스의 트레킹을 1991년에야 허가했습니다.\n길은 부디 간다키강을 따라가는 옛 소금 교역로를 따릅니다. 길에서는 6,500 m가 넘는 봉우리 10개가 보이고, 그중 몇 개는 7,000 m가 넘습니다. 코스에서 가장 높은 곳은 라르키아 라 고개(5,106 m)이며, 이 고개는 다르마샬라와 빔탕 사이에 있고 네팔 히말라야에서 가장 긴 고개 중 하나로 소개됩니다."),
      source: "위키백과 Manaslu https://en.wikipedia.org/wiki/Manaslu 와 Larkya La https://en.wikipedia.org/wiki/Larkya_La (확인일 2026-11-23, 문서 마지막 수정 2026-11-22)",
      asOf: "2026-11-23",
    }],
    elevationM: 8163, lat: 28.54944444, lon: 84.56194444, countries: [NEPAL], source: SOURCE, asOf: AS_OF,
    story: story("Manaslu", "마나슬루는 ‘영혼의 산(mountain of the spirit)’이라는 뜻이며, 지성이나 영혼을 뜻하는 산스크리트어 ‘마나사(manasa)’에서 왔습니다. 쿠탕(Kutang)이라고도 불립니다. 세계에서 여덟 번째로 높고, 네팔 서중부 고르카 지구에서 가장 높은 봉우리입니다.\n1956년 5월 9일 일본 원정대의 이마니시 도시오와 걀젠 노르부가 처음 올랐습니다. 긴 능선과 계곡 빙하 덕분에 사방에서 접근할 수 있고, 멀리서도 눈에 띄는 우뚝한 봉우리입니다.\n네팔 정부는 마나슬루 일대 트레킹을 1991년에야 허가했습니다. 트레킹 길은 부디 간다키강을 따라가는 옛 소금 교역로를 따릅니다.") },
  { slug: "nanga-parbat", nameKo: "낭가파르바트", nameEn: "Nanga Parbat", routes: [{
      id: "fairy-meadows-trek",
      name: "페어리 메도 트레킹 (낭가파르바트 라키오트 면)",
      nameEn: "Fairy Meadows Trek (Nanga Parbat, Raikot face)",
      // 문서: 타토 마을에서 페어리 메도까지 5 km 트레킹 (그 앞 15 km 는 지프 길이라 걷는 거리에서 뺐다)
      distanceKm: 5, durationDays: null, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      overview: overview("Fairy_Meadows", "페어리 메도(현지 이름 조트)는 파키스탄 길기트발티스탄 디아메르 지구에 있는 초원으로, 낭가파르바트 베이스캠프 지점 가운데 한 곳 근처입니다. 해발 약 3,300 m이며, 라키오트 면으로 낭가파르바트를 오르는 등반가들의 출발점입니다.\n가는 길: 카라코람 하이웨이의 라이코트 다리에서 타토(Tato) 마을까지 약 15 km는 지프가 다니는 길입니다. 좁고 험한 이 자갈길은 현지인만 운전할 수 있고, 2013년 세계보건기구는 이 길을 세계에서 두 번째로 위험한 도로라고 발표했습니다. 타토에서 페어리 메도까지는 5 km를 걸으며 약 3~4시간이 걸립니다.\n관광 시즌은 4월부터 9월까지 6개월입니다. 방문객은 보통 이곳에서 낭가파르바트 베이스캠프까지 하이킹합니다. 이곳에서 정상으로 흔히 오해되는 봉우리는 실제로는 노스 피크(7,816 m)이고, 진짜 정상은 그 뒤에 가려져 있습니다."),
      source: "위키백과 Fairy Meadows https://en.wikipedia.org/wiki/Fairy_Meadows (확인일 2026-11-23, 문서 마지막 수정 2026-11-22). 거리는 타토 마을에서 페어리 메도까지의 걷는 구간",
      asOf: "2026-11-23",
    }],
    elevationM: 8125, lat: 35.2375, lon: 74.58916667, countries: [PAKISTAN], source: SOURCE, asOf: AS_OF,
    story: story("Nanga_Parbat", "낭가파르바트는 시나어로 ‘디아미르(Diamer)’라고도 불리며, 세계에서 아홉 번째로 높은 산입니다. 파키스탄 관할 길기트발티스탄에서 인더스강이 가장 북쪽으로 굽는 곳의 남동쪽에 있으며, 히말라야에서 가장 서쪽에 있는 주요 봉우리라 히말라야 산맥의 서쪽 끝을 지키는 기둥으로 여겨집니다.\n주변 지형 위로 크게 솟아 있어, 세계 100대 고봉 가운데 에베레스트 다음으로 상대적 높이가 큽니다. 몹시 어려운 등반으로 유명하고 사망자가 많아 ‘킬러 마운틴(Killer Mountain)’이라는 별명이 붙었습니다. 기네스 세계 기록에 따르면 해마다 약 7 mm씩 높아지는, 세계에서 가장 빨리 자라는 산입니다.") },
  { slug: "annapurna", nameKo: "안나푸르나", nameEn: "Annapurna", routes: [annapurnaCircuit, {
      id: "annapurna-sanctuary",
      name: "안나푸르나 생추어리 (Annapurna Sanctuary)",
      nameEn: "Annapurna Sanctuary",
      // 문서에 거리와 일수가 없어 비워 둔다.
      distanceKm: null, durationDays: null, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      overview: overview("Annapurna_Sanctuary", "안나푸르나 생추어리는 포카라에서 정북쪽으로 40 km 떨어진 높은 빙하 분지입니다. 해발 4,000 m가 넘는 타원형 고원을 7,000 m가 넘는 봉우리가 대부분인 안나푸르나 산군이 둘러싸고 있고, 입구는 히운출리와 마차푸차레 봉우리 사이의 좁은 계곡 하나뿐입니다. 사방이 높은 산이라 한여름에도 하루 햇빛이 드는 시간은 7시간뿐입니다.\n이곳은 구룽족이 신성하게 여겨 온 곳이며, 외부인은 1956년에야 처음 들어갔습니다. 지금은 안나푸르나 보호지역 프로젝트에 속해 방문자 수, 땔감 채취, 가축 방목에 제한이 있습니다."),
      source: "위키백과 Annapurna Sanctuary https://en.wikipedia.org/wiki/Annapurna_Sanctuary (확인일 2026-11-23, 문서 마지막 수정 2026-11-22)",
      asOf: "2026-11-23",
    }],
    elevationM: 8091, lat: 28.59611111, lon: 83.82027778, countries: [NEPAL], source: SOURCE, asOf: AS_OF,
    story: story("Annapurna", "안나푸르나는 네팔 중북부 간다키주의 안나푸르나 산군에 있으며, 세계에서 열 번째로 높고 등반이 어렵고 위험하기로 유명합니다.\n1950년 모리스 에르조그가 이끈 프랑스 원정대가 북벽으로 정상에 올라, 사상 처음으로 오른 8,000m 봉우리가 되었습니다. 산군 일대는 네팔에서 처음이자 가장 큰 보호구역인 안나푸르나 보호지역으로 지정되어 있고, 안나푸르나 생추어리와 안나푸르나 서킷 같은 세계적인 트레킹 코스가 있습니다.\n수십 년 동안 주요 8,000m 봉우리 가운데 등정자 대비 사망률이 가장 높았습니다. 기네스 세계 기록 기준 2025년 2월의 사망률은 13.42%(등정 559회 중 사망 75명)입니다.") },
  { slug: "gasherbrum-1", nameKo: "가셔브룸 1봉", nameEn: "Gasherbrum I", routes: [{
      id: "gasherbrum-1-base-camp-trek",
      name: "가셔브룸 베이스캠프 트레킹 (가셔브룸 I·II 공통, 업체 안내, 파키스탄)",
      nameEn: "Gasherbrum Base Camp Trek (shared by Gasherbrum I and II, operator itineraries, Pakistan)",
      // 거리·일수는 업체 한 곳의 범위(왕복)다. 다른 업체는 등반 원정이라 비교하지 않았다.
      distanceKm: { min: 160, max: 180 }, durationDays: { min: 16, max: 20 }, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      operatorRange: true,
      overview: { text: "트레킹 업체 안내를 비교해 정리한 내용입니다. 이 길은 파키스탄 스카르두에서 아스콜레를 거쳐 발토로 빙하를 따라 콩코르디아까지 걷고, 거기서 가셔브룸 베이스캠프로 이어집니다. 가셔브룸 I봉과 II봉이 같은 길을 씁니다.\n일정과 거리는 걷기만 하는 상품을 판매하는 업체 한 곳(8000 Base Camp Challenge)이 ‘16~20일, 왕복 약 160~180 km’로 적었고, 다른 업체들은 등반 원정(48~50일)이나 다섯 개 베이스캠프를 묶은 상품(24~26일)이라 같은 기준으로 비교할 수 없어 쓰지 않았습니다.\n높이(m)는 가셔브룸 베이스캠프 5,100~5,150(두 업체), 콩코르디아 4,512~4,700(네 업체)입니다. 한 업체는 콩코르디아에서 약 2시간 거리의 샤링을 거쳐 가셔브룸 I·II 베이스캠프로 간다고 적었으나 베이스캠프 높이는 적지 않았습니다.\n한 업체는 정부 규정상 면허 가이드가 동행해야 하고 혼자 걷는 경우도 마찬가지라고 안내했습니다.\n이 값들은 업체 홍보 자료이며, 날씨와 컨디션에 따라 달라질 수 있습니다.", source: "트레킹 업체 안내 페이지 (아래 출처에 모두 적음)", asOf: "2026-11-24" },
      source: "트레킹 업체 안내 비교 (확인일 2026-11-24): 8000 Base Camp Challenge https://8000basecampchallenge.com/13-gasherbrum-ii (일수·거리는 이 한 곳만 적음), Apricot Tours https://www.apricottours.pk/tours/five-8000m-base-camps-trek-only/, Skardu Expedition https://skarduexpedition.com/expedition/gasherbrum-i-expedition/, Karakorum Expeditions https://www.karakorumexpedition.com/tours/gasherbrum-ii-expedition/. 소요 일수·거리는 업체 한 곳의 안내이며 업체 홍보 자료라 다를 수 있다",
      asOf: "2026-11-24",
    }], 
    elevationM: 8080, lat: 35.72444444, lon: 76.69638889, countries: [PAKISTAN, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Gasherbrum_I", "가셔브룸 I은 ‘히든 피크(Hidden Peak)’라고도 하며, 처음 측량될 때는 K5라고 불렸습니다. 카라코람의 가셔브룸 산군에 있고, 파키스탄 길기트발티스탄과 중국 신장 사이에 걸쳐 있습니다.\n‘가셔브룸’은 흔히 ‘빛나는 벽(Shining Wall)’이라는 뜻이라고 하지만, 실제로는 발티어로 ‘아름답다’는 뜻의 ‘rgasha’와 ‘산’을 뜻하는 ‘brum’에서 온 말이라 ‘아름다운 산’이라는 뜻입니다.\nK5라는 이름은 1856년 T.G. 몽고메리가 인도 대삼각측량 중 200 km 넘게 떨어진 곳에서 카라코람 봉우리들을 처음 발견하며 붙였습니다. 1892년 윌리엄 마틴 콘웨이는 앞쪽 봉우리들에 가려 발토로 빙하를 따라 걷는 동안 대부분 보이지 않는 외진 위치 때문에 ‘히든 피크’라는 이름을 붙였습니다.\n1958년 7월 5일 니컬러스 클린치가 이끈 미국 8인 원정대의 피트 쇠닝과 앤디 카우프먼이 처음 올랐습니다.") },
  { slug: "broad-peak", nameKo: "브로드피크", nameEn: "Broad Peak", routes: [{
      id: "broad-peak-base-camp",
      name: "브로드피크 베이스캠프 구간 (K2 베이스캠프 트레킹 경로 중, 파키스탄)",
      nameEn: "Broad Peak Base Camp section (on the K2 base camp trek, Pakistan)",
      // 문서의 "왕복 약 180 km, 10~16일"은 K2 베이스캠프까지 전체 트레킹의 값이라 이 구간의 거리·일수로 쓰지 않고 비워 둔다.
      distanceKm: null, durationDays: null, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      // 위키보야지 K2 base camp trek 본문에 고도가 적힌 지점만, 본문 순서대로.
      elevationProfile: {
        points: [
          { name: "아스콜레", nameEn: "Askole", elevationM: 3050 },
          { name: "졸라", nameEn: "Jhola", elevationM: 3200 },
          { name: "파이주", nameEn: "Paiju", elevationM: 3450 },
          { name: "우르두카스", nameEn: "Urdukas", elevationM: 3990 },
          { name: "고로 2", nameEn: "Goro 2", elevationM: 4380 },
          { name: "콩코르디아", nameEn: "Concordia", elevationM: 4620 },
          { name: "브로드피크 베이스캠프", nameEn: "Broad Peak Base Camp", elevationM: 4800 },
        ],
        source: "위키보야지 K2 base camp trek https://en.wikivoyage.org/wiki/K2_base_camp_trek (확인일 2026-11-24, CC BY-SA 4.0)",
        asOf: "2026-11-24",
      },
      overview: overview("K2_base_camp_trek", "이 구간은 위키보야지 ‘K2 base camp trek’ 문서에 나오는 길의 일부입니다. 문서는 이 트레킹이 파키스탄 스카르두에서 시작하는 여러 날의 도보 여행이며, K2 베이스캠프까지 왕복 약 180 km에 10~16일이 걸린다고 소개합니다(이 값은 이 구간만이 아니라 전체 트레킹의 값입니다).\n길은 마지막 상설 마을인 아스콜레(3,050 m)에서 시작해 졸라(3,200 m), 파이주(3,450 m), 우르두카스(3,990 m), 고로 2(4,380 m)를 거쳐, 발토로 빙하와 고드윈오스틴 빙하가 만나는 콩코르디아(4,620 m)에 이릅니다. 콩코르디아는 K2, 브로드피크, 가셔브룸 I·II 등 8,000 m급 봉우리 네 개에 둘러싸인 곳이라고 합니다. 여기서 북쪽으로 고드윈오스틴 빙하를 따라 올라가다 보면 중간쯤에 브로드피크 베이스캠프(4,800 m)가 있고, 문서는 이곳이 브로드피크 서쪽 사면 바로 아래에 있으며 시설이 거의 없다고 적고 있습니다.\n숙박은 스카르두를 떠난 뒤에는 캠핑이 주된 방법이거나 유일한 방법이고, 아스콜레와 후셰에만 아주 기본적인 숙소가 있다고 합니다. 문서에 따르면 외국인은 정부가 승인한 가이드와 함께해야 하며 혼자서는 갈 수 없고, 특별 트레킹 비자가 필요합니다.", { host: "en.wikivoyage.org", asOf: "2026-11-24" }),
      source: "위키보야지 K2 base camp trek https://en.wikivoyage.org/wiki/K2_base_camp_trek (확인일 2026-11-24, 문서 마지막 수정 2026-11-13, CC BY-SA 4.0). 브로드피크 베이스캠프 지점은 이 문서의 한 항목",
      asOf: "2026-11-24",
    }], 
    elevationM: 8051, lat: 35.81361111, lon: 76.56527778, countries: [PAKISTAN, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Broad_Peak", "브로드피크는 세계에서 열두 번째로 높은 산으로, 카라코람에 있으며 파키스탄 길기트발티스탄과 중국 신장에 걸쳐 있습니다.\n1957년 6월 오스트리아 원정대의 프리츠 빈터슈텔러, 마르쿠스 슈무크, 쿠르트 디엠베르거, 헤르만 불이 처음 올랐습니다.") },
  { slug: "gasherbrum-2", nameKo: "가셔브룸 2봉", nameEn: "Gasherbrum II", routes: [{
      id: "gasherbrum-2-base-camp-trek",
      name: "가셔브룸 베이스캠프 트레킹 (가셔브룸 I·II 공통, 업체 안내, 파키스탄)",
      nameEn: "Gasherbrum Base Camp Trek (shared by Gasherbrum I and II, operator itineraries, Pakistan)",
      // 가셔브룸 I봉과 같은 접근로. 거리·일수는 업체 한 곳의 범위(왕복)다.
      distanceKm: { min: 160, max: 180 }, durationDays: { min: 16, max: 20 }, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      operatorRange: true,
      overview: { text: "트레킹 업체 안내를 비교해 정리한 내용입니다. 이 길은 파키스탄 스카르두에서 아스콜레를 거쳐 발토로 빙하를 따라 콩코르디아까지 걷고, 거기서 가셔브룸 베이스캠프로 이어집니다. 가셔브룸 I봉과 II봉이 같은 길을 씁니다.\n일정과 거리는 걷기만 하는 상품을 판매하는 업체 한 곳(8000 Base Camp Challenge)이 ‘16~20일, 왕복 약 160~180 km’로 적었고, 다른 업체들은 등반 원정(48~50일)이나 다섯 개 베이스캠프를 묶은 상품(24~26일)이라 같은 기준으로 비교할 수 없어 쓰지 않았습니다.\n높이(m)는 가셔브룸 베이스캠프 5,100~5,150(두 업체), 콩코르디아 4,512~4,700(네 업체)입니다. 한 업체는 콩코르디아에서 약 2시간 거리의 샤링을 거쳐 가셔브룸 I·II 베이스캠프로 간다고 적었으나 베이스캠프 높이는 적지 않았습니다.\n한 업체는 정부 규정상 면허 가이드가 동행해야 하고 혼자 걷는 경우도 마찬가지라고 안내했습니다.\n이 값들은 업체 홍보 자료이며, 날씨와 컨디션에 따라 달라질 수 있습니다.", source: "트레킹 업체 안내 페이지 (아래 출처에 모두 적음)", asOf: "2026-11-24" },
      source: "트레킹 업체 안내 비교 (확인일 2026-11-24): 8000 Base Camp Challenge https://8000basecampchallenge.com/13-gasherbrum-ii (일수·거리는 이 한 곳만 적음), Apricot Tours https://www.apricottours.pk/tours/five-8000m-base-camps-trek-only/, Skardu Expedition https://skarduexpedition.com/expedition/gasherbrum-i-expedition/, Karakorum Expeditions https://www.karakorumexpedition.com/tours/gasherbrum-ii-expedition/. 소요 일수·거리는 업체 한 곳의 안내이며 업체 홍보 자료라 다를 수 있다",
      asOf: "2026-11-24",
    }], 
    elevationM: 8034, lat: 35.75833333, lon: 76.65333333, countries: [PAKISTAN, CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Gasherbrum_II", "가셔브룸 II는 처음 측량될 때 K4라고 불렸습니다. 가셔브룸 산군에서 세 번째로 높은 봉우리이며, 카라코람에서 파키스탄 길기트발티스탄과 중국 신장의 경계에 있습니다.\n1956년 7월 7일 프리츠 모라베츠, 요제프 라르히, 한스 빌렌파르트가 속한 오스트리아 원정대가 처음 올랐습니다.") },
  { slug: "shishapangma", nameKo: "시샤팡마", nameEn: "Shishapangma", routes: [{
      id: "shishapangma-base-camp-trek",
      name: "시샤팡마 베이스캠프 트레킹 (업체 안내 비교, 티베트)",
      nameEn: "Shishapangma Base Camp Trek (compared from operator itineraries, Tibet)",
      // 업체마다 값이 달라 평균을 내지 않고 최소~최대 범위로 적었다.
      distanceKm: null, durationDays: { min: 5, max: 6 }, lodgingCount: null, amenities: null,
      difficulty: null, difficultySource: null, difficultyAsOf: null,
      safetyNotes: HRA_SAFETY_NOTES,
      operatorRange: true,
      overview: { text: "트레킹 업체 4곳의 일정 안내를 비교해 정리한 내용입니다. 네팔 카트만두나 라싸에서 출발해 니알람, 드라보찬, 싱딥을 거쳐 시샤팡마 베이스캠프로 걷고, 다시 차로 돌아오는 상품을 소개합니다.\n걷는 날은 5~6일입니다. 한 업체는 개요에 ‘9일 트레킹’이라고 적어 일정 표와 달랐습니다. 이동일과 라싸·시가체 관광을 포함한 전체 일정은 12~18일입니다. 총 거리(km)를 적은 업체는 없었습니다.\n높이(m)는 베이스캠프 4,980~5,000, 니알람 3,750~3,780, 드라보찬 4,110(두 업체), 싱딥 4,560(두 업체)입니다.\n허가는 티베트 입경 허가를 상품에 포함한다고 안내한 업체가 많았고, 한 업체는 외국인 관광객의 개별(단독) 여행이 허용되지 않는다고 적었습니다. 중국 비자와 신청 서류를 미리 준비해야 한다는 안내도 있었습니다.\n이 값들은 업체 홍보 자료의 범위이며, 날씨와 컨디션에 따라 달라질 수 있습니다.", source: "트레킹 업체 안내 페이지 (아래 출처에 모두 적음)", asOf: "2026-11-24" },
      source: "트레킹 업체 4곳의 일정 안내를 비교한 범위 (확인일 2026-11-24): Tibettour.org https://tibettour.org/trekking-tours/shishapangma-south-face-base-camp-trekking-tour.html, Tibet Ctrip Travel Service https://www.tibetctrip.com/tibet-trekking-adventures/shishapangma-trek-everest-lhasa.html, Nepal Tibet Tours & Treks https://www.nepaltibetnow.com/shishapangma-trekking.html, Nature Trail Travels & Tours https://allnepal.com/?p=4999. 소요 일수는 업체가 걷는 날로 표시한 날의 최소~최대이며 전체 일정(12~18일)은 이동·관광을 포함한다. 거리는 어느 업체도 적지 않아 비워 둠",
      asOf: "2026-11-24",
    }], 
    elevationM: 8027, lat: 28.35222222, lon: 85.77972222, countries: [CHINA], source: SOURCE, asOf: AS_OF,
    story: story("Shishapangma", "시샤팡마는 시샤스방마, 시아바방마(중국어 希夏邦马, Xīxiàbāngmǎ)라고도 불립니다. 세계에서 열네 번째로 높으며, 8,000m 봉우리 가운데 가장 낮은 산입니다. 전부 티베트 안에 있습니다.") },
];

// 업체 안내를 비교한 값을 기존 루트에 채우고, 새 루트를 산 아래에 붙인다. (lib/data/operator-routes.ts)
export const mountains: Mountain[] = baseMountains.map((mt) => ({
  ...mt,
  routes: [
    ...mt.routes.map((rt) => ({ ...rt, ...(PATCHES[rt.id] ?? {}) })),
    ...(EXTRA[mt.slug] ?? []).map(
      (e): Route => ({
        ...e,
        lodgingCount: null,
        amenities: e.amenities ?? null,
        difficulty: null,
        difficultySource: null,
        difficultyAsOf: null,
        safetyNotes: HRA_SAFETY_NOTES,
        overview: null,
        asOf: "2026-11-24",
      }),
    ),
  ],
}));

export function getMountain(slug: string): Mountain | undefined {
  return mountains.find((m) => m.slug === slug);
}

export function getRoute(
  mountain: Mountain,
  routeId: string,
): Route | undefined {
  return mountain.routes.find((r) => r.id === routeId);
}

// 루트 id 로 루트와 그 루트가 속한 산을 함께 찾는다. (루트 비교에서 쓴다)
export function findRoute(routeId: string): { mountain: Mountain; route: Route } | undefined {
  for (const mountain of mountains) {
    const route = mountain.routes.find((r) => r.id === routeId);
    if (route) return { mountain, route };
  }
  return undefined;
}
