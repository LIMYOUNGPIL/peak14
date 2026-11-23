// 서버 전용 관리자 연결 (접근 규칙을 건너뛰는 강한 권한)
//
// 쓰는 곳: AI 판정 저장, 외부 글 등록, 삭제 요청 처리, 계정 삭제처럼
// 사용자가 직접 할 수 없는 일. 화면(브라우저) 코드에서 불러오면 빌드 단계에서 막힌다.

import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { getSupabaseServiceRoleKey, getSupabaseUrl } from "./env";

export function createAdminClient() {
  return createSupabaseClient<Database>(
    getSupabaseUrl(),
    getSupabaseServiceRoleKey(),
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
