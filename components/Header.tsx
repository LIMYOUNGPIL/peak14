// 모든 화면 위에 보이는 공통 머리글
//
// Design Ref: §3 — 왼쪽에 Peak14 로고, 오른쪽에 언어 선택과 로그인.
// 로그인은 연결됐다. 언어 선택은 PLAN 18번 작업에서 연결하며,
// 그 전까지는 눌리지 않게(disabled) 해서 "준비 중"임을 숨기지 않는다.

import { Suspense } from "react";
import Link from "next/link";
import AuthControls from "@/components/AuthControls";
import { t } from "@/lib/i18n/messages";

const placeholderButton =
  "rounded-full border border-black/10 px-3 py-1 text-sm text-zinc-400 dark:border-white/15 dark:text-zinc-500 cursor-not-allowed";

export default function Header() {
  return (
    <header className="border-b border-black/10 dark:border-white/15">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {t("common.siteName")}
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            title={t("common.comingSoon")}
            className={placeholderButton}
          >
            {t("common.language")}
          </button>
          {/* 로그인 상태는 요청마다 달라지므로 Suspense 로 감싼다. */}
          <Suspense
            fallback={<span className="inline-block h-7 w-16" aria-hidden />}
          >
            <AuthControls />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
