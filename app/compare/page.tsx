import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import InfoValue from "@/components/InfoValue";
import { getCurrentUser } from "@/lib/auth/session";
import { findRoute } from "@/lib/data/mountains";
import { formatMeasure } from "@/lib/format";
import { makeT, type Locale } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { mountainName, routeName, sourceText } from "@/lib/i18n/names";
import type { Route } from "@/types/mountain";

export const metadata: Metadata = { title: "Peak14" };

export default function ComparePage({ searchParams }: PageProps<"/compare">) {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
      <Suspense fallback={null}>
        <Compare searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

// 난이도·값 칸을 같은 모양으로 그린다. 값이 없으면 "정보 없음". 어느 쪽이 낫다고 강조하지 않는다.
function cells(route: Route, locale: Locale): ReactNode[] {
  const t = makeT(locale);
  return [
    <InfoValue locale={locale} key="d" value={formatMeasure(route.distanceKm)} unit={t("route.unitKm")} />,
    <InfoValue locale={locale} key="t" value={formatMeasure(route.durationDays)} unit={t("route.unitDays")} />,
    <InfoValue locale={locale} key="l" value={route.lodgingCount} unit={t("route.unitPlaces")} />,
    <InfoValue locale={locale} key="a" value={route.amenities?.join(", ")} />,
    <span key="f" className="flex flex-col gap-0.5">
      <InfoValue locale={locale} value={route.difficulty === null ? null : "★".repeat(route.difficulty) + "☆".repeat(5 - route.difficulty)} />
      {route.difficulty !== null && (
        <span className="text-xs text-zinc-500">{t("route.difficultyBasis")}: <InfoValue locale={locale} value={sourceText(route.difficultySource, locale)} /> · {t("route.asOf")}: <InfoValue locale={locale} value={route.difficultyAsOf} /></span>
      )}
    </span>,
    <span key="s">{route.safetyNotes.length > 0 ? t("compare.safetyCount", { count: route.safetyNotes.length }) : t("gate.safetyNone")}</span>,
  ];
}

async function Compare({ searchParams }: { searchParams: PageProps<"/compare">["searchParams"] }) {
  const locale = await getLocale();
  const t = makeT(locale);
  const { a, b } = await searchParams;
  const idA = typeof a === "string" ? a : "";
  const idB = typeof b === "string" ? b : "";

  // 로그인한 사용자만 쓸 수 있다.
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/compare?a=${encodeURIComponent(idA)}&b=${encodeURIComponent(idB)}`)}`);

  const left = findRoute(idA);
  const right = findRoute(idB);

  if (!left || !right || idA === idB) {
    return (
      <>
        <h1 className="mb-3 text-2xl font-bold">{t("compare.title")}</h1>
        <p className="rounded-xl border border-dashed border-black/20 p-5 text-zinc-600 dark:border-white/20 dark:text-zinc-400">{t("compare.howTo")}</p>
        <Link href="/" className="mt-4 inline-block text-sm underline">{t("compare.toHome")}</Link>
      </>
    );
  }

  const labels = [t("route.distance"), t("route.duration"), t("route.lodging"), t("route.amenities"), t("route.difficulty"), t("compare.safety")];
  const l = cells(left.route, locale);
  const r = cells(right.route, locale);

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">{t("compare.title")}</h1>
      <p className="mb-6 text-sm text-zinc-500">{t("compare.note")}</p>
      <div className="overflow-x-auto rounded-xl border border-black/10 dark:border-white/15">
        <table className="w-full min-w-[34rem] border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-b border-black/10 dark:border-white/15">
              <th className="w-28 px-4 py-3" />
              {[left, right].map(({ mountain, route }) => (
                <th key={route.id} className="px-4 py-3 align-top font-semibold">
                  <Link href={`/mountains/${mountain.slug}/routes/${route.id}`} className="hover:underline">{routeName(route, locale)}</Link>
                  <span className="block text-xs font-normal text-zinc-500">{mountainName(mountain, locale)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-white/15">
            {labels.map((label, i) => (
              <tr key={label}>
                <th scope="row" className="px-4 py-3 align-top font-normal text-zinc-500">{label}</th>
                <td className="px-4 py-3 align-top">{l[i]}</td>
                <td className="px-4 py-3 align-top">{r[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-zinc-500">{t("compare.sources")}</p>
    </>
  );
}
