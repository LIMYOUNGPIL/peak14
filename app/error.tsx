"use client";

// 화면을 그리다 예상하지 못한 오류가 났을 때 보이는 화면 (DESIGN 7번)
// 오류를 숨기거나 임의의 내용으로 채우지 않고, 다시 시도하거나 처음으로 돌아가게 한다.
// 서버 쪽 언어 쿠키를 여기서 읽을 수 없어 한국어·영어를 함께 적는다.

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight">문제가 생겼습니다 · Something went wrong</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        화면을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요. 정보가 없는 것이 아니라 불러오는 데 실패한 것입니다.
        <br />
        We could not load this page. Please try again. This is a loading failure, not missing data.
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background">
          다시 시도 · Retry
        </button>
        <Link href="/" className="rounded-full border border-black/15 px-5 py-2 text-sm dark:border-white/20">
          처음으로 · Home
        </Link>
      </div>
    </main>
  );
}
