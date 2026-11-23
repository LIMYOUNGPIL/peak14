import Link from "next/link";
import { notFound } from "next/navigation";
import { getMountain, mountains } from "@/lib/data/mountains";
import { toPublicRoute } from "@/lib/data/public";
import { t } from "@/lib/i18n/messages";

export function generateStaticParams() {
  return mountains.map((m) => ({ slug: m.slug }));
}

export default async function MountainPage({
  params,
}: PageProps<"/mountains/[slug]">) {
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
          {mountain.nameKo}
        </h1>
        <p className="text-zinc-500">{mountain.nameEn}</p>
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
                  <span className="font-semibold">{r.name}</span>
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
