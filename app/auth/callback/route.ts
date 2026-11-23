// 소셜 로그인을 마치고 돌아오는 주소
//
// 제공사가 보내 준 임시 코드(code)를 로그인 상태로 바꾸고, 원래 보던 화면으로 보낸다.
// 실패하면 로그인 화면에 실패 안내를 달아 돌려보낸다.

import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/validation";
import { createClient } from "@/lib/db/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  const failed = next === "/" ? "" : `&next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(`${origin}/login?error=social${failed}`);
}
