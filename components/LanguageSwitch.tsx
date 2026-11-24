"use client";

// 언어 선택: 한국어 / English. 고르면 서버가 쿠키에 저장하고 화면을 다시 불러온다.

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Locale } from "@/lib/i18n/messages";

type Props = {
  current: Locale;
  label: string;
  action: (value: string) => Promise<void>;
};

const NAMES: Record<Locale, string> = { ko: "한국어", en: "English" };

export default function LanguageSwitch({ current, label, action }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div role="group" aria-label={label} className="flex overflow-hidden rounded-full border border-black/15 text-sm dark:border-white/20">
      {(["ko", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          disabled={pending}
          aria-pressed={current === l}
          onClick={() =>
            current !== l &&
            startTransition(async () => {
              await action(l);
              router.refresh();
            })
          }
          className={`whitespace-nowrap px-3 py-1 transition-colors ${
            current === l ? "bg-foreground text-background" : "hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          }`}
        >
          {NAMES[l]}
        </button>
      ))}
    </div>
  );
}
