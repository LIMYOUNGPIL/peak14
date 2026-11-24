// 한국어·영어 문구 시험: 문구 이름과 {자리표시자}가 두 언어에서 같아야 한다. npm test
import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

const load = (l: string) => JSON.parse(fs.readFileSync(new URL(`../messages/${l}.json`, import.meta.url), "utf8"));
function flat(d: Record<string, unknown>, p = ""): Record<string, string> {
  return Object.entries(d).reduce((acc, [k, v]) =>
    typeof v === "object" && v ? { ...acc, ...flat(v as Record<string, unknown>, `${p}${k}.`) } : { ...acc, [`${p}${k}`]: String(v) }, {});
}
const holders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");

test("두 언어의 문구 이름이 같다", () => {
  assert.deepEqual(Object.keys(flat(load("ko"))).sort(), Object.keys(flat(load("en"))).sort());
});

test("두 언어의 {자리표시자}가 같고, 영어 문구가 비어 있지 않다", () => {
  const ko = flat(load("ko")), en = flat(load("en"));
  for (const k of Object.keys(ko)) {
    assert.equal(holders(en[k]), holders(ko[k]), k);
    if (ko[k] !== "") assert.notEqual(en[k], "", k);
  }
});
