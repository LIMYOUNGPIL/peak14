"use client";

// 외부 글 삭제 요청 양식 (PLAN 14번). 로그인 없이 쓴다.

import { useActionState } from "react";
import type { TakedownState } from "@/lib/takedown/actions";

type Props = {
  action: (prev: TakedownState, formData: FormData) => Promise<TakedownState>;
  text: {
    url: string; urlHint: string; who: string; author: string; siteOwner: string;
    email: string; emailHint: string; note: string; submit: string; submitting: string;
  };
};

const input = "w-full rounded-lg border border-black/15 bg-transparent px-3 py-2 dark:border-white/20";

export default function TakedownForm({ action, text }: Props) {
  const [state, formAction, pending] = useActionState(action, { status: "idle", message: null });
  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <p role={state.status === "error" ? "alert" : "status"}
          className={`rounded-lg border px-3 py-2 text-sm ${state.status === "error"
            ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>
          {state.message}
        </p>
      )}
      {/* 봇 걸러내기용 숨은 칸: 사람은 보지도 채우지도 않는다 */}
      <div aria-hidden="true" className="hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="block space-y-1">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{text.url}</span>
        <input name="originalUrl" type="url" required maxLength={2000} placeholder="https://" className={input} />
        <span className="block text-xs text-zinc-500">{text.urlHint}</span>
      </label>
      <fieldset className="space-y-1">
        <legend className="text-sm text-zinc-600 dark:text-zinc-400">{text.who}</legend>
        <label className="mr-4 inline-flex items-center gap-2"><input type="radio" name="requesterType" value="author" defaultChecked />{text.author}</label>
        <label className="inline-flex items-center gap-2"><input type="radio" name="requesterType" value="site-owner" />{text.siteOwner}</label>
      </fieldset>
      <label className="block space-y-1">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{text.email}</span>
        <input name="email" type="email" required maxLength={254} autoComplete="email" className={input} />
        <span className="block text-xs text-zinc-500">{text.emailHint}</span>
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{text.note}</span>
        <textarea name="note" rows={3} maxLength={1000} className={input} />
      </label>
      <button type="submit" disabled={pending} className="rounded-lg bg-foreground px-5 py-2 font-medium text-background disabled:opacity-60">
        {pending ? text.submitting : text.submit}
      </button>
    </form>
  );
}
