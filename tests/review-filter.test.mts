// 후기 걸러내기 시험: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { checkReviewText } from "../lib/reviews/filter.ts";

const ok = (text: string) => assert.deepEqual(checkReviewText(text), [], `통과해야 함: ${text}`);
const blocked = (text: string, reason: string) =>
  assert.ok(checkReviewText(text).includes(reason as never), `${reason} 로 걸려야 함: ${text}`);

test("정상적인 트레킹 후기의 숫자·단위·날짜는 막지 않는다", () => {
  ok("에베레스트 8,849 m 가 보이는 전망이 정말 좋았습니다.");
  ok("거리는 160~230 km, 15-20일 정도 걸렸어요.");
  ok("2026-11-23 에 출발해서 5,416m 쏘롱라 패스를 넘었습니다.");
  ok("Thorung La pass (5416 m) was cold, we started at 4:30 and arrived at 14:10.");
  ok("숙소는 3곳, 하루 약 1,200 루피, 총 비용은 약 350000원 정도였습니다.");
  ok("야크 새끼를 봤는데 너무 귀여웠어요. 미친 듯이 아름다운 풍경이었습니다.");
  ok("The guide Dick Smith was great and the shiitake soup was good.");
});

test("전화번호는 여러 모양으로 막는다", () => {
  blocked("연락은 010-1234-5678 로 주세요", "phone");
  blocked("010 1234 5678", "phone");
  blocked("01012345678", "phone");
  blocked("+82 10 1234 5678", "phone");
  blocked("02-123-4567 로 전화", "phone");
  blocked("call me +977 98 4123 4567", "phone");
});

test("이메일과 주민등록번호 모양은 막는다", () => {
  blocked("메일은 someone@example.com 입니다", "email");
  blocked("900101-1234567", "idNumber");
  blocked("9001011234567", "idNumber");
});

test("카드번호처럼 긴 숫자는 막는다", () => {
  blocked("카드 1234 5678 9012 3456", "phone");
});

test("욕설은 한글·영어 모두 막고, 기호를 끼워도 막는다", () => {
  blocked("진짜 씨발 힘들었다", "profanity");
  blocked("씨.발 너무 추웠음", "profanity");
  blocked("시 발", "profanity");
  blocked("ㅅㅂ 고산병", "profanity");
  blocked("this trek was fucking hard", "profanity");
  blocked("What a bitch of a pass", "profanity");
});

test("걸린 이유만 돌려주고 글 내용은 돌려주지 않는다", () => {
  const result = checkReviewText("010-1234-5678");
  assert.ok(result.every((r) => typeof r === "string" && !r.includes("1234")));
});
