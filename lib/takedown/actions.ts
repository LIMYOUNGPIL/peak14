"use server";

// 외부 글 삭제 요청 접수 (서버에서 실행)
//
// 원문 글쓴이·사이트 운영자는 이 앱의 회원이 아니므로 로그인 없이 접수한다.
// 대신 (1) 입력 검사 (2) 같은 연락처 하루 3건·전체 하루 30건 제한 (3) 숨은 칸(봇 걸러내기)으로 막고,
// 저장은 서버 권한으로만 한다. (사용자가 저장소에 직접 쓰는 길은 닫혀 있다)
//
// 접수 즉시 자동으로 지우지는 않는다. 누구나 남의 요약을 지우게 만드는 악용을 막기 위해,
// 운영자가 요청자를 확인한 뒤 `npm run takedown:process` 로 처리한다.

import { createAdminClient } from "@/lib/db/admin";
import { getT } from "@/lib/i18n/server";
import { DAILY_LIMIT_PER_EMAIL, DAILY_LIMIT_TOTAL, matchesRequestedUrl, takedownSchema } from "./validation";

export type TakedownState = { status: "idle" | "error" | "success"; message: string | null };
const fail = (message: string): TakedownState => ({ status: "error", message });

export async function submitTakedown(_prev: TakedownState, formData: FormData): Promise<TakedownState> {
  const t = await getT();
  // 사람 눈에 보이지 않는 칸이 채워져 있으면 봇이다. 성공한 것처럼 답하고 저장하지 않는다.
  if (String(formData.get("website") ?? "") !== "") return { status: "success", message: t("takedown.success") };

  const parsed = takedownSchema.safeParse({
    originalUrl: formData.get("originalUrl") ?? "",
    requesterType: formData.get("requesterType"),
    email: formData.get("email") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return fail(field === "originalUrl" ? t("takedown.invalidUrl") : field === "email" ? t("takedown.invalidEmail") : t("takedown.failed"));
  }
  const { originalUrl, requesterType, email, note } = parsed.data;

  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  // 하루 접수 제한 (received_at 은 접수일)
  const [{ count: total }, { count: mine }] = await Promise.all([
    admin.from("deletion_requests").select("id", { count: "exact", head: true }).eq("received_at", today),
    admin.from("deletion_requests").select("id", { count: "exact", head: true }).eq("received_at", today).eq("contact_email", email),
  ]);
  if ((total ?? 0) >= DAILY_LIMIT_TOTAL || (mine ?? 0) >= DAILY_LIMIT_PER_EMAIL) return fail(t("takedown.limit"));

  // 이 주소와 맞는 요약이 있으면 연결해 둔다. 없어도 접수는 한다. (운영자가 직접 확인)
  const { data: found } = await admin.from("reviews").select("id, original_url").eq("origin", "external").not("original_url", "is", null);
  const match = (found ?? []).find((r) => r.original_url && matchesRequestedUrl(r.original_url, originalUrl));

  const { error } = await admin.from("deletion_requests").insert({
    review_id: match?.id ?? null,
    original_url: originalUrl,
    requester_type: requesterType,
    contact_email: email,
    note,
    received_at: today,
  });
  if (error) return fail(t("takedown.failed"));
  return { status: "success", message: t("takedown.success") };
}

