// 저장소 연결에 필요한 환경 변수를 읽는다.
//
// 값이 없으면 어떤 이름이 비었는지 한국어로 알려 준다. (값 자체는 절대 출력하지 않는다)
// NEXT_PUBLIC_ 이 붙은 두 개(주소, 공개용 키)는 공개돼도 되는 값이다. (PRD 7번)

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `환경 변수 ${name} 이(가) 비어 있습니다. .env 파일을 확인해 주세요.`,
    );
  }
  return value;
}

// 브라우저에서도 쓰는 값은 process.env.이름 을 직접 적어야 Next.js 가 채워 준다.
export function getSupabaseUrl(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}

export function getSupabaseAnonKey(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

// 서버 전용 관리 키. server-only 파일에서만 부른다.
export function getSupabaseServiceRoleKey(): string {
  return required(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}
