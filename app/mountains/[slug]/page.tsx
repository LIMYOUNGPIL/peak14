import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShareButton from "@/components/ShareButton";
import FavoriteButton from "@/components/FavoriteButton";
import { getCurrentUser } from "@/lib/auth/session";
import { getMountain, mountains } from "@/lib/data/mountains";
import { toggleFavorite } from "@/lib/favorites/actions";
import { getMyFavorites } from "@/lib/favorites/queries";
import { toPublicRoute } from "@/lib/data/public";
import { makeT } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { mountainName, routeName } from "@/lib/i18n/names";

export function generateStaticParams() {
  return mountains.map((m) => ({ slug: m.slug }));
}

export default function MountainPage({ params }: PageProps<"/mountains/[slug]">) {
  // 고른 언어는 쿠키에서 읽으므로 본문은 요청이 올 때 만든다.
  return (
    <Suspense fallback={null}>
      <MountainContent params={params} />
    </Suspense>
  );
}

async function MountainContent({ params }: { params: PageProps<"/mountains/[slug]">["params"] }) {
  const locale = await getLocale();
  const t = makeT(locale);
  const { slug } = await params;
  const mountain = getMountain(slug);
  if (!mountain) notFound();
  // 로그인 전에도 보이는 목록이므로, 루트 이름과 안전 유의사항 "건수"만 꺼낸다.
  const routes = mountain.routes.map(toPublicRoute);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        {t("common.backToMountains")}
      </Link>

      <section className="mt-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {mountainName(mountain, locale)}
        </h1>
        <p className="text-zinc-500">{locale === "en" ? mountain.nameKo : mountain.nameEn}</p>
        {/* 로그인한 사용자에게만 즐겨찾기 버튼을 보여 준다. (산 화면은 로그인 전에도 열린다) */}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <ShareButton label={t("share.button")} title={mountainName(mountain, locale)} copied={t("share.copied")} failed={t("share.failed")} />
          <Suspense fallback={null}>
            <MountainFavorite slug={mountain.slug} />
          </Suspense>
        </div>
      </section>

      <h2 className="mb-4 text-lg font-semibold">{t("mountain.routesTitle")}</h2>

      {routes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/20 p-6 text-zinc-600 dark:border-white/20 dark:text-zinc-400">
          {t("mountain.noRoutesMessage")}
        </p>
      ) : (
        <>
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
            {t("gate.generalSafety")} {t("mountain.loginForDetails")}
          </p>
          <ul className="space-y-3">
            {routes.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/mountains/${mountain.slug}/routes/${r.id}`}
                  className="block rounded-xl border border-black/10 p-5 transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
                >
                  <span className="font-semibold">{routeName(r, locale)}</span>
                  <span className="mt-1 block text-sm text-zinc-500">
                    {r.safetyCount > 0
                      ? t("mountain.safetyCount", { count: r.safetyCount })
                      : t("mountain.safetyNone")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

async function MountainFavorite({ slug }: { slug: string }) {
  const t = makeT(await getLocale());
  const user = await getCurrentUser();
  if (!user) return null;
  const isFavorite = (await getMyFavorites(user.id)).some((f) => f.mountain_slug === slug && f.route_id === null);
  return (
    <FavoriteButton
      mountainSlug={slug}
      routeId={null}
      initial={isFavorite}
      action={toggleFavorite}
      text={{ add: t("favorites.add"), remove: t("favorites.remove"), limit: t("favorites.limit"), failed: t("favorites.failed") }}
    />
  );
}
