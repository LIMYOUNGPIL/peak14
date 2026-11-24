import type { Metadata } from "next";
import TakedownForm from "@/components/TakedownForm";
import { submitTakedown } from "@/lib/takedown/actions";
import { t } from "@/lib/i18n/messages";

export const metadata: Metadata = { title: `${t("takedown.title")} · ${t("common.siteName")}` };

export default function TakedownPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-12">
      <h1 className="mb-2 text-2xl font-bold">{t("takedown.title")}</h1>
      <p className="mb-6 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{t("takedown.intro")}</p>
      <TakedownForm
        action={submitTakedown}
        text={{
          url: t("takedown.url"), urlHint: t("takedown.urlHint"), who: t("takedown.who"),
          author: t("takedown.author"), siteOwner: t("takedown.siteOwner"),
          email: t("takedown.email"), emailHint: t("takedown.emailHint"),
          note: t("takedown.note"), submit: t("takedown.submit"), submitting: t("takedown.submitting"),
        }}
      />
    </main>
  );
}
