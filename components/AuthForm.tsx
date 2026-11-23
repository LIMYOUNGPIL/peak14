"use client";

// 로그인·가입 공용 입력 양식
//
// 서버 동작(login/signup)을 받아 실행하고, 실패하면 이유를 양식 위에 보여 준다.

import { useActionState } from "react";
import Link from "next/link";
import type { AuthFormState } from "@/lib/auth/actions";

type Props = {
  action: (prev: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  mode: "login" | "signup";
  next: string; // 성공한 뒤 돌아갈 주소
  initialError?: string | null; // 소셜 로그인 실패 등, 처음부터 보여 줄 안내
  // 소셜 로그인: 키가 준비된 제공사만 들어온다. 없으면 버튼을 그리지 않는다.
  social?: {
    action: (formData: FormData) => Promise<void>;
    providers: { id: string; label: string }[];
    divider: string;
  };
  text: {
    title: string;
    email: string;
    password: string;
    passwordHint: string;
    submit: string;
    working: string;
    switchLabel: string;
  };
};

const inputClass =
  "w-full rounded-lg border border-black/15 bg-transparent px-3 py-2 dark:border-white/20";

export default function AuthForm({ action, mode, next, initialError = null, social, text }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    error: initialError,
  });
  const otherPage = mode === "login" ? "/signup" : "/login";
  const switchHref =
    next === "/" ? otherPage : `${otherPage}?next=${encodeURIComponent(next)}`;

  return (
    <div className="space-y-6">
    <form action={formAction} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">{text.title}</h1>

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300"
        >
          {state.error}
        </p>
      )}

      <input type="hidden" name="next" value={next} />

      <label className="block space-y-1">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {text.email}
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {text.password}{" "}
          {mode === "signup" && (
            <span className="text-zinc-500">({text.passwordHint})</span>
          )}
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-foreground px-4 py-2 font-medium text-background disabled:opacity-60"
      >
        {pending ? text.working : text.submit}
      </button>
    </form>

    {/* 소셜 로그인: 키가 준비된 제공사의 버튼만 보인다 */}
    {social && social.providers.length > 0 && (
      <div className="space-y-3">
        <p className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="h-px flex-1 bg-black/10 dark:bg-white/15" />
          {social.divider}
          <span className="h-px flex-1 bg-black/10 dark:bg-white/15" />
        </p>
        {social.providers.map((p) => (
          <form key={p.id} action={social.action}>
            <input type="hidden" name="provider" value={p.id} />
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="w-full rounded-lg border border-black/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]"
            >
              {p.label}
            </button>
          </form>
        ))}
      </div>
    )}

    <p className="text-center text-sm">
      <Link href={switchHref} className="text-zinc-600 hover:underline dark:text-zinc-400">
        {text.switchLabel}
      </Link>
    </p>
    </div>
  );
}
