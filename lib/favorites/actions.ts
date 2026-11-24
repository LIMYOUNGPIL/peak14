"use server";

// 즐겨찾기 담기·빼기 (서버에서 실행)
//
// 로그인 확인 → 실제로 있는 산·루트인지 확인 → 이미 있으면 빼고, 없으면 담는다.
// 사용자가 저장소에 직접 쓰는 길은 닫혀 있고(20261124030000_harden_favorites.sql), 여기서 서버 권한으로만 저장한다.
// 대상 사용자는 폼 값이 아니라 서버가 확인한 로그인 사용자(user.id)다.

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { getMountain, getRoute } from "@/lib/data/mountains";
import { createAdminClient } from "@/lib/db/admin";

export type FavoriteState = { favorited: boolean; error: string | null };

export async function toggleFavorite(mountainSlug: string, routeId: string | null): Promise<FavoriteState> {
  const user = await getCurrentUser();
  if (!user) return { favorited: false, error: "login" };

  const mountain = typeof mountainSlug === "string" ? getMountain(mountainSlug) : undefined;
  if (!mountain) return { favorited: false, error: "invalid" };
  if (routeId !== null && (typeof routeId !== "string" || !getRoute(mountain, routeId))) {
    return { favorited: false, error: "invalid" };
  }

  const admin = createAdminClient();
  let find = admin.from("favorites").select("id").eq("user_id", user.id).eq("mountain_slug", mountain.slug);
  find = routeId === null ? find.is("route_id", null) : find.eq("route_id", routeId);
  const { data: existing } = await find.maybeSingle();

  if (existing) {
    const { error } = await admin.from("favorites").delete().eq("id", existing.id).eq("user_id", user.id);
    if (error) return { favorited: true, error: "failed" };
    revalidatePath("/favorites");
    return { favorited: false, error: null };
  }
  const { error } = await admin.from("favorites").insert({ user_id: user.id, mountain_slug: mountain.slug, route_id: routeId });
  if (error) return { favorited: false, error: error.message.includes("favorites_limit") ? "limit" : "failed" };
  revalidatePath("/favorites");
  return { favorited: true, error: null };
}
