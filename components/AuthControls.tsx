// 머리글 오른쪽의 로그인 상태 표시
//
// 로그인 전: "로그인" 링크 / 로그인 후: 닉네임과 "로그아웃" 버튼.
// 로그인 상태는 서버가 쿠키로 확인한다. 이메일은 화면에 보여 주지 않는다. (PRD 7번: 닉네임만 표시)

import Link from "next/link";
import { connection } from "next/server";
import { logout } from "@/lib/auth/actions";
import { createClient } from "@/lib/db/server";
import { t } from "@/lib/i18n/messages";

const buttonClass =
  "rounded-full border border-black/15 px-3 py-1 text-sm transition-colors hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]";

export default async function AuthControls() {
  // 로그인 확인은 현재 시각(만료 시간 비교)을 쓰므로, 미리 그리지 않고
  // 요청이 올 때 그리도록 표시한다. (Cache Components 규칙)
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    return (
      <Link href="/login" className={buttonClass}>
        {t("auth.loginButton")}
      </Link>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", userId)
    .maybeSingle();

  return (
    <div className="flex items-center gap-3">
      {profile?.nickname && (
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {profile.nickname}
        </span>
      )}
      <form action={logout}>
        <button type="submit" className={buttonClass}>
          {t("auth.logout")}
        </button>
      </form>
    </div>
  );
}
