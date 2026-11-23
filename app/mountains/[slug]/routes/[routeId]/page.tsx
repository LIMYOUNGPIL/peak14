import { Suspense } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import InfoValue from "@/components/InfoValue";
import { getMountain, getRoute } from "@/lib/data/mountains";
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

  // 값이 없으면 InfoValue 가 "정보 없음"으로 보여 준다.
  const rows: [string, ReactNode][] = [
    [
      t("route.distance"),
      <InfoValue
        key="distance"
        value={route.distanceKm}
        unit={t("route.unitKm")}
      />,
    ],
    [
      t("route.duration"),
      <InfoValue
        key="duration"
        value={route.durationDays}
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
      <InfoValue
        key="difficulty"
        value={
          route.difficulty === null
            ? null
            : "★".repeat(route.difficulty) + "☆".repeat(5 - route.difficulty)
        }
      />,
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
        <h2 className="mb-3 text-lg font-semibold">{t("route.safetyTitle")}</h2>
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
                  {t("route.source")}: {note.source} · {t("route.asOf")}:{" "}
                  {note.asOf}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-sm text-zinc-500">
        {t("route.source")}: <InfoValue value={route.source} /> ·{" "}
        {t("route.asOf")}: <InfoValue value={route.asOf} />
        {route.difficulty !== null && (
          <>
            {" "}
            · {t("route.difficultySource")}:{" "}
            <InfoValue value={route.difficultySource} />
          </>
        )}
      </p>
    </main>
  );
}
