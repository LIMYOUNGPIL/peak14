// 모든 화면 위에 보이는 공통 머리글
//
// Design Ref: §3 — 왼쪽에 Peak14 로고, 오른쪽에 언어 선택과 로그인.
// 언어 선택은 PLAN 18번, 로그인은 PLAN 4번 작업에서 연결한다.
// 그 전까지는 자리만 두고 눌리지 않게(disabled) 해서 "준비 중"임을 숨기지 않는다.

import Link from "next/link";
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
          <button
            type="button"
            disabled
            title={t("common.comingSoon")}
            className={placeholderButton}
          >
            {t("common.login")}
          </button>
        </div>
      </div>
    </header>
  );
}
