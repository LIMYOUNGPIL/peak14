// 로그인·가입 입력 검사
//
// Design Ref: §6 — 입력값 검사는 zod 로 한다.

import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.string().trim().pipe(z.email()),
  password: z.string().min(8).max(72),
});

// 로그인을 마친 뒤 돌아갈 주소를 안전하게 고른다.
// 같은 사이트 안의 주소만 허용한다. 다른 사이트로 보내는 속임수(열린 리다이렉트)를 막기 위해서다.
//
// 문자열 모양만 보면 "/" 뒤에 탭을 끼운 "/\t/evil.com" 같은 값이 통과한다.
// 브라우저는 주소를 해석할 때 탭·줄바꿈을 지워서 "//evil.com"(다른 사이트)으로 읽기 때문이다.
// 그래서 (1) 제어 문자를 거부하고 (2) 실제로 주소로 해석해 우리 사이트 안인지 확인한 뒤
// (3) 해석된 경로만 돌려준다.
const SAFE_BASE = "https://peak14.invalid";

export function safeNextPath(value: unknown): string {
  if (typeof value !== "string" || value.length === 0 || value.length > 500) return "/";
  // 제어 문자(탭·줄바꿈 포함)와 역슬래시는 브라우저가 다르게 해석하므로 거부한다.
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, SAFE_BASE);
    if (url.origin !== SAFE_BASE) return "/";
    const out = url.pathname + url.search;
    // 해석하면서 "/..//evil.com" 이 "//evil.com" 으로 정리될 수 있다. 결과도 다시 검사한다.
    if (!out.startsWith("/") || out.startsWith("//")) return "/";
    return out;
  } catch {
    return "/";
  }
}
