// 로그인 뒤 돌아갈 주소 검사 시험: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { safeNextPath } from "../lib/auth/validation.ts";

test("우리 사이트 안의 정상 주소는 그대로 통과한다", () => {
  assert.equal(safeNextPath("/"), "/");
  assert.equal(safeNextPath("/mountains/k2"), "/mountains/k2");
  assert.equal(safeNextPath("/mountains/annapurna/routes/annapurna-circuit"), "/mountains/annapurna/routes/annapurna-circuit");
  assert.equal(safeNextPath("/login?next=%2Fa"), "/login?next=%2Fa");
});

test("다른 사이트로 보내는 모든 모양을 첫 화면으로 바꾼다", () => {
  const attacks = [
    "//evil.com", "///evil.com", "/\\evil.com", "\\\\evil.com", "https://evil.com", "http://evil.com",
    "javascript:alert(1)", "data:text/html,x", "evil.com", "",
    "/\t/evil.com", "/\n/evil.com", "/\r/evil.com", "/\u0000/evil.com", "/ /evil.com\t", "/\u007f/evil.com",
  ];
  for (const a of attacks) assert.equal(safeNextPath(a), "/", `막혀야 함: ${JSON.stringify(a)}`);
});

test("퍼센트로 인코딩된 값은 우리 사이트 안의 경로일 뿐이라 다른 사이트가 되지 않는다", () => {
  const out = safeNextPath("/%09/evil.com");
  assert.ok(out.startsWith("/"));
  assert.equal(new URL(out, "https://peak14.example").origin, "https://peak14.example");
});

test("문자열이 아니거나 너무 긴 값은 첫 화면", () => {
  for (const v of [undefined, null, 123, ["/a"], {}]) assert.equal(safeNextPath(v), "/");
  assert.equal(safeNextPath("/" + "a".repeat(600)), "/");
});

test("어떤 입력이든 결과는 항상 우리 사이트 안의 경로이다", () => {
  const samples = ["/a/../../evil", "/%2f%2fevil.com", "/..//evil.com", "/.//evil.com", "/?next=//evil.com", "/#//evil.com"];
  for (const s of samples) {
    const out = safeNextPath(s);
    assert.ok(out.startsWith("/") && !out.startsWith("//"), `${s} -> ${out}`);
    assert.equal(new URL(out, "https://peak14.example").origin, "https://peak14.example");
  }
});
