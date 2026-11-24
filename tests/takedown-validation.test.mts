// 삭제 요청 입력 검사 시험: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { matchesRequestedUrl, normalizeOriginalUrl, takedownSchema } from "../lib/takedown/validation.ts";

test("원문 주소: https 만 허용하고 # 뒤는 뗀다", () => {
  assert.equal(normalizeOriginalUrl(" https://en.wikivoyage.org/wiki/Annapurna_Circuit#Prepare "), "https://en.wikivoyage.org/wiki/Annapurna_Circuit");
  for (const bad of ["http://a.com/x", "javascript:alert(1)", "ftp://a.com", "https://user:pw@a.com/", "https://a.com/a b", "https://localhost/", "", "https://a.com/\\x", "x".repeat(2100)])
    assert.equal(normalizeOriginalUrl(bad), null, bad);
});

test("요청 양식: 정상 값은 통과, 잘못된 이메일·요청자·주소는 거부", () => {
  const ok = { originalUrl: "https://a.com/x#y", requesterType: "author", email: "me@a.com", note: "" };
  const r = takedownSchema.safeParse(ok);
  assert.ok(r.success && r.data.originalUrl === "https://a.com/x" && r.data.note === null);
  assert.equal(takedownSchema.safeParse({ ...ok, email: "no" }).success, false);
  assert.equal(takedownSchema.safeParse({ ...ok, requesterType: "admin" }).success, false);
  assert.equal(takedownSchema.safeParse({ ...ok, originalUrl: "http://a.com" }).success, false);
  assert.equal(takedownSchema.safeParse({ ...ok, note: "a".repeat(1001) }).success, false);
});

test("글 단위 요청은 그 글의 모든 구간 요약과 맞고, 비슷한 다른 글과는 맞지 않는다", () => {
  const base = "https://en.wikivoyage.org/wiki/Annapurna_Circuit";
  assert.equal(matchesRequestedUrl(base + "#Prepare", base), true);
  assert.equal(matchesRequestedUrl(base, base), true);
  assert.equal(matchesRequestedUrl(base + "_extra#X", base), false);
});
