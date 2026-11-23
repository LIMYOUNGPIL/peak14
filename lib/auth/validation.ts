// 로그인·가입 입력 검사
//
// Design Ref: §6 — 입력값 검사는 zod 로 한다.

import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z.string().min(8).max(72),
});

// 로그인을 마친 뒤 돌아갈 주소를 안전하게 고른다.
// 같은 사이트 안의 주소("/로 시작")만 허용해서, 다른 사이트로 보내는 속임수를 막는다.
export function safeNextPath(value: unknown): string {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
  ) {
    return value;
  }
  return "/";
}
