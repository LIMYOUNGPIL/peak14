// 내 즐겨찾기 읽기 (서버 전용). 본인 것만 읽는 저장소 규칙(RLS)이 한 번 더 막는다.

import "server-only";
import { createClient } from "@/lib/db/server";

export type FavoriteRow = { mountain_slug: string; route_id: string | null; created_at: string };

export async function getMyFavorites(userId: string): Promise<FavoriteRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("mountain_slug, route_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}
