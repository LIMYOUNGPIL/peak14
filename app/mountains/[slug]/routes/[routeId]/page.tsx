import { Suspense } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import CompareButton from "@/components/CompareButton";
import FavoriteButton from "@/components/FavoriteButton";
import InfoValue from "@/components/InfoValue";
import LoginRequired from "@/components/LoginRequired";
import ShareButton from "@/components/ShareButton";
import RouteVisual from "@/components/RouteVisual";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import { getCurrentUser } from "@/lib/auth/session";
import { getMountain, getRoute } from "@/lib/data/mountains";
import { formatMeasure } from "@/lib/format";
import { submitReview } from "@/lib/reviews/actions";
import { toggleFavorite } from "@/lib/favorites/actions";
import { getMyFavorites } from "@/lib/favorites/queries";
import { getRouteReviews } from "@/lib/reviews/queries";
import { makeT } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { mountainName, routeName, sourceText } from "@/lib/i18n/names";

export default function RoutePage({
  params,
}: PageProps<"/mountains/[slug]/routes/[routeId]">) {
  return (
    <Suspense fallback={null}>
      <RouteDetail params={params} />
    </Suspense>
  );
}

async function RouteDetail({
  params,
}: {
  params: PageProps<"/mountains/[slug]/routes/[routeId]">["params"];
}) {
  const locale = await getLocale();
  const t = makeT(locale);
  const { slug, routeId } = await params;
  const mountain = getMountain(slug);
  if (!mountain) notFound();
  const route = getRoute(mountain, routeId);
  if (!route) notFound();

  // 로그인하지 않았다면 세부 정보를 보내지 않고 로그인 안내만 보여 준다. (안전 유의사항은 건수만)
  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <Link
          href={`/mountains/${mountain.slug}`}
          className="text-sm text-zinc-500 hover:underline"
        >
          ← {mountainName(mountain, locale)}
        </Link>
        <div className="mt-4">
          <LoginRequired
            routeName={routeName(route, locale)}
            safetyCount={route.safetyNotes.length}
            next={`/mountains/${mountain.slug}/routes/${route.id}`}
          />
        </div>
      </main>
    );
  }

  // 이 루트의 후기 (로그인한 사용자만 읽을 수 있다). 올해는 서버가 정해서 화면에 넘긴다.
  const reviews = await getRouteReviews(route.id);
  const isFavorite = (await getMyFavorites(user.id)).some((f) => f.route_id === route.id);
  const currentYear = new Date().getUTCFullYear();

  // 값이 없으면 InfoValue 가 "정보 없음"으로 보여 준다.
  const rows: [string, ReactNode][] = [
    [
      t("route.distance"),
      <InfoValue locale={locale}
        key="distance"
        value={formatMeasure(route.distanceKm)}
        unit={t("route.unitKm")}
      />,
    ],
    [
      t("route.duration"),
      <InfoValue locale={locale}
        key="duration"
        value={formatMeasure(route.durationDays)}
        unit={t("route.unitDays")}
      />,
    ],
    [
      t("route.lodging"),
      <InfoValue locale={locale}
        key="lodging"
        value={route.lodgingCount}
        unit={t("route.unitPlaces")}
      />,
    ],
    [
      t("route.amenities"),
      <InfoValue locale={locale} key="amenities" value={route.amenities?.join(", ")} />,
    ],
    [
      t("route.difficulty"),
      <span key="difficulty" className="flex flex-col items-end gap-0.5">
        <InfoValue locale={locale}
          value={
            route.difficulty === null
              ? null
              : "★".repeat(route.difficulty) + "☆".repeat(5 - route.difficulty)
          }
        />
        {/* 난이도에는 근거(출처와 기준일)를 함께 보여 준다. 근거가 없으면 난이도 자체가 "정보 없음"이다. */}
        {route.difficulty !== null && (
          <span className="text-xs font-normal text-zinc-500">
            {t("route.difficultyBasis")}:{" "}
            <InfoValue locale={locale} value={sourceText(route.difficultySource, locale)} /> · {t("route.asOf")}:{" "}
            <InfoValue locale={locale} value={route.difficultyAsOf} />
          </span>
        )}
      </span>,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link
        href={`/mountains/${mountain.slug}`}
        className="text-sm text-zinc-500 hover:underline"
      >
        ← {mountainName(mountain, locale)}
      </Link>

      <h1 className="mt-4 mb-8 text-3xl font-bold tracking-tight">
        {routeName(route, locale)}
      </h1>

      <div className="mb-8 -mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <FavoriteButton
          mountainSlug={mountain.slug}
          routeId={route.id}
          initial={isFavorite}
          action={toggleFavorite}
          text={{ add: t("favorites.add"), remove: t("favorites.remove"), limit: t("favorites.limit"), failed: t("favorites.failed") }}
        />
        <ShareButton label={t("share.button")} title={routeName(route, locale)} copied={t("share.copied")} failed={t("share.failed")} />
        <CompareButton
          routeId={route.id}
          text={{
            add: t("compare.add"), remove: t("compare.remove"), full: t("compare.full"),
            compare: t("compare.go"), clear: t("compare.clear"), count: t("compare.count"),
          }}
        />
      </div>

      {/* 루트 한눈에 보기: 산 위치 지도와 고도 그래프 (첫 화면과 같은 새벽 노을빛) */}
      <RouteVisual mountain={mountain} route={route} locale={locale} />

      {/* 루트 개요: 출처에 적힌 사실을 한국어로 옮긴 글 (AI가 옮겼다는 표시와 원문 링크 포함) */}
      {route.overview && (
        <section className="mb-8 rounded-xl bg-black/[.04] p-5 dark:bg-white/[.06]">
          <h2 className="mb-3 text-lg font-semibold">{t("route.overviewTitle")}</h2>
          <div className="space-y-3 text-[15px] leading-7">
            {route.overview.text.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          <p className="mt-4 border-t border-black/10 pt-3 text-xs text-zinc-500 dark:border-white/15">
            {route.operatorRange ? t("route.overviewNoteOperator") : t("route.overviewNote")}{" "}
            {!route.operatorRange && <a
              href={route.overview.source}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {t("route.overviewSource")}
            </a>}{" "}
            ({route.overview.asOf})
          </p>
        </section>
      )}

      <dl className="divide-y divide-black/10 rounded-xl border border-black/10 dark:divide-white/15 dark:border-white/15">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-zinc-500">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      {route.operatorRange && (
        <p className="mt-2 text-xs text-zinc-500">{t("route.rangeNote")}</p>
      )}

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">{t("route.safetyTitle")}</h2>
        {/* 안전을 보증하지 않는다는 점을 항상 알린다. (PRD 6번: 의료·안전 보증 금지) */}
        <p className="mb-3 text-sm text-zinc-500">{t("route.safetyDisclaimer")}</p>
        {route.safetyNotes.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            <InfoValue locale={locale} value={null} />
          </p>
        ) : (
          <ul className="list-disc space-y-2 pl-5">
            {route.safetyNotes.map((note) => (
              <li key={note.text}>
                {note.text}
                {locale === "ko" && note.textKo && (
                  <span className="mt-1 block text-[15px]">
                    <span className="mr-1 rounded-full bg-black/[.06] px-2 py-0.5 text-xs text-zinc-500 dark:bg-white/[.1]">
                      {t("route.koTranslation")}
                    </span>
                    {note.textKo}
                  </span>
                )}
                <span className="block text-sm text-zinc-500">
                  {note.language === "en" && <>{t("route.originalEnglish")} · </>}
                  {t("route.source")}: {sourceText(note.source, locale)} · {t("route.asOf")}:{" "}
                  {note.asOf}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 후기 목록: 긍정·부정 대표 후기와 더보기, 중립·판정 중 구역, 5년 지난 후기 숨김 */}
      <ReviewList reviews={reviews ?? []} loadFailed={reviews === null} currentYear={currentYear} locale={locale} />

      {/* 후기 쓰기: 로그인한 사용자만 이 화면에 들어올 수 있다. */}
      <section className="mt-10">
        <h2 className="mb-2 text-lg font-semibold">{t("review.writeTitle")}</h2>
        <p className="mb-4 text-sm text-zinc-500">{t("review.writeHint")}</p>
        <ReviewForm
          action={submitReview}
          mountainSlug={mountain.slug}
          routeId={route.id}
          text={{
            rating: t("review.rating"),
            ratingLabels: [1, 2, 3, 4, 5].map((n) => t("review.ratingLabel", { n })),
            body: t("review.body"),
            placeholder: t("review.bodyPlaceholder"),
            counter: t("review.counter", { n: "{n}" }),
            submit: t("review.submit"),
            submitting: t("review.submitting"),
          }}
        />
      </section>

      <p className="mt-8 text-sm text-zinc-500">
        {t("route.source")}: <InfoValue locale={locale} value={sourceText(route.source, locale)} /> ·{" "}
        {t("route.asOf")}: <InfoValue locale={locale} value={route.asOf} />
      </p>
    </main>
  );
}
