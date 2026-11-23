// 브라우저(화면)에서 쓰는 저장소 연결
//
// 공개용 키(anon)만 쓴다. 서버 전용 관리 키는 여기서 절대 쓰지 않는다.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { getSupabaseAnonKey, getSupabaseUrl } from "./env";

export function createClient() {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}
