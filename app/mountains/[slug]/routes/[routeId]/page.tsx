import { Suspense } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import InfoValue from "@/components/InfoValue";
import LoginRequired from "@/components/LoginRequired";
import ReviewForm from "@/components/ReviewForm";
import { getCurrentUser } from "@/lib/auth/session";
import { getMountain, getRoute } from "@/lib/data/mountains";
import { formatMeasure } from "@/lib/format";
import { submitReview } from "@/lib/reviews/actions";
import { t } from "@/lib/i18n/messages";

export default function RoutePage({
  params,
}: PageProps<"/mountains/[slug]/routes/[routeId]">) {
  return (
    <Suspense
      fallback={
        <p className="px-6 py-12 text-zinc-500">{t("common.loading")}</p>
      }
    >
      <RouteDetail params={params} />
    </Suspense>
  );
}

async function RouteDetail({
  params,
}: {
  params: PageProps<"/mountains/[slug]/routes/[routeId]">["params"];
}) {
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
          ← {mountain.nameKo}
        </Link>
        <div className="mt-4">
          <LoginRequired
            routeName={route.name}
            safetyCount={route.safetyNotes.length}
            next={`/mountains/${mountain.slug}/routes/${route.id}`}
          />
        </div>
      </main>
    );
  }

  // 값이 없으면 InfoValue 가 "정보 없음"으로 보여 준다.
  const rows: [string, ReactNode][] = [
    [
      t("route.distance"),
      <InfoValue
        key="distance"
        value={formatMeasure(route.distanceKm)}
        unit={t("route.unitKm")}
      />,
    ],
    [
      t("route.duration"),
      <InfoValue
        key="duration"
        value={formatMeasure(route.durationDays)}
        unit={t("route.unitDays")}
      />,
    ],
    [
      t("route.lodging"),
      <InfoValue
        key="lodging"
        value={route.lodgingCount}
        unit={t("route.unitPlaces")}
      />,
    ],
    [
      t("route.amenities"),
      <InfoValue key="amenities" value={route.amenities?.join(", ")} />,
    ],
    [
      t("route.difficulty"),
      <span key="difficulty" className="flex flex-col items-end gap-0.5">
        <InfoValue
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
            <InfoValue value={route.difficultySource} /> · {t("route.asOf")}:{" "}
            <InfoValue value={route.difficultyAsOf} />
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
        ← {mountain.nameKo}
      </Link>

      <h1 className="mt-4 mb-8 text-3xl font-bold tracking-tight">
        {route.name}
      </h1>

      <dl className="divide-y divide-black/10 rounded-xl border border-black/10 dark:divide-white/15 dark:border-white/15">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-5 py-3">
            <dt className="text-zinc-500">{label}</dt>
            <dd className="text-right font-medium">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-8">
        <h2 className="mb-2 text-lg font-semibold">{t("route.safetyTitle")}</h2>
        {/* 안전을 보증하지 않는다는 점을 항상 알린다. (PRD 6번: 의료·안전 보증 금지) */}
        <p className="mb-3 text-sm text-zinc-500">{t("route.safetyDisclaimer")}</p>
        {route.safetyNotes.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            <InfoValue value={null} />
          </p>
        ) : (
          <ul className="list-disc space-y-2 pl-5">
            {route.safetyNotes.map((note) => (
              <li key={note.text}>
                {note.text}
                <span className="block text-sm text-zinc-500">
                  {note.language === "en" && <>{t("route.originalEnglish")} · </>}
                  {t("route.source")}: {note.source} · {t("route.asOf")}:{" "}
                  {note.asOf}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 후기 쓰기: 로그인한 사용자만 이 화면에 들어올 수 있다. 후기 목록은 PLAN 12번에서 만든다. */}
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
        {t("route.source")}: <InfoValue value={route.source} /> ·{" "}
        {t("route.asOf")}: <InfoValue value={route.asOf} />
      </p>
    </main>
  );
}
