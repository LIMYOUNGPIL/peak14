// 한 루트의 후기를 저장소에서 읽어 온다 (서버 전용)
//
// 접근 규칙(RLS)상 로그인한 사용자만 후기를 읽을 수 있다. 로그인하지 않았다면 빈 목록이 온다.
// 그래도 이 함수는 로그인을 확인한 화면(루트 상세)에서만 부른다.

import "server-only";
import { createClient } from "@/lib/db/server";
import type { Review } from "@/types/review";
import { mapReviewRow } from "./map";

// 읽기에 실패하면 null 을 돌려준다. (후기가 없는 것과 구분해, 화면이 "불러오지 못했습니다"로 정직하게 알린다)
export async function getRouteReviews(routeId: string): Promise<Review[] | null> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("route_id", routeId)
    .order("written_year", { ascending: false })
    .order("created_at", { ascending: false });
  if (error || !rows) return null;

  // 앱 안 후기의 작성자 닉네임을 한 번에 읽는다. (이메일은 읽지 않는다)
  const authorIds = [...new Set(rows.flatMap((r) => (r.author_id ? [r.author_id] : [])))];
  const nicknames = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nickname")
      .in("id", authorIds);
    for (const p of profiles ?? []) nicknames.set(p.id, p.nickname);
  }

  return rows.map((r) => mapReviewRow(r, r.author_id ? (nicknames.get(r.author_id) ?? null) : null));
}
