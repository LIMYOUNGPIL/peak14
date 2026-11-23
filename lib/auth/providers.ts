// 소셜 로그인 제공사 목록
//
// 키가 .env 에 들어 있는 제공사만 켜진 것으로 본다. (키가 없으면 버튼을 보여 주지 않는다)
// 켜는 방법: scripts/configure-social-login.mjs 가 .env 의 키를 Supabase 에 등록한다.
//
// 수집 정보는 최소화한다. (PRD 7번: 계정 식별값, 이메일만. 프로필 사진·친구 목록은 요청하지 않는다)

import "server-only";

export type SocialProvider = "google" | "kakao";

const PROVIDERS: Record<SocialProvider, { clientIdEnv: string; scopes: string }> = {
  google: { clientIdEnv: "GOOGLE_CLIENT_ID", scopes: "email" },
  kakao: { clientIdEnv: "KAKAO_CLIENT_ID", scopes: "account_email" },
};

export function isSocialProvider(value: unknown): value is SocialProvider {
  return typeof value === "string" && value in PROVIDERS;
}

export function providerScopes(provider: SocialProvider): string {
  return PROVIDERS[provider].scopes;
}

// .env 에 클라이언트 ID 가 있는 제공사만 돌려준다.
export function enabledProviders(): SocialProvider[] {
  return (Object.keys(PROVIDERS) as SocialProvider[]).filter(
    (p) => !!process.env[PROVIDERS[p].clientIdEnv],
  );
}
