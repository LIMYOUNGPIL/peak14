// 모든 화면 위에 보이는 공통 머리글
//
// Design Ref: §3 — 왼쪽에 Peak14 로고, 오른쪽에 언어 선택(한국어/English)과 로그인.
// 언어는 쿠키에서 읽으므로 요청이 올 때 만들어진다(레이아웃에서 Suspense 로 감싼다).

import { Suspense } from "react";
import Link from "next/link";
import AuthControls from "@/components/AuthControls";
import HtmlLang from "@/components/HtmlLang";
import LanguageSwitch from "@/components/LanguageSwitch";
import { setLocale } from "@/lib/i18n/actions";
import { makeT } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export default async function Header() {
  const locale = await getLocale();
  const t = makeT(locale);
  return (
    <header className="border-b border-white/15 bg-[#070d18]/90 text-white backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {t("common.siteName")}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <LanguageSwitch current={locale} label={t("common.langLabel")} action={setLocale} />
          {/* 로그인 상태는 요청마다 달라지므로 Suspense 로 감싼다. */}
          <Suspense
            fallback={<span className="inline-block h-7 w-16" aria-hidden />}
          >
            <AuthControls />
          </Suspense>
        </div>
      </div>
      <HtmlLang locale={locale} />
    </header>
  );
}
