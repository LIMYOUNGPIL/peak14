// 서버 코드에서 쓰는 저장소 연결 (로그인한 사용자의 권한으로 동작)
//
// Design Ref: §2.1, §8 — 서버가 로그인 상태를 확인하고 접근 규칙(RLS)이 데이터를 지킨다.

import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // 화면(서버 컴포넌트)을 그리는 중에는 쿠키를 쓸 수 없다.
          // 로그인 상태 갱신은 로그인 작업(PLAN 4번)에서 따로 처리한다.
        }
      },
    },
  });
}
