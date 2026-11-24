"use server";

// 언어 바꾸기 (서버 동작): 선택한 언어를 쿠키에 저장한다.
// 쿠키에는 "ko"/"en" 두 값만 저장하고, 그 밖의 값은 한국어로 취급한다. 개인 정보는 담지 않는다.

import { cookies } from "next/headers";
import { toLocale } from "./messages";
import { LOCALE_COOKIE } from "./server";

export async function setLocale(value: string): Promise<void> {
  (await cookies()).set(LOCALE_COOKIE, toLocale(value), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}
