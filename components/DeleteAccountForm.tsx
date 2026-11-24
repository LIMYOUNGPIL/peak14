"use client";

import { useActionState } from "react";
import { deleteAccount, type DeleteAccountState } from "@/lib/auth/delete-account";
import { makeT, type Locale } from "@/lib/i18n/messages";

export default function DeleteAccountForm({ locale }: { locale: Locale }) {
  const t = makeT(locale);
  const [state, action, pending] = useActionState<DeleteAccountState, FormData>(deleteAccount, { error: null });
  return (
    <form action={action} className="mt-4 space-y-3">
      <label className="block text-sm">
        {t("account.confirmLabel")}
        <input
          name="confirm"
          autoComplete="off"
          className="mt-1 block w-full rounded-lg border border-black/20 bg-transparent px-3 py-2 dark:border-white/25"
          placeholder="DELETE"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error === "confirm" ? t("account.confirmError") : t("account.failed")}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {t("account.deleteButton")}
      </button>
    </form>
  );
}
