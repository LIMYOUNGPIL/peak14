// 후기·즐겨찾기·삭제 요청 데이터 구조 (DESIGN 4번)
// 이 타입들은 저장소(Supabase)에 저장되는 데이터의 모양이다.

// 후기 판정: AI가 정한다. null 은 아직 판정 전("판정 중"으로 표시).
export type ReviewSentiment = "positive" | "negative" | "neutral";

// 후기 출처: 앱 안에서 쓴 후기 / 외부 글을 요약한 후기
export type ReviewOrigin = "app" | "external";

// 화면 언어: 한국어와 영어까지만 지원한다.
export type Language = "ko" | "en";

export type Review = {
  id: string;
  routeId: string; // 어느 루트의 후기인지
  origin: ReviewOrigin;
  body: string | null; // 앱 안 후기: 작성자가 쓴 본문 (원문 그대로)
  summaryKo: string | null; // 외부 글: AI 요약 한국어판
  summaryEn: string | null; // 외부 글: AI 요약 영어판
  writtenYear: number; // 작성 연도 (현재 연도 - 작성 연도 ≥ 5 이면 기본으로 숨김)
  createdAt: string; // 저장된 시각 (같은 연도 안에서 최신 순으로 정렬할 때 쓴다)
  language: Language; // 후기 원문의 언어
  sentiment: ReviewSentiment | null; // AI 판정 (null = 판정 중)

  // 앱 안 후기에만 있는 값
  authorNickname: string | null; // 실명이 아니라 닉네임만 보여 준다
  rating: number | null; // 별점 1~5. 판정 기준으로 쓰지 않는다

  // 외부 글에만 있는 값
  authorName: string | null; // 글쓴이 표기 (프로필 정보는 저장하지 않는다)
  originalUrl: string | null; // 원문 링크
  linkFailedAt: string | null; // 원문 링크가 열리지 않은 것으로 확인된 날. 있으면 "원문을 확인할 수 없습니다"를 띄운다
  linkCheckedAt: string | null; // 원문 링크를 마지막으로 확인한 날 (YYYY-MM-DD)
  license: string | null; // 원문 라이선스 (예: CC BY-SA 4.0)
};

// 즐겨찾기: 로그인한 사용자가 산 또는 루트를 저장
export type Favorite = {
  id: string;
  userId: string;
  mountainSlug: string;
  routeId: string | null; // null 이면 산 전체를 저장한 것
};

// 외부 글 삭제 요청: 원문 글쓴이나 사이트 운영자가 보낸다
export type DeletionRequest = {
  id: string;
  reviewId: string; // 삭제를 요청한 요약
  requesterType: "author" | "site-owner";
  receivedAt: string; // 접수일 (YYYY-MM-DD)
  status: "received" | "done";
};
