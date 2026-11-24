"use server";

// 후기 등록 (서버에서 실행)
//
// 순서: 로그인 확인 → 입력 검사 → 욕설·개인정보 걸러내기 → 하루 등록 수 확인 → 저장.
// 저장은 로그인한 사용자 본인의 권한으로 한다. (저장소 접근 규칙이 "본인 이름으로만, 앱 안 후기로만,
// AI 판정은 비워서"를 한 번 더 지켜 준다.)

import { after } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { getMountain, getRoute } from "@/lib/data/mountains";
import { createClient } from "@/lib/db/server";
import { t } from "@/lib/i18n/messages";
import { classifyAndSaveReview } from "./classify";
import { checkReviewText } from "./filter";

export type ReviewFormState = {
  status: "idle" | "error" | "success";
  message: string | null;
};

const DAILY_REVIEW_LIMIT = 5;
const MIN_LENGTH = 10;
const MAX_LENGTH = 1000;

const inputSchema = z.object({
  mountainSlug: z.string().min(1),
  routeId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().trim(),
});

const fail = (message: string): ReviewFormState => ({ status: "error", message });

export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await getCurrentUser();
  if (!user) return fail(t("review.needLogin"));

  const parsed = inputSchema.safeParse({
    mountainSlug: formData.get("mountainSlug"),
    routeId: formData.get("routeId"),
    rating: formData.get("rating"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return fail(field === "rating" ? t("review.invalidRating") : t("review.failed"));
  }
  const { mountainSlug, routeId, rating, body } = parsed.data;

  // 실제로 있는 루트에만 후기를 쓸 수 있다.
  const mountain = getMountain(mountainSlug);
  const route = mountain ? getRoute(mountain, routeId) : undefined;
  if (!route) return fail(t("review.failed"));

  if (body.length < MIN_LENGTH) return fail(t("review.tooShort"));
  if (body.length > MAX_LENGTH) return fail(t("review.tooLong"));

  // 욕설·개인정보는 등록 전에 걸러 낸다. 걸린 글은 저장하지 않고, 이유만 알려 준다.
  const reasons = checkReviewText(body);
  if (reasons.includes("profanity")) return fail(t("review.blockedProfanity"));
  if (reasons.length > 0) return fail(t("review.blockedPrivacy"));

  const supabase = await createClient();

  // 도배를 막기 위해 하루에 쓸 수 있는 후기 수를 제한한다.
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id)
    .gte("created_at", since);
  if ((count ?? 0) >= DAILY_REVIEW_LIMIT) return fail(t("review.dailyLimit"));

  const { data: saved, error } = await supabase.from("reviews").insert({
    route_id: route.id,
    origin: "app",
    written_year: new Date().getFullYear(),
    // 한글이 있으면 한국어, 아니면 영어로 본다. (원문 언어 표시용)
    language: /[가-힣]/.test(body) ? "ko" : "en",
    author_id: user.id,
    body,
    rating,
    // sentiment 는 비워 둔다. 아래에서 AI 가 판정해 서버가 채운다.
  }).select("id").single();
  if (error || !saved) return fail(t("review.failed"));

  // 사용자를 기다리게 하지 않고, 응답을 보낸 뒤에 AI 판정을 한다.
  // 판정에 실패해도 후기는 저장된 채로 "판정 중"으로 남고, npm run classify:pending 으로 다시 판정할 수 있다.
  after(async () => {
    await classifyAndSaveReview(saved.id, body);
  });

  return { status: "success", message: t("review.success") };
}
