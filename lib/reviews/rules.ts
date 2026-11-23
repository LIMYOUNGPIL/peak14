// 후기를 어떻게 나누고 몇 개 보여 줄지 정하는 규칙 (PRD 5번 must 2)
//
// 화면과 저장소에 의존하지 않는 순수 계산이라, 규칙이 맞는지 따로 시험할 수 있다. (tests/review-rules.test.mts)
//
// 규칙
//  - 현재 연도 − 작성 연도 ≥ 5 인 후기는 기본으로 숨긴다. ("오래된 후기 보기"를 눌러야 보인다)
//  - 긍정·부정·중립은 AI 판정으로 나누고, 아직 판정 전(null)인 후기는 "판정 중"으로 따로 둔다.
//  - 중립과 판정 중 후기는 대표 후기 2개와 더보기 10개의 개수에 넣지 않는다.
//  - 대표 후기는 긍정 1개, 부정 1개. 작성 연도가 가장 최근인 것(같으면 나중에 저장된 것)을 고른다.
//  - "더보기"를 한 번 누를 때마다 긍정 5개 + 부정 5개가 늘어난다.

import type { Review } from "../../types/review";

export const OLD_REVIEW_YEARS = 5; // 이 연수 이상 지난 후기는 기본으로 숨긴다
export const REPRESENTATIVE_COUNT = 1; // 긍정·부정 각각 처음에 보여 줄 개수
export const MORE_STEP = 5; // 더보기를 한 번 누를 때 긍정·부정 각각 늘어나는 개수

export type ReviewGroups = {
  positive: Review[];
  negative: Review[];
  neutral: Review[];
  pending: Review[]; // 아직 AI 판정 전
  hiddenOldCount: number; // 5년이 지나 숨겨진 후기 수 ("오래된 후기 보기" 버튼에 쓴다)
};

export function isOldReview(writtenYear: number, currentYear: number): boolean {
  return currentYear - writtenYear >= OLD_REVIEW_YEARS;
}

// 작성 연도가 최근인 것이 먼저. 같은 연도면 나중에 저장된 것이 먼저.
function byRecency(a: Review, b: Review): number {
  if (a.writtenYear !== b.writtenYear) return b.writtenYear - a.writtenYear;
  return b.createdAt.localeCompare(a.createdAt);
}

export function groupReviews(
  reviews: Review[],
  currentYear: number,
  includeOld: boolean,
): ReviewGroups {
  const groups: ReviewGroups = {
    positive: [],
    negative: [],
    neutral: [],
    pending: [],
    hiddenOldCount: 0,
  };

  for (const r of [...reviews].sort(byRecency)) {
    if (!includeOld && isOldReview(r.writtenYear, currentYear)) {
      groups.hiddenOldCount += 1;
      continue;
    }
    if (r.sentiment === "positive") groups.positive.push(r);
    else if (r.sentiment === "negative") groups.negative.push(r);
    else if (r.sentiment === "neutral") groups.neutral.push(r);
    else groups.pending.push(r);
  }
  return groups;
}

// 더보기를 presses 번 눌렀을 때 한쪽(긍정 또는 부정)에서 보여 줄 후기
// 처음(0번)에는 1개, 한 번 누르면 6개, 두 번 누르면 11개 ...
export function visibleSlice(list: Review[], presses: number): Review[] {
  const count = REPRESENTATIVE_COUNT + MORE_STEP * Math.max(0, presses);
  return list.slice(0, count);
}

// 더보기를 더 누를 수 있는가 (긍정·부정 중 한쪽이라도 남았으면 true)
export function hasMore(groups: ReviewGroups, presses: number): boolean {
  const shown = REPRESENTATIVE_COUNT + MORE_STEP * Math.max(0, presses);
  return groups.positive.length > shown || groups.negative.length > shown;
}

// 화면에 보여 줄 글: 앱 안 후기는 본문 그대로, 외부 글은 화면 언어에 맞는 요약 (없으면 있는 쪽)
export function reviewText(review: Review, language: "ko" | "en"): string | null {
  if (review.origin === "app") return review.body;
  const preferred = language === "ko" ? review.summaryKo : review.summaryEn;
  return preferred ?? review.summaryKo ?? review.summaryEn;
}
