// 트레킹 업체 안내를 여러 곳 비교해 만든 루트 정보 (2026-11-24 확인)
//
// 규칙 (PRD 5번, 사용자 결정 2026-11-24):
//  - 업체 홍보 페이지를 직접 열어 읽은 값만 쓴다. 평균 같은 하나의 계산값은 쓰지 않고 최소~최대 범위로 적는다.
//  - 업체가 총 거리를 적은 경우에만 거리를 적는다. (일별 거리를 우리가 더한 값은 쓰지 않는다)
//  - 업체 문서끼리 크게 어긋나는 값은 범위에서 빼고 본문에 그 사실을 적는다.
//  - 화면에는 "업체 안내를 비교한 범위이며 날씨와 컨디션에 따라 달라질 수 있습니다"를 함께 보여 준다.
//
// 기존 루트는 PATCHES 로 비어 있던 칸만 채우고, 새 루트는 EXTRA 로 산 아래에 붙인다.
// (안전 유의사항·난이도 기본값은 mountains.ts 에서 붙인다)

import type { Measure, Route } from "@/types/mountain";

type Src = { name: string; url: string };
type Info = NonNullable<Route["operatorInfo"]>;

const D = "2026-11-24";
const info = (text: string, sources: Src[]): Info => ({ text, sources, asOf: D });
const r = (min: number, max: number): Measure => ({ min, max });

export type OperatorPatch = Partial<
  Pick<Route, "distanceKm" | "durationDays" | "dailyWalkHours" | "bestSeason" | "permits" | "amenities" | "operatorInfo" | "operatorRange">
>;

export type ExtraRoute = Pick<Route, "id" | "name" | "nameEn" | "distanceKm" | "durationDays"> &
  OperatorPatch & { source: string };

const MAR_MAY_SEP_NOV = "3~5월, 9~11월 (업체 안내)";
const TEAHOUSE = ["티하우스(롯지) 숙박", "카트만두 호텔"];
const CAMPING = ["텐트(캠핑)", "도시 호텔(이슬라마바드·스카르두)"];

// ---------------------------------------------------------------------------
// 기존 루트에 채우는 값
// ---------------------------------------------------------------------------
export const PATCHES: Record<string, OperatorPatch> = {
  "everest-base-camp-trek": {
    distanceKm: r(130, 140),
    durationDays: r(12, 14),
    dailyWalkHours: r(2, 9),
    bestSeason: MAR_MAY_SEP_NOV,
    permits: "사가르마타 국립공원 입장 허가가 필요하다고 안내한 업체가 많고, TIMS를 함께 적은 곳도 있습니다. 가이드 동행이 법적 의무는 아니라고 적은 업체가 있습니다.",
    amenities: TEAHOUSE,
    operatorRange: true,
    operatorInfo: info(
      "업체 5곳(HopNepal, Himalayan Recreation, Weseek Travel, Excellent Trek, Himalaya Trip)의 일정 안내를 비교한 내용입니다.\n일정은 카트만두에서 루클라로 비행(약 35분)해 걷기 시작하는 12~14일이고, 걷는 날은 9~11일입니다. 총 거리는 왕복 130~140 km로 적은 업체가 4곳입니다(일정표의 일별 거리를 더하면 122~138 km로 조금 다릅니다). 하루 걷는 시간은 날마다 2~9시간이고 보통 5~8시간입니다.\n높이(m)는 루클라 2,804~2,860, 팍딩 2,610, 남체 3,440~3,441, 텡보체 3,820~3,860, 딩보체 4,350~4,410, 로부체 4,910~4,940, 고락셉 5,140~5,164, 베이스캠프 5,364~5,365, 칼라파타르 5,545~5,644입니다. 칼라파타르는 대부분 5,545~5,555로 적었고 5,644는 두 곳뿐입니다.\n숙박은 티하우스(롯지)이고 캠핑은 필요 없다고 안내한 업체가 있습니다. 성수기에는 루클라 대신 라메차프(만탈리) 공항을 쓰고 새벽에 4~5시간 차로 이동한다고 적은 업체가 있으며, 날씨로 비행이 지연되는 일이 흔해 여유일을 두라고 합니다.",
      [
        { name: "HopNepal", url: "https://www.hopnepal.com/blog/12-days-everest-base-camp-trek-itinerary" },
        { name: "Himalayan Recreation", url: "https://www.himalayanrecreation.com/blog/everest-base-camp-trek-itinerary" },
        { name: "Weseek Travel", url: "https://www.weseektravel.com/everest-base-camp-trek-itinerary/" },
        { name: "Excellent Trek", url: "https://excellenttrek.com/?p=2466" },
        { name: "Himalaya Trip", url: "https://himalayatrip.com/?p=3409" },
      ],
    ),
  },

  "baltoro-concordia": {
    distanceKm: r(140, 209),
    durationDays: r(20, 23),
    dailyWalkHours: r(3, 10),
    bestSeason: "6~8월 중심 (업체 출발 일정 6~9월)",
    permits: "중앙 카라코람 국립공원 등록이 필요하고, 면허 가이드 동행이 정부 규정이라고 안내한 업체가 있습니다.",
    amenities: CAMPING,
    operatorRange: true,
    operatorInfo: info(
      "업체 4곳(KE Adventure, Jagged Globe, Mountain Kingdoms, Adventure Alternative)의 일정 안내를 비교한 내용입니다.\n이슬라마바드에서 스카르두로 비행(약 1~1.5시간)한 뒤 지프로 아스콜레까지 가서(6~9시간) 걷기 시작합니다. 전체 일정은 20~23일이고 걷는 날은 13~14일입니다. 총 거리를 직접 적은 곳은 한 곳(140~150 km)뿐이고, 다른 두 곳은 일별 거리를 더하면 약 185 km와 약 209 km입니다. 하루 걷는 시간은 3~10시간이며 K2 베이스캠프 날이 가장 깁니다.\n높이(m)는 아스콜레 3,000~3,050, 졸라 3,100~3,150, 파이주 3,400~3,480, 우르두카스 4,000~4,200, 콩코르디아 4,500~4,720, 브로드피크 베이스캠프 4,800~5,000, K2 베이스캠프 4,980~5,117입니다.\n숙박은 도시의 호텔을 빼면 전 구간 텐트(캠핑)이고 티하우스는 없습니다. 한 업체는 항공이 끊기면 이슬라마바드~스카르두를 육로로 약 2일(또는 15~18시간)에 간다고 안내합니다.",
      [
        { name: "KE Adventure", url: "https://keadventure.com/holidays/pakistan-karakoram-trekking-k2-concordia" },
        { name: "Jagged Globe", url: "https://www.jagged-globe.co.uk/trek/i/k2+base+camp+baltoro+trek.html" },
        { name: "Mountain Kingdoms", url: "https://www.mountainkingdoms.com/holiday/k2-base-camp-trek" },
        { name: "Adventure Alternative", url: "https://www.adventurealternative.com/pakistan/concordia-k2-base-camp-trek/" },
      ],
    ),
  },

  "goecha-la-trek": {
    distanceKm: r(85, 92),
    durationDays: r(10, 12),
    dailyWalkHours: r(2, 14),
    bestSeason: "3~5월, 9~12월 (업체 안내, 늦가을은 매우 춥다고 함)",
    permits: "외국인은 인너라인 퍼밋(ILP)이 필요하고 외국인 혼자서는 참가할 수 없다고 안내한 업체가 있습니다. 산림 입장료를 육솜에서 낸다고 적은 업체도 있습니다.",
    amenities: ["텐트(2인용)", "트레커 오두막·통나무집", "육솜 게스트하우스·홈스테이"],
    operatorRange: true,
    operatorInfo: info(
      "업체 5곳(Treks and Trails, Bikat Adventures, Himalaya Shelter, Trodly 등록 업체, Ekaxp)의 일정 안내를 비교한 내용입니다.\n일정은 10일이 가장 많고(4곳) 10~12일이며, 걷는 날은 7~9일입니다. 총 거리는 두 곳이 85 km와 92 km로 적었습니다(한 곳은 같은 페이지에서 ‘66 km 이상’이라고도 적었습니다). 하루 걷는 시간은 보통 2~8시간이고, 정상(전망대) 날은 11~14시간입니다.\n높이(m)는 육솜 1,666~1,780, 삭첸 2,195~2,256, 쵸카 2,900~2,984, 페당 3,673~3,690, 종리 3,950~4,020, 종리 탑 4,020~4,203, 탄싱 3,930~3,962, 사미티 4,206~4,298입니다. 트레커가 닿는 전망대는 4,600~4,602 m이고, 한 업체가 적은 고차 라 4,940 m와 4,877 m는 다른 업체와 달라 범위에서 뺐습니다.\n모두 육솜에서 걷기 시작하고, 뉴잘패구리나 실리구리에서 차로 6~8시간 이동합니다. 숙박은 텐트와 오두막이 섞여 있다고 합니다.",
      [
        { name: "Treks and Trails", url: "https://treksandtrails.org/tours/goechala-trek" },
        { name: "Bikat Adventures", url: "https://bikatadventures.com/Home/Itinerary/goechala-trek" },
        { name: "Himalaya Shelter", url: "https://himalayashelter.com/trek/Goechala-Trek" },
        { name: "Trodly", url: "https://trodly.com/activity-166-goechala-pass-trek" },
        { name: "Ekaxp", url: "https://ekaxp.in/experiences/sikkim-tour-packages/mountain-trekker/" },
      ],
    ),
  },

  "manaslu-circuit": {
    distanceKm: 177,
    durationDays: r(12, 16),
    dailyWalkHours: r(3, 11),
    bestSeason: MAR_MAY_SEP_NOV,
    permits: "마나슬루 제한구역 허가(RAP), 마나슬루 보전지역 허가(MCAP), 안나푸르나 보전지역 허가(ACAP)가 필요하고, 면허 가이드 동행과 최소 2인을 필수로 안내한 업체가 여럿입니다.",
    amenities: TEAHOUSE,
    operatorRange: true,
    operatorInfo: info(
      "업체 7곳(6개 회사)의 일정 안내를 비교한 내용입니다.\n카트만두에서 차로 소티 콜라나 마차 콜라까지 간 뒤(6~10시간) 걷고, 12일과 14일 일정이 가장 흔합니다(전체 12~16일, 걷는 날 10~14일). 총 거리를 직접 적은 곳은 한 곳(약 177 km)뿐입니다. 하루 걷는 시간은 3~11시간이고 라르키아 라를 넘는 날은 7~11시간입니다.\n높이(m)는 소티 콜라 710~730, 마차 콜라 760~930, 자갓 1,340~1,410, 뎅 1,800~1,860, 남룽 2,550~2,630, 사마가온 3,520~3,530, 삼도 3,860~3,875(한 곳은 3,680), 다람살라 4,450~4,470, 빔탕 3,700~3,720, 다라파니 1,860~1,900입니다. 라르키아 라는 5,106~5,160 m로 적은 곳이 많고 5,120·5,125·5,135·5,200·5,213으로 적은 곳도 있으며, 한 페이지 안에서 값이 엇갈리는 업체가 많습니다.\n사마가온에서 하루 쉬며 베이스캠프나 비렌드라 호수를 다녀오는 일정이 거의 모든 업체에 있습니다.",
      [
        { name: "Mountmania (1)", url: "https://www.mountmania.com/blog/manaslu-trek-12-days" },
        { name: "Mountmania (2)", url: "https://www.mountmania.com/manaslu-base-camp-trek" },
        { name: "Himalayan Recreation", url: "https://himalayanrecreation.com/tours/manaslu-circuit-trek-14-days" },
        { name: "Heaven Himalaya", url: "https://heavenhimalaya.com/packages/manaslu-circuit-trek/" },
        { name: "Shikhar Adventure", url: "https://shikharadventure.com/blog/manaslu-circuit-itinerary" },
        { name: "Around Manaslu Trek", url: "https://www.aroundmanaslutrek.com/manaslu-trek-itinerary/" },
        { name: "Everest Trekking Routes", url: "https://www.wetravel.com/trips/12-days-manaslu-circuit-trek-everest-trekking-routes-pvt-ltd-39899685" },
      ],
    ),
  },

  "fairy-meadows-trek": {
    durationDays: r(5, 11),
    dailyWalkHours: r(2, 6),
    bestSeason: "4~10월, 여름 중심 (업체 안내)",
    permits: "허가 이름을 적은 업체는 없고, 면허 가이드 동행이 정부 규정이라고 안내한 업체가 있습니다.",
    amenities: ["호텔(칠라스·이슬라마바드)", "오두막·코티지(페어리 메도)", "텐트(베얄 이상)"],
    operatorRange: true,
    operatorInfo: info(
      "업체 약 10곳(Apricot Tours, 10Adventures, KE Adventure, TourRadar에 올린 여러 업체)의 일정 안내를 비교한 내용입니다.\n모두 이슬라마바드에서 출발해 칠라스에서 하룻밤 자고, 카라코람 고속도로에서 라이코트 다리까지 간 뒤 지프로 타토까지 올라가 걷기 시작합니다. 전체 일정은 5~11일이고 걷는 날은 3~4일입니다. 타토에서 페어리 메도까지는 2~4시간(두 업체가 약 5 km로 적음), 베얄까지는 2~4시간, 낭가파르바트 베이스캠프(라이코트 쪽)까지는 한쪽 4~6시간으로 적었습니다.\n높이(m)는 타토 2,800~2,900, 페어리 메도 3,200~3,300, 베얄 3,400~3,650, 베이스캠프 3,500~3,900입니다. 가는 길의 바부사르 고개(4,170~4,173 m)는 차로 넘습니다.\n페어리 메도에서는 오두막이나 코티지에서 자고, 베얄과 베이스캠프에서는 돔 텐트나 캐빈을 쓴다고 합니다.",
      [
        { name: "Apricot Tours (Rakhiot)", url: "https://www.apricottours.pk/tours/rakhiot-peak-trek/" },
        { name: "Apricot Tours (Nanga Parbat BC)", url: "https://www.apricottours.pk/tours/nanga-parbat-base-camp-trek/" },
        { name: "10Adventures", url: "https://www.10adventures.com/tour/fairy-meadows-and-nanga-parbat-base-camp-tour" },
        { name: "KE Adventure", url: "https://www.keadventure.com/holidays/nanga-parbat-fairy-meadows-and-the-rupal-face" },
        { name: "Rock Valley Tours (TourRadar)", url: "https://www.tourradar.com/t/188575" },
        { name: "Gypsy Traces and Tours (TourRadar)", url: "https://www.tourradar.com/t/243673" },
      ],
    ),
  },

  "annapurna-circuit": {
    distanceKm: r(122, 175),
    durationDays: r(14, 15),
    dailyWalkHours: r(3, 10),
    bestSeason: null,
    permits: "안나푸르나 보전지역 허가(ACAP)와 TIMS를 적은 업체가 있습니다. 2023년부터 외국인은 면허 가이드와 걸어야 한다고 안내한 업체가 있습니다.",
    amenities: ["티하우스", "카트만두·포카라 호텔"],
    operatorRange: true,
    operatorInfo: info(
      "업체 5곳(Excellent Himalaya Trek, ACE the Himalaya, Intrepid Travel, White Hill, Sherpa Expedition Teams)의 일정 안내를 비교한 내용입니다.\n전체 일정은 14~15일(한 업체는 12~22일 선택)이고 걷는 날은 9~13일입니다. 거리는 도로가 생긴 구간이 많아 출발점에 따라 크게 달라서, 업체가 적은 값이 122~175 km로 넓습니다. 하루 걷는 시간은 3~10시간이고 토롱 라를 넘는 날(토롱 페디~묵티나트)이 8~10시간으로 가장 깁니다.\n높이(m)는 다라파니 1,860, 차메 2,630~2,670, 피상 3,200~3,300, 마낭 3,540, 약 카르카 4,050, 토롱 페디 4,450~4,525, 묵티나트 3,760~3,800이고 토롱 라는 5,416 m로 5곳 모두 같습니다.\n추천 시기를 적은 업체는 없었고, 11~12월에는 토롱 라에 눈이 흔하며 겨울 눈으로 고개가 막힐 수 있다고 안내합니다.",
      [
        { name: "Excellent Himalaya Trek", url: "https://excellenttrek.com/how-long-annapurna-circuit-trek-distance-in-km-miles" },
        { name: "ACE the Himalaya", url: "https://www.acethehimalaya.com/?p=79989" },
        { name: "Intrepid Travel", url: "https://www.intrepidtravel.com/en/nepal/annapurna-circuit-trek-167247" },
        { name: "White Hill (TourRadar)", url: "https://www.tourradar.com/t/139580" },
        { name: "Sherpa Expedition Teams (TourRadar)", url: "https://www.tourradar.com/t/187981" },
      ],
    ),
  },

  "annapurna-sanctuary": {
    distanceKm: r(81, 110),
    durationDays: r(10, 11),
    dailyWalkHours: r(1.5, 8),
    bestSeason: "3~5월, 9~11월 (업체 안내)",
    permits: "안나푸르나 보전지역 허가(ACAP)가 필요하고, TIMS는 업체마다 필요 여부가 다르게 안내됩니다. 면허 가이드가 필수라고 적은 업체가 여럿입니다.",
    amenities: ["티하우스(롯지) 숙박", "낮은 곳은 개인 방, 높은 곳은 도미토리(업체 안내)"],
    operatorRange: true,
    operatorInfo: info(
      "업체 5곳(Yak & Yeti Trekking, Himalayan Masters, Nepal Alternative Treks, Mountain Mart Treks, Nomad Adventure Treks)의 일정 안내를 비교한 내용입니다. 푼힐을 지나가는 일정이 섞여 있습니다.\n전체 일정은 10~11일이고 걷는 날은 8~10일입니다. 총 거리를 적은 업체는 두 곳(81 km와 약 110 km)이며 서로 다르고 각자의 일별 거리와도 맞지 않습니다. 하루 걷는 시간은 1.5~8시간입니다.\n높이(m)는 나야풀 1,070, 진누 1,600~1,780, 촘롱 2,130~2,210, 밤부 2,300~2,360, 타다파니 2,630~2,650, 고레파니 2,800~2,874, 히말라야 2,840~2,920, 데우랄리 3,200, 푼힐 3,210, 마차푸차레 베이스캠프 3,700~3,730, 안나푸르나 베이스캠프 4,130입니다.\n시작·종료는 나야풀이 가장 흔하고, 푼힐 일정은 고레파니와 타다파니를 거쳐 촘롱으로 이어집니다.",
      [
        { name: "Yak & Yeti Trekking", url: "https://www.yakandyeti.com/annapurna-sanctuary-trek" },
        { name: "Himalayan Masters", url: "https://himalayan-masters.com/trip/annapurna-base-camp-trek/" },
        { name: "Nepal Alternative Treks", url: "https://nepalalternativetreks.com/trip/annapurna-base-camp-with-poon-hill-trek/" },
        { name: "Mountain Mart Treks", url: "https://www.mountainmarttreks.com/trip/10-days-poon-hill-annapurna-base-camp-trek" },
        { name: "Nomad Adventure Treks", url: "https://www.nomadadventuretreks.com/trip/annapurna-base-camp-trek-via-poonhill-10-days" },
      ],
    ),
  },

  "makalu-barun-valley": {
    distanceKm: 216,
    durationDays: r(13, 23),
    dailyWalkHours: r(4, 8),
    bestSeason: MAR_MAY_SEP_NOV,
    permits: "마칼루바룬 국립공원 허가와 마칼루 지방정부 허가가 필요하다고 안내한 업체가 많습니다. 면허 가이드는 필수라는 곳과 권장일 뿐이라는 곳이 갈립니다.",
    amenities: ["티하우스(롯지)", "높은 곳은 캠핑·간이 숙소(업체 안내)", "카트만두 호텔"],
    operatorRange: true,
    operatorInfo: info(
      "업체 6곳(Highland Expeditions, Himalayan Hero, Magical Nepal, Nepal Alternative Treks, Alpine Adventure Club, Jagged Globe)의 일정 안내를 비교한 내용입니다.\n카트만두에서 툼링타르로 비행(약 35~50분)한 뒤 차로 눔, 치칠라, 세두와까지 가서 걷습니다. 전체 일정은 13~23일이고 걷는 날은 10~16일(대부분 일정표로 센 값)입니다. 총 거리를 직접 적은 업체는 한 곳(왕복 약 216 km)뿐입니다. 하루 걷는 시간은 4~8시간입니다.\n높이(m)는 세두와 1,460~1,530, 타시가온 2,065~2,200, 쿵마 단다 3,470~3,562, 도바테 3,500~3,870, 양리 카르카 3,500~3,645, 랑말레 4,400~4,410, 베이스캠프 4,800~4,870(6곳 중 5곳이 4,870)입니다. 업체 머리말의 최고 높이를 5,000~5,517 m로 적은 곳이 있으나 실제 일정의 가장 높은 곳은 베이스캠프(4,800~4,870 m)입니다.",
      [
        { name: "Highland Expeditions", url: "https://highlandexpeditions.com/package/makalu-base-camp-trek/" },
        { name: "Himalayan Hero", url: "https://himalayanhero.com/package/makalu-base-camp-trek/" },
        { name: "Magical Nepal", url: "https://www.magicalnepal.com/trip/makalu-base-camp-trek/" },
        { name: "Nepal Alternative Treks", url: "https://nepalalternativetreks.com/trip/makalu-base-camp-trek/" },
        { name: "Alpine Adventure Club", url: "https://www.alpineadventureclub.com/makalu-base-camp-trek" },
        { name: "Jagged Globe", url: "https://www.jagged-globe.co.uk/trek/i/makalu+base+camp.html" },
      ],
    ),
  },

  "nangpa-la-trek": {
    durationDays: r(22, 26),
    operatorRange: true,
    operatorInfo: info(
      "읽을 수 있는 업체 페이지가 2곳(Shanti Travel, Explore-Share)뿐이라 근거가 약합니다.\n두 곳 모두 카트만두에서 출발하는 22~26일 일정이며 타메 계곡을 지나 낭파 빙하까지 갔다가 렌조 라, 고쿄 방면으로 이어지는 일정입니다. 한 곳(Shanti Travel)은 하루 걷는 시간을 3.5~7시간, 낭파 라 5,716 m, 낭파 라 베이스캠프 5,300 m로 적었습니다. 두 업체 모두 낭파 라(국경)를 직접 넘지 않고 빙하나 고개 아래까지만 간다고 적었습니다. 추천 시기는 한 곳이 1~4월과 10~12월로 적었고, 허가와 총 거리는 적은 곳이 없습니다.\nWorld Expeditions와 Everest Journeys 페이지는 열리지 않아 쓰지 못했습니다.",
      [
        { name: "Shanti Travel", url: "https://www.shantitravel.com/en/trekking-nepal/the-high-passes-of-the-everest" },
        { name: "Explore-Share", url: "https://www.explore-share.com/trip/26-day-trek-nangpa-la-nepal" },
      ],
    ),
  },

  "broad-peak-base-camp": {
    operatorRange: true,
    operatorInfo: info(
      "업체 9곳의 K2·콩코르디아 트레킹 일정을 살펴봤지만, 브로드피크 베이스캠프만 따로 파는 트레킹 상품은 찾지 못했습니다. 모두 K2 트레킹 중 콩코르디아에서 걸어가는 곁가지(숙박 또는 지나가는 길)로 다룹니다.\n콩코르디아에서 걸리는 시간은 2~5시간이고, 하룻밤 자고 가는 곳이 3곳(KE Adventure, Jagged Globe, Mountain Kingdoms), 당일 방문이나 지나가는 길로 다루는 곳이 6곳입니다. 높이는 6곳이 4,800~5,000 m로 적었고 대부분 4,800~4,850 m입니다(Mountain Kingdoms의 5,000 m는 다른 업체와 달라 예외입니다).\n전체 일정·거리·허가는 K2 베이스캠프·발토로 빙하 트레킹 루트와 같습니다.",
      [
        { name: "KE Adventure", url: "https://keadventure.com/holidays/pakistan-karakoram-trekking-k2-concordia" },
        { name: "Jagged Globe", url: "https://www.jagged-globe.co.uk/trek/i/k2+base+camp+baltoro+trek.html" },
        { name: "Mountain Kingdoms", url: "https://www.mountainkingdoms.com/holiday/k2-base-camp-trek" },
        { name: "Adventure Alternative", url: "https://www.adventurealternative.com/pakistan/concordia-k2-base-camp-trek/" },
        { name: "Ian Taylor Trekking", url: "https://iantaylortrekking.com/blog/daily-distances-on-the-k2-base-camp-trek/" },
        { name: "Apricot Tours", url: "https://www.apricottours.pk/tours/gondogoro-la/" },
      ],
    ),
  },

  "shishapangma-base-camp-trek": { dailyWalkHours: r(4, 6) },
};

// ---------------------------------------------------------------------------
// 새로 붙이는 루트 (산 slug → 루트 목록)
// ---------------------------------------------------------------------------
export const EXTRA: Record<string, ExtraRoute[]> = {
  everest: [
    {
      id: "gokyo-lakes-trek",
      name: "고쿄 호수 트레킹 (렌조 라 연계, 에베레스트 지역, 네팔)",
      nameEn: "Gokyo Lakes Trek (with Renjo La, Everest region, Nepal)",
      distanceKm: null,
      durationDays: r(12, 14),
      dailyWalkHours: r(3, 8),
      bestSeason: MAR_MAY_SEP_NOV,
      permits: "사가르마타 국립공원 허가, 쿰부 파상 라무 지방정부 허가가 필요하고 TIMS는 업체마다 다르게 안내됩니다. 가이드 동행이 의무인지는 업체 안내가 서로 다릅니다.",
      amenities: ["티하우스(롯지) 2인 1실", "카트만두 호텔"],
      operatorRange: true,
      source: "트레킹 업체 5곳의 일정 안내를 비교한 범위 (확인일 2026-11-24)",
      operatorInfo: info(
        "업체 5곳(Breeze Adventure, Himalayan Masters, Himalayan Recreation, Heaven Himalaya, Ace the Himalaya)의 일정 안내를 비교한 내용입니다.\n카트만두에서 루클라로 비행해 팍딩, 남체, 도레, 마체르모를 거쳐 고쿄 호수에 오르고, 렌조 라를 넘어 룽덴, 타메로 내려오는 일정입니다. 전체 일정은 12~14일이고 걷는 날은 10~12일입니다. 총 거리는 한 업체가 약 95 km로 적었으나 같은 페이지의 다른 숫자와 어긋나 쓰지 않았습니다. 하루 걷는 시간은 3~8시간이며 렌조 라를 넘는 날은 7~8시간입니다.\n높이(m)는 루클라 2,840~2,860, 팍딩 2,610~2,651, 남체 3,440~3,445, 도레 3,867~4,200, 마체르모 4,455~4,470, 고쿄 4,700~4,790, 고쿄 리 5,357~5,360, 렌조 라 5,340~5,435(한 곳의 5,555는 예외), 룽덴 4,368~4,500, 타메 3,800~3,880입니다.\n성수기에는 루클라 대신 라메차프 공항을 쓰고 4~6시간 차로 이동한다고 안내합니다.",
        [
          { name: "Breeze Adventure", url: "https://www.breezeadventure.com/gokyo-renjo-la-trek" },
          { name: "Himalayan Masters", url: "https://himalayan-masters.com/trip/gokyo-lake-trek" },
          { name: "Himalayan Recreation", url: "https://himalayanrecreation.com/tours/gokyo-renjo-la-pass-trek" },
          { name: "Heaven Himalaya", url: "https://heavenhimalaya.com/packages/gokyo-lake-with-renjo-la-pass-trek/" },
          { name: "Ace the Himalaya", url: "https://www.acethehimalaya.com/?p=52633" },
        ],
      ),
    },
    {
      id: "three-passes-trek",
      name: "쓰리 패스 트레킹 (콩마 라·초 라·렌조 라, 에베레스트 지역, 네팔)",
      nameEn: "Three Passes Trek (Kongma La, Cho La, Renjo La, Everest region, Nepal)",
      distanceKm: r(160, 170),
      durationDays: r(16, 20),
      dailyWalkHours: r(2, 10),
      bestSeason: MAR_MAY_SEP_NOV,
      permits: "사가르마타 국립공원 허가와 쿰부 파상 라무 지방정부 허가가 필요합니다. 면허 가이드가 필수라는 업체와 필수는 아니라는 업체가 갈립니다.",
      amenities: ["티하우스(롯지) 2인 1실", "카트만두 호텔"],
      operatorRange: true,
      source: "트레킹 업체 4곳의 일정 안내를 비교한 범위 (확인일 2026-11-24)",
      operatorInfo: info(
        "업체 4곳(Nepal Alternative Treks, Radiant Treks, Magical Nepal, Weseek Travel)의 일정 안내를 비교한 내용입니다.\n에베레스트 지역에서 콩마 라, 초 라, 렌조 라 세 고개를 넘는 길로, 전체 일정은 16~20일이고 걷는 날은 13~18일입니다. 총 거리는 두 곳이 160~170 km와 166 km로 적었습니다(일정표의 일별 거리를 더하면 125~161 km). 하루 걷는 시간은 2~10시간이고 보통 5~7시간이며, 콩마 라를 넘는 날이 8~10시간으로 가장 깁니다.\n높이(m)는 남체 3,440~3,450, 딩보체 4,360~4,410, 추쿵 4,730~4,750, 로부체 4,900~4,950, 고락셉 5,100~5,180, 종라 4,830~4,855, 고쿄 4,750~4,800, 콩마 라 5,535~5,545, 초 라 5,365~5,420, 렌조 라 5,340~5,465, 칼라파타르 5,545~5,643입니다.\n도는 방향을 적은 업체는 한 곳(시계 방향, 렌조 라가 먼저)뿐이고, 숙박은 티하우스(2인 1실)입니다.",
        [
          { name: "Nepal Alternative Treks", url: "https://nepalalternativetreks.com/trip/everest-three-passes-trek/" },
          { name: "Radiant Treks", url: "https://radianttreks.com/trip/everest-three-high-passes-trek-itinerary/" },
          { name: "Magical Nepal", url: "https://www.magicalnepal.com/trip/everest-three-high-pass-trek/" },
          { name: "Weseek Travel", url: "https://www.weseektravel.com/three-passes-trek-itinerary/" },
        ],
      ),
    },
  ],

  k2: [
    {
      id: "k2-gondogoro-la-trek",
      name: "K2 베이스캠프 + 곤도고로 라 횡단 (후셰 하산, 파키스탄)",
      nameEn: "K2 Base Camp with Gondogoro La crossing (exit via Hushe, Pakistan)",
      distanceKm: null,
      durationDays: r(20, 23),
      dailyWalkHours: r(2, 12),
      bestSeason: "6~9월 (한 업체 안내, 곤도고로 라 눈은 7월 초까지 남는다고 함)",
      permits: "면허 가이드 동행이 정부 규정이라고 안내한 업체가 있고, 고개를 넘으려면 크램폰·하네스·헬멧·아이스액스가 필요하다고 안내합니다.",
      amenities: CAMPING,
      operatorRange: true,
      source: "트레킹 업체 안내를 비교한 범위 (확인일 2026-11-24)",
      operatorInfo: info(
        "업체 6곳(BookATrekking, Himalayan Recreation, Apricot Tours, KE Adventure, Ian Taylor Trekking, Jagged Globe)의 일정 안내를 비교한 내용입니다.\n아스콜레에서 발토로 빙하를 따라 콩코르디아와 K2 베이스캠프까지 갔다가, 알리 캠프에서 곤도고로 라를 넘어 후셰로 내려오는 일정입니다. 전체 일정은 20~23일입니다. 총 거리를 직접 적은 운영 업체는 없어서(블로그 두 곳은 160 km) 비워 두었고, 하루 걷는 시간은 2~12시간이며 고개 넘는 날은 새벽 0~2시에 출발해 8~12시간 걸린다고 합니다.\n곤도고로 라는 5,585 m로 6곳이 적었고 5,680~5,700 m로 적은 곳은 예외입니다. 알리 캠프 4,800~5,000, 후이스팡 4,600~4,833, 달상 4,150~4,200, 사이초 3,350~3,435, 후셰 3,050~3,100 m입니다.\n한 업체(Jagged Globe)는 2022년에 하산 구간의 낙석 위험이 커져 곤도고로 라 일정을 중단했다고 밝혔고, 블로그 한 곳의 작성자는 눈사태 위험으로 고개를 넘지 않았다고 적었습니다.",
        [
          { name: "BookATrekking", url: "https://bookatrekking.com/en/trek/k2-concordia-gondogoro-la-22-days/" },
          { name: "Himalayan Recreation", url: "https://himalayanrecreation.com/tours/k2-base-camp-trek" },
          { name: "Apricot Tours", url: "https://www.apricottours.pk/tours/gondogoro-la/" },
          { name: "KE Adventure", url: "https://www.keadventure.com/holidays/pakistan-climbing-k2-gondogoro-la" },
          { name: "Ian Taylor Trekking", url: "https://iantaylortrekking.com/blog/daily-distances-on-the-k2-base-camp-trek/" },
          { name: "Jagged Globe", url: "https://www.jagged-globe.co.uk/trek/i/k2+base+camp+trek.html" },
        ],
      ),
    },
  ],

  kangchenjunga: [
    {
      id: "kangchenjunga-north-base-camp",
      name: "칸첸중가 북부 베이스캠프(팡페마) 트레킹 (네팔)",
      nameEn: "Kangchenjunga North Base Camp (Pangpema) Trek (Nepal)",
      distanceKm: r(175, 220),
      durationDays: r(18, 28),
      dailyWalkHours: r(2, 10),
      bestSeason: MAR_MAY_SEP_NOV,
      permits: "칸첸중가 보전지역 허가(KCAP)와 제한구역 허가(RAP)가 필요하고, 면허 가이드 동행과 최소 2인이 필수라고 안내한 업체가 여럿입니다.",
      amenities: ["기본 티하우스(롯지)", "높은 곳은 텐트(롯지는 손님이 있을 때만 연다고 함)", "카트만두 호텔"],
      operatorRange: true,
      source: "트레킹 업체 10곳의 일정 안내를 비교한 범위 (확인일 2026-11-24)",
      operatorInfo: info(
        "업체 10곳(Ian Taylor Trekking, Adventure Alternative, Mountain Kingdoms, kimkim, MountainIQ, Nepal Hiking Team, Himalayan Quests, Himalayan Partner, Nepal Trekking Routes, Ace the Himalaya)의 일정 안내를 비교한 내용입니다. 팡페마만 다녀오는 상품은 찾지 못했고 대부분 남·북 베이스캠프를 잇는 일주 상품이라, 전체 일수와 거리는 일주 기준입니다.\n전체 일정은 19~28일(북부만 가는 일정은 18~21일)이고 걷는 날은 12~21일입니다. 총 거리는 세 업체가 175~220 km로 적었습니다. 하루 걷는 시간은 2~10시간이고 보통 4~8시간입니다.\n높이(m)는 군사(Ghunsa) 3,410~3,595, 캄바첸 4,050~4,150, 로낙 4,756~4,792, 팡페마 5,140~5,200입니다. 일부 업체는 팡페마를 4,903, 5,030, 5,063, 5,388로 적었으나 같은 페이지에서도 값이 엇갈려 범위에서 뺐습니다.\n보통 카트만두에서 바드라푸르로 비행(약 45~55분)한 뒤 타플레중까지 차로 8~10시간, 세카툼까지 지프로 5~8시간 이동합니다.",
        [
          { name: "Ian Taylor Trekking", url: "https://iantaylortrekking.com/other-regions/kanchenjunga-trek/kanchenjunga-trek-itinerary/" },
          { name: "Adventure Alternative", url: "https://adventurealternative.com/kanchenjunga-trek/" },
          { name: "Mountain Kingdoms", url: "https://www.mountainkingdoms.com/holiday/kangchenjunga-north-south-base-camps" },
          { name: "kimkim", url: "https://www.kimkim.com/c/kanchenjunga-trekking-itineraries-15-to-24-days" },
          { name: "MountainIQ", url: "https://mountainiq.com/?p=1482" },
          { name: "Nepal Hiking Team", url: "https://nepalhikingteam.com/package/kanchenjunga-base-camp-trek" },
          { name: "Himalayan Quests", url: "https://himalayanquests.com/?p=5350" },
          { name: "Himalayan Partner", url: "https://himalayanpartner.com/trip/kanchenjunga-circuit-trek" },
          { name: "Nepal Trekking Routes", url: "https://nepaltrekkingroutes.com/trip/kanchenjunga-base-camp-trek" },
          { name: "Ace the Himalaya", url: "https://acethehimalaya.com/?p=55405" },
        ],
      ),
    },
    {
      id: "kangchenjunga-south-base-camp",
      name: "칸첸중가 남부 베이스캠프(얄룽·옥탕) 트레킹 (네팔)",
      nameEn: "Kangchenjunga South Base Camp (Yalung/Oktang) Trek (Nepal)",
      distanceKm: null,
      durationDays: r(13, 19),
      dailyWalkHours: r(3, 9),
      bestSeason: MAR_MAY_SEP_NOV,
      permits: "칸첸중가 보전지역 허가(KCAP)와 제한구역 허가(RAP)가 필요하고, 면허 가이드 동행과 최소 2인(혼자 불가)을 안내한 업체가 있습니다.",
      amenities: ["기본 티하우스(2인 1실, 공동 욕실)", "카트만두 3성급 호텔(업체 안내)"],
      operatorRange: true,
      source: "트레킹 업체 6곳의 일정 안내를 비교한 범위 (확인일 2026-11-24)",
      operatorInfo: info(
        "업체 6곳(Magical Nepal, Sherpa Expedition Trekking, Himalayan Adventure Treks, Langtang.com, Kanchenjunga Guides, Himalayan Trekkers)의 일정 안내를 비교한 내용입니다.\n전체 일정은 13~19일(14~16일이 가장 많음)이고 걷는 날은 6~12일(한 업체만 9일이라고 직접 적음)입니다. 총 거리를 적은 곳은 한 곳(170~190 km)뿐인데 그 업체의 일별 거리 합계와 맞지 않아 쓰지 않았습니다. 하루 걷는 시간은 3~9시간이고 보통 4~8시간입니다.\n높이(m)는 얌푸딘 2,080, 토롱딩 2,890~2,995, 체람(체르마) 3,870, 람체 4,580~4,610, 옥탕 4,730~4,780입니다. 일부 업체의 최고 높이 4,160, 5,400 등은 다른 값과 크게 달라 뺐습니다.\n보통 바드라푸르로 비행한 뒤 타플레중까지 차로 8~10시간 이동하고, 얌푸딘이나 야상 근처에서 걷기 시작합니다. 체람·람체·토롱딩은 계절 운영의 기본 티하우스라고 합니다.",
        [
          { name: "Magical Nepal", url: "https://www.magicalnepal.com/trip/kanchenjunga-south-base-camp-trek/" },
          { name: "Sherpa Expedition Trekking", url: "https://sherpaexpeditiontrekking.com/package/16-days-kanchenjunga-south-base-camp-trek" },
          { name: "Himalayan Adventure Treks", url: "https://himalayanadventuretreks.com/tours/kanchenjunga-south-base-camp-trek/" },
          { name: "Langtang.com", url: "https://langtang.com/trip/kanchenjunga-south-base-camp-trek-14-day/" },
          { name: "Kanchenjunga Guides", url: "https://kanchenjungaguides.com/kanchenjunga-south-base-camp-trek" },
          { name: "Himalayan Trekkers", url: "https://himalayantrekkers.com/itinerary/kanchenjunga-south-base-camp-trek" },
        ],
      ),
    },
  ],

  manaslu: [
    {
      id: "tsum-valley-trek",
      name: "춤 밸리 트레킹 (마나슬루 지역, 네팔)",
      nameEn: "Tsum Valley Trek (Manaslu region, Nepal)",
      distanceKm: 130,
      durationDays: r(12, 18),
      dailyWalkHours: r(4, 9),
      bestSeason: MAR_MAY_SEP_NOV,
      permits: "춤 밸리 제한구역 허가와 마나슬루 보전지역 허가(MCAP)가 필요하고, 면허 가이드 동행과 최소 2인을 안내한 업체가 여럿입니다.",
      amenities: ["티하우스(롯지)", "홈스테이(업체 안내)", "카트만두 호텔"],
      operatorRange: true,
      source: "트레킹 업체 5곳의 일정 안내를 비교한 범위 (확인일 2026-11-24)",
      operatorInfo: info(
        "업체 5곳(Nepal Alternative Treks, Himalayan Masters, Windhorse Tours, Outdoor Himalayan, Peregrine Treks)의 일정 안내를 비교한 내용입니다.\n카트만두에서 차로 마차 콜라나 소티 콜라(7~10시간)까지 간 뒤 자갓, 로크파, 춤링, 체캄파르, 닐레를 거쳐 무 곰파까지 올라갔다 돌아오는 일정입니다. 전체 일정은 12~18일이고 걷는 날은 9~11일입니다. 총 거리를 적은 업체는 한 곳(트레킹 약 130 km)뿐입니다. 하루 걷는 시간은 보통 4~9시간입니다(한 업체의 12시간짜리 날은 예외).\n높이(m)는 자갓 1,340~1,410, 로크파 2,240(대부분), 춤링 2,383~2,386, 체캄파르 3,010~3,031, 닐레 3,361, 무 곰파 3,700~3,800입니다.\n한 업체는 춤 밸리 제한구역 허가 요금을 첫 1주 40달러(9~11월) 또는 30달러로 적었습니다.",
        [
          { name: "Nepal Alternative Treks", url: "https://nepalalternativetreks.com/trip/tsum-valley-trek/" },
          { name: "Himalayan Masters", url: "https://himalayan-masters.com/trip/tsum-valley-trek" },
          { name: "Windhorse Tours", url: "https://www.windhorsetours.com/tsum-valley-trek/" },
          { name: "Outdoor Himalayan", url: "https://outdoorhimalayan.com/tsum-valley-trek" },
          { name: "Peregrine Treks", url: "https://peregrinetreks.com/tsum-valley-trekking" },
        ],
      ),
    },
    {
      id: "tsum-manaslu-trek",
      name: "춤 밸리 + 마나슬루 서킷 연계 트레킹 (네팔)",
      nameEn: "Tsum Valley + Manaslu Circuit combined Trek (Nepal)",
      distanceKm: null,
      durationDays: r(18, 21),
      dailyWalkHours: r(3, 10),
      bestSeason: MAR_MAY_SEP_NOV,
      permits: "마나슬루·춤 밸리 제한구역 허가, 마나슬루 보전지역 허가(MCAP), 안나푸르나 보전지역 허가(ACAP)가 필요하고, 면허 가이드 동행을 필수로 안내한 업체가 여럿입니다(한 업체는 권장일 뿐이라고 적음).",
      amenities: ["티하우스(롯지)", "카트만두 호텔"],
      operatorRange: true,
      source: "트레킹 업체 6곳의 일정 안내를 비교한 범위 (확인일 2026-11-24)",
      operatorInfo: info(
        "업체 6곳(Everest Trekking Routes, High Asia Tours, Magical Nepal, Himalayan Adventure Treks, Nepal Guide Treks, Around Manaslu Trek)의 일정 안내를 비교한 내용입니다.\n춤 밸리를 먼저 돌아 나온 뒤 뎅·남룽 근처에서 마나슬루 서킷에 합류해 라르키아 라를 넘는 길입니다. 전체 일정은 18~21일이고 걷는 날은 15~17일(대부분 일정표로 센 값)입니다. 총 거리를 적은 업체는 없었습니다. 하루 걷는 시간은 3~10시간입니다.\n높이(m)는 무 곰파 3,700~3,709, 춤링 2,360~2,386, 체캄파르 3,010~3,031, 닐레 3,361, 남룽 2,630~2,660, 사마가온 3,520~3,530, 삼도 3,860, 다람살라 4,460~4,480, 빔탕 3,590~3,720입니다. 라르키아 라는 6곳 중 5곳이 5,160 m로 적었고 머리말에 5,106·5,167·5,200으로 적은 곳이 있습니다.",
        [
          { name: "Everest Trekking Routes", url: "https://www.everesttrekkingroutes.com/tsum-valley-trek-with-manaslu-circuit/" },
          { name: "High Asia Tours", url: "https://www.highasiatours.com/trip/manaslu-circuit-and-tsum-valley-trek/" },
          { name: "Magical Nepal", url: "https://www.magicalnepal.com/trip/manaslu-circuit-tsum-valley-trek/" },
          { name: "Himalayan Adventure Treks", url: "https://himalayanadventuretreks.com/tours/short-tsum-valley-and-manaslu-circuit-trek" },
          { name: "Nepal Guide Treks", url: "https://nepalguidetreks.com/package/manaslu-circuit-tsum-valley-trek/" },
          { name: "Around Manaslu Trek", url: "https://www.aroundmanaslutrek.com/manaslu-trek-itinerary/" },
        ],
      ),
    },
  ],

  "nanga-parbat": [
    {
      id: "nanga-parbat-rupal-trek",
      name: "낭가파르바트 베이스캠프 트레킹 (루팔 쪽 헤를리코퍼 BC, 파키스탄)",
      nameEn: "Nanga Parbat Base Camp Trek (Rupal side, Herrligkoffer BC, Pakistan)",
      distanceKm: null,
      durationDays: r(12, 14),
      dailyWalkHours: r(3, 6),
      bestSeason: "6~9월 (업체 안내, 일부는 10월까지)",
      permits: "면허 가이드 동행이 정부 규정이라고 안내한 업체가 있고, 허가 이름을 적은 업체는 거의 없습니다.",
      amenities: ["텐트(2인 돔 텐트)", "타라싱 롯지(한 업체)", "아스토르·칠라스 호텔"],
      operatorRange: true,
      source: "트레킹 업체 4곳의 일정 안내를 비교한 범위 (확인일 2026-11-24)",
      operatorInfo: info(
        "업체 4곳(Apricot Tours, KE Adventure, Concordia Expeditions, Jasmine Tours)의 일정 안내를 비교한 내용입니다. 디아미르 쪽 베이스캠프는 순수 트레킹으로 파는 업체가 한 곳뿐이라 이 루트에서 다루지 않았습니다.\n이슬라마바드에서 칠라스, 아스토르를 거쳐 지프로 타라싱 마을까지(3~5시간) 간 뒤 루팔 마을을 지나 헤를리코퍼 베이스캠프로 걷습니다. 루팔 쪽만 가는 일정은 12~14일입니다. 거리는 타라싱~헤를리코퍼가 11 km라고 한 업체(KE)뿐이고 걷는 시간은 3~6시간입니다.\n높이(m)는 타라싱 2,900~2,950, 루팔 마을 3,160~3,200, 헤를리코퍼 베이스캠프 3,600(5곳이 같음), 라토바 3,650, 샤이기리 3,660~3,700입니다.",
        [
          { name: "Apricot Tours", url: "https://www.apricottours.pk/?p=28590" },
          { name: "KE Adventure", url: "https://www.keadventure.com/holidays/nanga-parbat-fairy-meadows-and-the-rupal-face" },
          { name: "Concordia Expeditions", url: "https://concordiaexpeditions.com/pakistan-nanga-parbat-trek.htm" },
          { name: "Jasmine Tours", url: "https://www.jasminetours.com/tour/basho-valley-banak-pass-nanga-parbat-rupal-trek" },
        ],
      ),
    },
  ],

  annapurna: [
    {
      id: "tilicho-lake-trek",
      name: "틸리초 호수 트레킹 (안나푸르나 서킷 연계, 네팔)",
      nameEn: "Tilicho Lake Trek (with the Annapurna Circuit, Nepal)",
      distanceKm: r(120, 180),
      durationDays: r(12, 18),
      dailyWalkHours: r(3, 9),
      bestSeason: "3~5월, 9~11월 (업체 안내, 12~2월은 피하라는 곳이 있음)",
      permits: "안나푸르나 보전지역 허가(ACAP)와 TIMS가 필요하다고 안내한 업체가 있습니다. 가이드 동행은 의무라는 곳과 권장일 뿐이라는 곳이 갈립니다.",
      amenities: ["티하우스(롯지)", "카트만두·포카라 호텔"],
      operatorRange: true,
      source: "트레킹 업체 4곳의 일정 안내를 비교한 범위 (확인일 2026-11-24)",
      operatorInfo: info(
        "업체 4곳(Himalayan Masters, Tidy Himalaya, Alpine Adventure Club, Everest Trekking Routes)의 일정 안내를 비교한 내용입니다.\n안나푸르나 서킷의 길을 따라 마낭까지 간 뒤 칸사르를 거쳐 틸리초 베이스캠프, 틸리초 호수에 다녀옵니다. 전체 일정은 12~18일이고 걷는 날은 9~12일(대부분 일정표로 센 값)입니다. 총 거리를 적은 곳은 두 곳(120 km, 160~180 km)이고 서킷으로 이어지는지에 따라 다릅니다. 하루 걷는 시간은 3~9시간이며 호수에 다녀오는 날이 7~9시간으로 가장 깁니다.\n높이(m)는 마낭 3,519~3,540, 칸사르 3,724~3,734, 틸리초 베이스캠프 4,150, 틸리초 호수 4,919입니다. 호수 날을 마치고 토롱 라(5,416 m)를 넘는 일정이 많고, 메소칸토 라를 대안으로 적은 업체는 고개 높이를 5,099~5,340 m로 서로 다르게 적었습니다.",
        [
          { name: "Himalayan Masters", url: "https://himalayan-masters.com/trip/tilicho-lake-trek" },
          { name: "Tidy Himalaya", url: "https://tidyhimalaya.com/trip/tilicho-lake-trek" },
          { name: "Alpine Adventure Club", url: "https://www.alpineadventureclub.com/tilicho-lake-trek" },
          { name: "Everest Trekking Routes", url: "https://www.everesttrekkingroutes.com/kathmandu-to-tilicho-lake-trek/" },
        ],
      ),
    },
  ],

  "cho-oyu": [
    {
      id: "cho-oyu-tibet-approach",
      name: "초오유 베이스캠프 접근 (티베트 팅그리 출발, 근거 약함)",
      nameEn: "Cho Oyu Base Camp approach (Tibet, from Tingri; weak evidence)",
      distanceKm: null,
      durationDays: null,
      bestSeason: "9~10월 또는 봄·가을 (업체 3곳 안내)",
      permits: "등반 업체는 초오유 등반 허가, 티베트 입경 허가, 연락관을 상품에 포함한다고 안내합니다. 한 업체는 2026·2027년 외국인 입경이 제한되어 공식 발표에 달려 있다고 적었습니다.",
      amenities: ["라싸·시가체·팅그리 호텔", "베이스캠프 이상은 텐트"],
      operatorRange: true,
      source: "등반·트레킹 업체 안내 (확인일 2026-11-24)",
      operatorInfo: info(
        "순수 트레킹 상품으로 읽을 수 있었던 업체는 한 곳(International Mountain Guides)뿐이고, 나머지는 등반 원정 상품의 접근 구간 정보입니다. 그래서 근거가 약합니다.\n카트만두나 라싸에서 시가체, 팅그리로 이동한 뒤 베이스캠프까지는 차로 갈 수 있고, 걷는 구간은 중간 캠프와 전진 베이스캠프까지 이틀 정도입니다. 트레킹 상품의 전체 일정은 28~29일(라싸·카트만두 일정 포함)이고 하루 걷는 시간과 걷는 거리를 적은 업체는 없었습니다.\n높이(m)는 팅그리 4,300~4,350, 중국 측 베이스캠프 4,572~5,100(업체마다 최대 약 530 m 차이), 중간 캠프 5,400~5,450, 전진 베이스캠프 5,600~5,700입니다.",
        [
          { name: "International Mountain Guides (트레킹)", url: "https://www.mountainguides.com/tibet-trek.shtml" },
          { name: "International Mountain Guides (일정)", url: "https://www.mountainguides.com/cho-oyu-itin.shtml" },
          { name: "Highland Expeditions", url: "https://highlandexpeditions.com/package/cho-oyu-expedition/" },
          { name: "8K Expeditions", url: "https://8kexpeditions.com/package/cho-oyu-expedition-8188m" },
          { name: "Asian Hiking Team", url: "https://asianhikingteam.com/cho-oyu-expedition" },
        ],
      ),
    },
  ],
};
