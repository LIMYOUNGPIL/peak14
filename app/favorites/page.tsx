import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getMountain, getRoute } from "@/lib/data/mountains";
import { getMyFavorites } from "@/lib/favorites/queries";
import { makeT } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { mountainName, routeName } from "@/lib/i18n/names";

export const metadata: Metadata = { title: "Peak14" };

export default function FavoritesPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Suspense fallback={null}>
        <List />
      </Suspense>
    </main>
  );
}

async function List() {
  const locale = await getLocale();
  const t = makeT(locale);
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/favorites")}`);
  const rows = await getMyFavorites(user.id);

  // 데이터에서 사라진 산·루트는 건너뛴다.
  const items = rows.flatMap((r) => {
    const mountain = getMountain(r.mountain_slug);
    if (!mountain) return [];
    if (r.route_id === null) return [{ key: `m-${mountain.slug}`, href: `/mountains/${mountain.slug}`, title: mountainName(mountain, locale), sub: t("favorites.mountain") }];
    const route = getRoute(mountain, r.route_id);
    return route ? [{ key: `r-${route.id}`, href: `/mountains/${mountain.slug}/routes/${route.id}`, title: routeName(route, locale), sub: mountainName(mountain, locale) }] : [];
  });

  const heading = <h1 className="mb-6 text-2xl font-bold">{t("favorites.title")}</h1>;
  if (items.length === 0) {
    return <>{heading}<p className="rounded-xl border border-dashed border-black/20 p-5 text-zinc-600 dark:border-white/20 dark:text-zinc-400">{t("favorites.empty")}</p></>;
  }
  return (
    <>
    {heading}
    <ul className="space-y-3">
      {items.map((i) => (
        <li key={i.key}>
          <Link href={i.href} className="block rounded-xl border border-black/10 p-4 transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]">
            <span className="font-semibold">{i.title}</span>
            <span className="mt-1 block text-sm text-zinc-500">{i.sub}</span>
          </Link>
        </li>
      ))}
    </ul>
    </>
  );
}
