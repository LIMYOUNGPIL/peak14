// 후기 한 건을 AI로 판정해 저장한다 (서버 전용)
//
// 판정(sentiment)은 사용자가 직접 채울 수 없고, 서버만 채운다. (저장소 접근 규칙)
// 그래서 사용자 권한이 아니라 서버 관리자 권한으로 저장한다.

import "server-only";
import { classifySentiment } from "@/lib/ai/sentiment-core";
import { createAdminClient } from "@/lib/db/admin";

// 성공하면 true. 실패하면 false 이고, 후기는 "판정 중"(sentiment 비어 있음)으로 남는다.
export async function classifyAndSaveReview(reviewId: string, text: string): Promise<boolean> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return false;

  const sentiment = await classifySentiment(text, { apiKey });
  if (!sentiment) return false;

  const admin = createAdminClient();
  // 아직 판정되지 않은 후기만 채운다. (이미 판정된 값을 덮어쓰지 않는다)
  const { error } = await admin
    .from("reviews")
    .update({ sentiment })
    .eq("id", reviewId)
    .is("sentiment", null);
  return !error;
}
