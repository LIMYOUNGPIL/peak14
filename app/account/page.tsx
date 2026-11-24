import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import DeleteAccountForm from "@/components/DeleteAccountForm";
import { getCurrentUser } from "@/lib/auth/session";
import { makeT } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Peak14" };

export default function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <Suspense fallback={null}>
        <Body />
      </Suspense>
    </main>
  );
}

async function Body() {
  const locale = await getLocale();
  const t = makeT(locale);
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent("/account")}`);

  const items = ["collect", "notCollect", "ai", "display"] as const;
  return (
    <>
      <h1 className="text-2xl font-bold">{t("account.title")}</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">{t("account.privacyTitle")}</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-700 dark:text-zinc-300">
          {items.map((k) => (
            <li key={k}>{t(`account.${k}`)}</li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-xl border border-red-500/30 p-5">
        <h2 className="text-lg font-semibold">{t("account.deleteTitle")}</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-300">{t("account.deleteBody")}</p>
        <DeleteAccountForm locale={locale} />
      </section>
    </>
  );
}
