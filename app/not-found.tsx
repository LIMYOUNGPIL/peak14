// 없는 주소를 열었을 때 보이는 화면 (DESIGN 7번: 404 화면, 목록으로 돌아가는 링크)

import Link from "next/link";
import { t } from "@/lib/i18n/messages";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center px-6 py-16">
      <p className="text-sm text-zinc-500">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">
        {t("common.notFoundTitle")}
      </h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        {t("common.notFoundBody")}
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background"
      >
        {t("common.toHome")}
      </Link>
    </main>
  );
}
