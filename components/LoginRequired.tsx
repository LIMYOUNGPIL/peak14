// 로그인 전에 루트를 열었을 때 보이는 안내 화면
//
// Design Ref: §3.2 — 로그인하지 않았으면 로그인 안내가 먼저 나오고, 그 루트의 안전 유의사항 "건수"만 보여 준다.
// 안전 유의사항의 내용은 여기로 넘겨받지 않는다. (건수만 받는다)

import Link from "next/link";
import { getT } from "@/lib/i18n/server";

type Props = {
  routeName: string;
  safetyCount: number; // 등록된 안전 유의사항 건수 (내용 아님)
  next: string; // 로그인한 뒤 돌아올 주소
};

export default async function LoginRequired({ routeName, safetyCount, next }: Props) {
  const t = await getT();
  const query = `?next=${encodeURIComponent(next)}`;

  return (
    <section className="rounded-2xl border border-black/10 p-6 dark:border-white/15">
      <h1 className="text-2xl font-bold tracking-tight">{routeName}</h1>

      <div className="mt-6 rounded-xl bg-black/[.04] p-5 dark:bg-white/[.06]">
        <h2 className="text-lg font-semibold">{t("gate.title")}</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{t("gate.body")}</p>
        <p className="mt-4 font-medium">
          {safetyCount > 0
            ? t("gate.safetyCount", { count: safetyCount })
            : t("gate.safetyNone")}
        </p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {t("gate.generalSafety")}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={`/login${query}`}
            className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background"
          >
            {t("gate.login")}
          </Link>
          <Link
            href={`/signup${query}`}
            className="rounded-full border border-black/15 px-5 py-2 text-sm dark:border-white/20"
          >
            {t("gate.signup")}
          </Link>
        </div>
      </div>
    </section>
  );
}
