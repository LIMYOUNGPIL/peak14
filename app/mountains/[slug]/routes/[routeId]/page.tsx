import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMountain, getRoute } from "@/lib/mountains";

const NO_INFO = "정보 없음";

function show(value: string | number | null, unit = ""): string {
  return value === null ? NO_INFO : `${value}${unit}`;
}

export default function RoutePage({
  params,
}: PageProps<"/mountains/[slug]/routes/[routeId]">) {
  return (
    <Suspense
      fallback={<p className="px-6 py-12 text-zinc-500">불러오는 중...</p>}
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

  const rows: [string, string][] = [
    ["거리", show(route.distanceKm, " km")],
    ["소요 시간", show(route.durationDays, "일")],
    ["숙소 개수", show(route.lodgingCount, "곳")],
    [
      "편의시설",
      route.amenities === null ? NO_INFO : route.amenities.join(", "),
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
        <h2 className="mb-3 text-lg font-semibold">안전 유의사항</h2>
        {route.safetyNotes === null || route.safetyNotes.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">{NO_INFO}</p>
        ) : (
          <ul className="list-disc space-y-1 pl-5">
            {route.safetyNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-sm text-zinc-500">
        출처: {show(route.source)} · 기준일: {show(route.asOf)}
      </p>
    </main>
  );
}
