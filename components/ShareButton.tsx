"use client";

// 공유하기 버튼: 지금 화면의 주소를 공유한다.
//
// 주소는 "사이트 주소 + 경로"만 쓴다. 주소 뒤의 값(?…)과 # 뒤는 빼서, 닉네임·이메일 같은 개인 정보나
// 로그인 관련 값이 섞여 나가지 않게 한다. 받은 사람이 로그인하지 않았다면 로그인 없이 볼 수 있는 범위만 보인다.
// 기기가 공유 창(Web Share)을 지원하면 그것을 열고, 아니면 주소를 복사한다.

import { useState } from "react";

type Props = { label: string; title: string; copied: string; failed: string };

export default function ShareButton({ label, title, copied, failed }: Props) {
  const [message, setMessage] = useState<string | null>(null);

  async function share() {
    const url = window.location.origin + window.location.pathname;
    setMessage(null);
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMessage(copied);
    } catch (e) {
      // 사용자가 공유 창을 닫은 경우(AbortError)는 오류가 아니다.
      if (e instanceof DOMException && e.name === "AbortError") return;
      setMessage(failed);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={share}
        className="rounded-full border border-black/15 px-4 py-1.5 text-sm transition-colors hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]"
      >
        {label}
      </button>
      {message && <span role="status" className="text-xs text-zinc-500">{message}</span>}
    </div>
  );
}
