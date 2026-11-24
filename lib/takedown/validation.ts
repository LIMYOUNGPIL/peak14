// 외부 글 삭제 요청 입력 검사 (PLAN 14번)
//
// 화면·저장소에 의존하지 않는 순수 코드라 시험에서 그대로 불러 쓴다.

import { z } from "zod";

export const DAILY_LIMIT_PER_EMAIL = 3; // 같은 연락처로 하루에 접수할 수 있는 수
export const DAILY_LIMIT_TOTAL = 30; // 전체 하루 접수 상한 (도배·공격 방지)

// 원문 주소를 정리한다: https 만 허용하고, # 뒤(구간 표시)는 떼어 글 단위로 맞춘다.
// 사용자 이름·비밀번호가 든 주소(https://a@b)와 이상한 글자는 거부한다.
export function normalizeOriginalUrl(value: string): string | null {
  const raw = value.trim();
  if (raw.length === 0 || raw.length > 2000 || /[\u0000- \u007f\\]/.test(raw)) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".")) return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export const takedownSchema = z.object({
  originalUrl: z.string().transform((v, ctx) => {
    const n = normalizeOriginalUrl(v);
    if (!n) ctx.addIssue({ code: "custom", message: "url" });
    return n ?? "";
  }),
  requesterType: z.enum(["author", "site-owner"]),
  email: z.string().trim().max(254).pipe(z.email()),
  note: z.string().trim().max(1000).optional().transform((v) => (v ? v : null)),
});

export type TakedownInput = z.infer<typeof takedownSchema>;

// 글 단위 주소와 구간 주소(…#Section)를 모두 찾기 위한 조건
export function matchesRequestedUrl(reviewUrl: string, requestedBase: string): boolean {
  return reviewUrl === requestedBase || reviewUrl.startsWith(requestedBase + "#");
}
