// 요청마다 로그인 상태(쿠키)를 새로 고치는 도우미 (proxy.ts 에서 부른다)
//
// 로그인 증명서는 일정 시간이 지나면 만료된다. 화면을 그리기 전에 미리 갱신해
// 갱신된 쿠키가 브라우저로 돌아가게 한다.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "./database.types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 이 호출이 만료된 로그인 증명서를 갱신한다.
  await supabase.auth.getClaims();

  return response;
}
