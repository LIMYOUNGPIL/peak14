// 후기 규칙 시험: node --test tests/  (npm test)
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  groupReviews,
  hasMore,
  isOldReview,
  reviewText,
  visibleSlice,
} from "../lib/reviews/rules.ts";
import type { Review } from "../types/review.ts";

let seq = 0;
function review(partial: Partial<Review>): Review {
  seq += 1;
  return {
    id: `r${seq}`,
    routeId: "route",
    origin: "app",
    body: "본문",
    summaryKo: null,
    summaryEn: null,
    writtenYear: 2026,
    createdAt: `2026-01-01T00:00:${String(seq).padStart(2, "0")}Z`,
    language: "ko",
    sentiment: "positive",
    authorNickname: "닉네임",
    rating: 4,
    authorName: null,
    originalUrl: null,
    linkCheckedAt: null,
    ...partial,
  };
}

test("현재 연도 - 작성 연도가 5 이상이면 오래된 후기이다 (경계 확인)", () => {
  assert.equal(isOldReview(2022, 2026), false); // 4년
  assert.equal(isOldReview(2021, 2026), true); // 5년
  assert.equal(isOldReview(2015, 2026), true);
  assert.equal(isOldReview(2026, 2026), false);
});

test("오래된 후기는 기본으로 숨기고 개수를 알려 주며, 켜면 보인다", () => {
  const list = [review({ writtenYear: 2026 }), review({ writtenYear: 2021 }), review({ writtenYear: 2015 })];
  const hidden = groupReviews(list, 2026, false);
  assert.equal(hidden.positive.length, 1);
  assert.equal(hidden.hiddenOldCount, 2);
  const all = groupReviews(list, 2026, true);
  assert.equal(all.positive.length, 3);
  assert.equal(all.hiddenOldCount, 0);
});

test("긍정·부정·중립·판정 중으로 나뉜다", () => {
  const g = groupReviews(
    [
      review({ sentiment: "positive" }),
      review({ sentiment: "negative" }),
      review({ sentiment: "neutral" }),
      review({ sentiment: null }),
    ],
    2026,
    false,
  );
  assert.deepEqual([g.positive.length, g.negative.length, g.neutral.length, g.pending.length], [1, 1, 1, 1]);
});

test("작성 연도가 최근인 순으로 정렬하고, 같은 연도면 나중에 저장된 것이 먼저이다", () => {
  const a = review({ writtenYear: 2024 });
  const b = review({ writtenYear: 2026 });
  const c = review({ writtenYear: 2026 }); // b 보다 나중에 저장됨
  const g = groupReviews([a, b, c], 2026, false);
  assert.deepEqual(g.positive.map((r) => r.id), [c.id, b.id, a.id]);
});

test("처음엔 긍정·부정 1개씩, 더보기를 누를 때마다 5개씩 늘어난다", () => {
  const list = Array.from({ length: 14 }, () => review({}));
  assert.equal(visibleSlice(list, 0).length, 1);
  assert.equal(visibleSlice(list, 1).length, 6);
  assert.equal(visibleSlice(list, 2).length, 11);
  assert.equal(visibleSlice(list, 3).length, 14); // 있는 만큼만
  assert.equal(visibleSlice(list, -1).length, 1); // 잘못된 값은 처음 상태
});

test("더보기 버튼은 긍정·부정 중 한쪽이라도 남아 있을 때만 필요하다", () => {
  const pos = Array.from({ length: 7 }, () => review({ sentiment: "positive" }));
  const neg = [review({ sentiment: "negative" })];
  const g = groupReviews([...pos, ...neg], 2026, false);
  assert.equal(hasMore(g, 0), true); // 긍정 7개 > 1
  assert.equal(hasMore(g, 1), true); // 긍정 7개 > 6
  assert.equal(hasMore(g, 2), false); // 긍정 7개 <= 11
});

test("중립·판정 중 후기는 대표·더보기 개수에 들어가지 않는다", () => {
  const list = [
    ...Array.from({ length: 3 }, () => review({ sentiment: "neutral" })),
    ...Array.from({ length: 3 }, () => review({ sentiment: null })),
    review({ sentiment: "positive" }),
  ];
  const g = groupReviews(list, 2026, false);
  assert.equal(visibleSlice(g.positive, 0).length, 1);
  assert.equal(visibleSlice(g.negative, 0).length, 0); // 부정이 없으면 비어 있고, 화면에서 "부정 후기 없음"
  assert.equal(g.neutral.length, 3);
  assert.equal(g.pending.length, 3);
});

test("글 고르기: 앱 안 후기는 본문, 외부 글은 화면 언어의 요약(없으면 있는 쪽)", () => {
  const app = review({ origin: "app", body: "직접 쓴 글", summaryKo: "무시" });
  assert.equal(reviewText(app, "en"), "직접 쓴 글"); // 앱 안 후기는 번역하지 않는다
  const ext = review({ origin: "external", body: null, summaryKo: "한국어 요약", summaryEn: "English summary", originalUrl: "https://example.com" });
  assert.equal(reviewText(ext, "ko"), "한국어 요약");
  assert.equal(reviewText(ext, "en"), "English summary");
  const onlyKo = review({ origin: "external", body: null, summaryKo: "한국어만", summaryEn: null, originalUrl: "https://example.com" });
  assert.equal(reviewText(onlyKo, "en"), "한국어만");
});
