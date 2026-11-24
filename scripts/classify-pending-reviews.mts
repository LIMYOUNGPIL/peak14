// 아직 판정되지 않은("판정 중") 앱 안 후기를 다시 판정한다.
//
// 실행: npm run classify:pending
// 후기를 등록한 직후 AI 호출이 실패했거나(네트워크, 한도 등) 키가 없었을 때 쓴다.
// .env 의 OPENAI_API_KEY 와 Supabase 서버 키를 읽는다. (값은 출력하지 않는다)

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { classifySentiment } from "../lib/ai/sentiment-core.ts";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(path.join(root, "package.json"));
const { createClient } = require("@supabase/supabase-js");

const env = Object.fromEntries(
  fs.readFileSync(path.join(root, ".env"), "utf8").split("\n")
    .filter((l) => /^[A-Za-z_]\w*=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);

const LIMIT = 50; // 한 번에 처리할 최대 건수 (비용 보호)
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: rows, error } = await admin
  .from("reviews")
  .select("id, body")
  .eq("origin", "app")
  .is("sentiment", null)
  .not("body", "is", null)
  .order("created_at", { ascending: true })
  .limit(LIMIT);
if (error) { console.error("후기를 읽지 못했습니다:", error.message); process.exit(1); }

let done = 0, failed = 0;
for (const r of rows ?? []) {
  const sentiment = await classifySentiment(r.body, { apiKey: env.OPENAI_API_KEY });
  if (!sentiment) { failed++; continue; }
  const { error: upErr } = await admin.from("reviews").update({ sentiment }).eq("id", r.id).is("sentiment", null);
  if (upErr) failed++; else done++;
}
console.log(`판정 중이던 후기 ${rows?.length ?? 0}건 → 판정 ${done}건, 실패 ${failed}건`);
