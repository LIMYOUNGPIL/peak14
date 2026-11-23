import Link from "next/link";
import { mountains } from "@/lib/data/mountains";
import { t } from "@/lib/i18n/messages";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <section className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("common.siteName")}
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {t("common.tagline")}
        </p>
      </section>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mountains.map((m, i) => (
          <li key={m.slug}>
            <Link
              href={`/mountains/${m.slug}`}
              className="block rounded-xl border border-black/10 p-5 transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
            >
              <span className="text-sm text-zinc-500">{i + 1}</span>
              <h2 className="mt-1 text-xl font-semibold">{m.nameKo}</h2>
              <p className="text-sm text-zinc-500">{m.nameEn}</p>
              <p className="mt-3 text-sm">
                {m.routes.length > 0
                  ? t("home.routeCount", { count: m.routes.length })
                  : t("home.noRoutes")}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
