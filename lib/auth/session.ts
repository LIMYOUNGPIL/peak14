// 지금 로그인한 사용자를 서버에서 확인한다.
//
// getUser 는 Supabase 서버에 물어서 확인한다. 쿠키 안의 증명서만 보는 방식보다 안전하다.
// (예: 계정이 이미 삭제됐는데 증명서가 아직 유효한 경우도 걸러 낸다.)
// 세부 정보(루트 상세, 안전 유의사항, 후기, 비교)를 보여 주기 전에 반드시 이 함수로 확인한다.

import "server-only";
import { connection } from "next/server";
import { createClient } from "@/lib/db/server";

export async function getCurrentUser() {
  // 로그인 확인은 현재 시각을 쓰므로 요청이 올 때 실행하게 한다. (Cache Components 규칙)
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}
