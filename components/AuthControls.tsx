// 머리글 오른쪽의 로그인 상태 표시
//
// 로그인 전: "로그인" 링크 / 로그인 후: 닉네임과 "로그아웃" 버튼.
// 로그인 상태는 서버가 쿠키로 확인한다. 이메일은 화면에 보여 주지 않는다. (PRD 7번: 닉네임만 표시)

import Link from "next/link";
import { logout } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/session";
import { createClient } from "@/lib/db/server";
import { getT } from "@/lib/i18n/server";

const buttonClass =
  "rounded-full border border-black/15 px-3 py-1.5 text-sm sm:py-1 transition-colors hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]";

export default async function AuthControls() {
  // 세부 정보를 보여 주는 화면과 같은 방식(서버에 물어 확인)으로 로그인을 확인한다.
  // 삭제된 계정의 낡은 증명서가 남아 있어도 "로그인한 것처럼" 보이지 않게 하기 위해서다.
  const t = await getT();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link href="/login" className={buttonClass}>
        {t("auth.loginButton")}
      </Link>
    );
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {profile?.nickname && (
        <span className="hidden text-sm text-zinc-600 sm:inline dark:text-zinc-400">
          {profile.nickname}
        </span>
      )}
      <Link href="/favorites" className="py-1.5 text-sm text-zinc-600 hover:underline dark:text-zinc-400">
        {t("favorites.menu")}
      </Link>
      <Link href="/account" className="py-1.5 text-sm text-zinc-600 hover:underline dark:text-zinc-400">
        {t("account.menu")}
      </Link>
      <form action={logout}>
        <button type="submit" className={buttonClass}>
          {t("auth.logout")}
        </button>
      </form>
    </div>
  );
}
