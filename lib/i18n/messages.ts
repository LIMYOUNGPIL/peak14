// 화면 문구를 한곳에서 꺼내 쓰는 도우미
//
// Design Ref: §2.2 — 화면 문구는 messages/ 한곳에 모은다.
// 지금은 한국어(ko.json)만 있다. 영어 문구를 채우고 언어 선택을 연결하는 일은
// PLAN 18번 작업에서 하며, 그때도 화면 코드는 t("키") 부르는 방식 그대로 쓴다.

import ko from "@/messages/ko.json";

type Messages = typeof ko;

// "common.noInfo" 처럼 점으로 이어진 문구 이름만 쓸 수 있게 한다.
// 없는 이름을 쓰면 코드 검사(타입 검사)에서 바로 오류가 난다.
type Flatten<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : Flatten<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type MessageKey = Flatten<Messages>;

// 문구를 가져온다. 문구 안의 {이름} 자리는 vars 로 채운다.
// 예) t("home.routeCount", { count: 3 }) → "트레킹 루트 3개"
export function t(
  key: MessageKey,
  vars?: Record<string, string | number>,
): string {
  let value: unknown = ko;
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
