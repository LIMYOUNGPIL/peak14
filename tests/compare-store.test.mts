// 비교 목록 저장값 읽기 시험: npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { parseStored } from "../lib/compare-store.ts";

test("저장값 읽기: 정상·중복·3개 이상·손상된 값", () => {
  assert.deepEqual(parseStored('["a-b","c"]'), ["a-b", "c"]);
  assert.deepEqual(parseStored('["a","a","b"]'), ["a", "b"]);
  assert.deepEqual(parseStored('["a","b","c"]'), ["a", "b"]);
  assert.deepEqual(parseStored(null), []);
  assert.deepEqual(parseStored("not json"), []);
  assert.deepEqual(parseStored('{"a":1}'), []);
  assert.deepEqual(parseStored('[1,"<script>","ok"]'), ["ok"]);
});
