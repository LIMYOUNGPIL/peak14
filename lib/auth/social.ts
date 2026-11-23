"use server";

// 소셜 로그인 시작 (서버에서 실행)
//
// 흐름: 버튼 → 이 동작이 제공사 로그인 화면 주소를 받아 이동 → 제공사에서 로그인 →
//       /auth/callback 으로 돌아옴 → 로그인 상태를 만들고 원래 화면으로 이동.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/db/server";
import { enabledProviders, isSocialProvider, providerScopes } from "./providers";
import { safeNextPath } from "./validation";

export async function loginWithProvider(formData: FormData) {
  const provider = formData.get("provider");
  const next = safeNextPath(formData.get("next"));
  const failed = `/login?error=social${next === "/" ? "" : `&next=${encodeURIComponent(next)}`}`;

  // 목록에 없거나 키가 없는(꺼진) 제공사는 받지 않는다.
  if (!isSocialProvider(provider) || !enabledProviders().includes(provider)) {
    redirect(failed);
  }

  const h = await headers();
  const origin =
    h.get("origin") ??
    `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      scopes: providerScopes(provider),
    },
  });
  if (error || !data.url) redirect(failed);

  redirect(data.url);
}
