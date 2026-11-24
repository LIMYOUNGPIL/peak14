"use client";

// 루트 후기 목록 (PRD 5번 must 2, DESIGN 3.3)
//
// - 긍정과 부정을 나란히 보여 준다. 처음에는 각각 1개(대표 후기)이고, "더보기"를 누를 때마다 5개씩 늘어난다.
// - 중립 후기는 개수에 넣지 않고 아래에 따로 보여 준다. AI 판정 전인 후기는 "판정 중"으로 따로 둔다.
// - 작성한 지 5년 이상 지난 후기는 기본으로 숨기고, "오래된 후기 보기"를 눌러야 보인다.
// - 한쪽 후기가 없으면 숨기지 않고 "긍정 후기 없음"/"부정 후기 없음"으로 알려 준다.
// - 후기 글은 항상 글자로만 그린다. (HTML 로 해석하지 않는다)
//
// 규칙 계산은 lib/reviews/rules.ts (시험 있음)에 있고, 여기서는 화면만 그린다.

import { useState } from "react";
import { t } from "@/lib/i18n/messages";
import { groupReviews, hasMore, reviewText, visibleSlice } from "@/lib/reviews/rules";
import type { Review } from "@/types/review";

type Props = {
  reviews: Review[];
  currentYear: number; // 서버가 정한 올해 (서버와 화면의 계산이 어긋나지 않도록 넘겨받는다)
};

function ReviewCard({ review }: { review: Review }) {
  const external = review.origin === "external";
  const overseas = review.language !== "ko";
  const text = reviewText(review, "ko");
  // 원문 링크는 https 주소만 연다. (저장소도 막지만 화면에서도 한 번 더 확인한다)
  const safeLink =
    review.originalUrl && review.originalUrl.startsWith("https://") ? review.originalUrl : null;

  return (
    <article className="rounded-xl border border-black/10 p-4 dark:border-white/15">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
        {!external && review.rating !== null && (
          <span className="text-amber-500" aria-label={t("reviews.rating", { n: review.rating })}>
            {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
          </span>
        )}
        <span>{t("reviews.year", { year: review.writtenYear })}</span>
        <span className="rounded-full bg-black/[.06] px-2 py-0.5 dark:bg-white/[.1]">
          {external ? t("reviews.external") : t("reviews.fromApp")}
        </span>
        {(external || overseas) && (
          <span className="rounded-full bg-black/[.06] px-2 py-0.5 dark:bg-white/[.1]">
            {t("reviews.originalLanguage", {
              lang: review.language === "ko" ? t("reviews.langKo") : t("reviews.langEn"),
            })}
          </span>
        )}
        {overseas && (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-700 dark:text-amber-300">
            {t("reviews.overseas")}
          </span>
        )}
      </div>

      <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-7">
        {text ?? t("common.noInfo")}
      </p>

      <div className="mt-2 text-xs text-zinc-500">
        {external ? (
          <>
            <span>{t("reviews.aiSummary")}</span>
            {review.authorName && <> · {t("reviews.writer", { name: review.authorName })}</>}
            {safeLink && (
              <>
                {" · "}
                <a href={safeLink} target="_blank" rel="noopener noreferrer" className="underline">
                  {t("reviews.sourceLink")}
                </a>
              </>
            )}
            {review.linkCheckedAt && <> · {t("reviews.linkChecked", { date: review.linkCheckedAt })}</>}
            {review.license === "CC BY-SA 4.0" && (
              <>
                {" · "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {t("reviews.license", { name: review.license })}
                </a>
                <span className="mt-1 block">{t("reviews.shareAlike")}</span>
              </>
            )}
          </>
        ) : (
          review.authorNickname && <span>{review.authorNickname}</span>
        )}
      </div>
    </article>
  );
}

function Column({
  title,
  count,
  emptyText,
  items,
}: {
  title: string;
  count: number;
  emptyText: string;
  items: Review[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">
        {title} <span className="font-normal text-zinc-500">({count})</span>
      </h3>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/20 p-4 text-sm text-zinc-500 dark:border-white/20">
          {emptyText}
        </p>
      ) : (
        items.map((r) => <ReviewCard key={r.id} review={r} />)
      )}
    </div>
  );
}

export default function ReviewList({ reviews, currentYear }: Props) {
  const [presses, setPresses] = useState(0); // "더보기"를 누른 횟수
  const [includeOld, setIncludeOld] = useState(false); // 5년 지난 후기 보기

  const groups = groupReviews(reviews, currentYear, includeOld);
  const totalVisible =
    groups.positive.length + groups.negative.length + groups.neutral.length + groups.pending.length;
  // 5년이 지나 기본으로 숨겨지는 후기 수. 보기를 켜 두었을 때도 버튼 글자에 쓰기 위해 항상 따로 계산한다.
  const oldCount = groupReviews(reviews, currentYear, false).hiddenOldCount;

  return (
    <section className="mt-10">
      <h2 className="mb-1 text-lg font-semibold">{t("reviews.title")}</h2>
      <p className="mb-4 text-xs text-zinc-500">{t("reviews.aiNote")}</p>

      {totalVisible === 0 ? (
        <p className="rounded-xl border border-dashed border-black/20 p-5 text-zinc-600 dark:border-white/20 dark:text-zinc-400">
          {t("reviews.none")}
        </p>
      ) : (
        <>
          {/* 긍정·부정 나란히 */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Column
              title={t("reviews.positive")}
              count={groups.positive.length}
              emptyText={t("reviews.noPositive")}
              items={visibleSlice(groups.positive, presses)}
            />
            <Column
              title={t("reviews.negative")}
              count={groups.negative.length}
              emptyText={t("reviews.noNegative")}
              items={visibleSlice(groups.negative, presses)}
            />
          </div>

          {hasMore(groups, presses) && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setPresses((p) => p + 1)}
                className="rounded-full border border-black/15 px-5 py-2 text-sm transition-colors hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]"
              >
                {t("reviews.more")}
              </button>
            </div>
          )}

          {/* 중립 후기: 대표·더보기 개수에 넣지 않고 따로 보여 준다 */}
          {groups.neutral.length > 0 && (
            <div className="mt-8 space-y-3">
              <h3 className="text-sm font-semibold">
                {t("reviews.neutral")}{" "}
                <span className="font-normal text-zinc-500">({groups.neutral.length})</span>
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {groups.neutral.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            </div>
          )}

          {/* AI 판정 전인 후기 */}
          {groups.pending.length > 0 && (
            <div className="mt-8 space-y-3">
              <h3 className="text-sm font-semibold">
                {t("reviews.pending")}{" "}
                <span className="font-normal text-zinc-500">({groups.pending.length})</span>
              </h3>
              <p className="text-xs text-zinc-500">{t("reviews.pendingNote")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {groups.pending.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 5년이 지난 후기 */}
      {oldCount > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-zinc-500">
          <span>{includeOld ? t("reviews.oldShown") : t("reviews.oldNote", { count: oldCount })}</span>
          <button
            type="button"
            onClick={() => {
              setIncludeOld((v) => !v);
              setPresses(0);
            }}
            className="rounded-full border border-black/15 px-4 py-1.5 text-foreground transition-colors hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]"
          >
            {includeOld ? t("reviews.hideOld") : t("reviews.showOld", { count: oldCount })}
          </button>
        </div>
      )}
    </section>
  );
}
