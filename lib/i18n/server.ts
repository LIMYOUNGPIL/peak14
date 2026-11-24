// 서버에서 이용자가 고른 언어를 읽는다 (쿠키 peak14-lang, 없으면 한국어)

import "server-only";
import { cookies } from "next/headers";
import { makeT, toLocale, type Locale, type T } from "./messages";

export const LOCALE_COOKIE = "peak14-lang";

// 쿠키를 읽으므로 "요청이 올 때" 실행된다. 미리 만들어 두는 화면에서는 Suspense 안에서 불러야 한다.
export async function getLocale(): Promise<Locale> {
  return toLocale((await cookies()).get(LOCALE_COOKIE)?.value);
}

export async function getT(): Promise<T> {
  return makeT(await getLocale());
}
