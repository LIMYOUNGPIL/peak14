// 화면 문구를 한곳에서 꺼내 쓰는 도우미 (한국어 ko / 영어 en)
//
// Design Ref: §2.2 — 화면 문구는 messages/ 한곳에 모은다.
//
// 쓰는 법
//  - 서버 화면·서버 동작:  const t = await getT();  t("common.noInfo")
//  - 브라우저 화면(use client): 서버 화면이 locale 을 props 로 넘겨 주면  translate(locale, "common.noInfo")
// en.json 은 ko.json 과 같은 문구 이름을 모두 가져야 한다. 빠지면 코드 검사(타입 검사)에서 바로 오류가 난다.

import en from "@/messages/en.json";
import ko from "@/messages/ko.json";

export type Locale = "ko" | "en";
export const LOCALES: Locale[] = ["ko", "en"];
export const DEFAULT_LOCALE: Locale = "ko";

type Messages = typeof ko;
const dictionaries: Record<Locale, Messages> = { ko, en };

// 알 수 없는 값은 기본 언어(한국어)로 본다.
export function toLocale(value: unknown): Locale {
  return value === "en" ? "en" : "ko";
}

// "common.noInfo" 처럼 점으로 이어진 문구 이름만 쓸 수 있게 한다.
type Flatten<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Flatten<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type MessageKey = Flatten<Messages>;

// 문구를 가져온다. 문구 안의 {이름} 자리는 vars 로 채운다.
// 예) translate("en", "home.routeCount", { count: 3 }) → "3 trekking routes"
export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let value: unknown = dictionaries[locale];
  for (const part of key.split(".")) {
    value = (value as Record<string, unknown>)[part];
  }
  let text = String(value);
  if (vars) {
    for (const [name, replacement] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(replacement));
    }
  }
  return text;
}

export type T = (key: MessageKey, vars?: Record<string, string | number>) => string;
export const makeT = (locale: Locale): T => (key, vars) => translate(locale, key, vars);
