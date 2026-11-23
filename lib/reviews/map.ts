// 저장소의 후기 한 줄(DB 행)을 화면에서 쓰는 모양(Review)으로 바꾼다.
// 서버 전용 코드가 아니라서 시험에서도 그대로 불러 쓸 수 있다.

import type { Database } from "../db/database.types";
import type { Review } from "../../types/review";

export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

export function mapReviewRow(row: ReviewRow, nickname: string | null): Review {
  return {
    id: row.id,
    routeId: row.route_id,
    origin: row.origin === "external" ? "external" : "app",
    body: row.body,
    summaryKo: row.summary_ko,
    summaryEn: row.summary_en,
    writtenYear: row.written_year,
    createdAt: row.created_at,
    language: row.language === "en" ? "en" : "ko",
    sentiment:
      row.sentiment === "positive" || row.sentiment === "negative" || row.sentiment === "neutral"
        ? row.sentiment
        : null, // 아직 AI 판정 전
    // 앱 안 후기에는 닉네임만 보여 준다. (실명·이메일은 저장소에서 읽지도 않는다)
    authorNickname: row.origin === "app" ? nickname : null,
    rating: row.rating,
    authorName: row.author_name,
    originalUrl: row.original_url,
    linkCheckedAt: row.link_checked_at,
  };
}
