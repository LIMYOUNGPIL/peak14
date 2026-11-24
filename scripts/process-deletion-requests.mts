// 외부 글 삭제 요청 처리 (PLAN 14번)
//
// 목록 보기:   npm run takedown:process
// 승인·삭제:   npm run takedown:process -- --approve <요청 id>
//
// 접수된 요청은 자동으로 지워지지 않는다. 운영자가 요청자(원문 글쓴이·사이트 운영자)가 맞는지 확인한 뒤
// --approve 로 처리한다. 처리하면 그 원문 주소에 연결된 요약(구간 전부)을 지우고 요청을 "done"으로 바꾼다.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { matchesRequestedUrl } from "../lib/takedown/validation.ts";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(path.join(root, "package.json"));
const { createClient } = require("@supabase/supabase-js");
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, ".env"), "utf8").split("\n").filter((l) => /^[A-Za-z_]\w*=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

const i = process.argv.indexOf("--approve");
const approveId = i > -1 ? process.argv[i + 1] : null;

if (!approveId) {
  const { data, error } = await admin.from("deletion_requests").select("*").eq("status", "received").order("received_at");
  if (error) { console.error("읽지 못했습니다:", error.message); process.exit(1); }
  console.log(`처리 대기 ${data.length}건`);
  for (const r of data) {
    console.log(`\n- id ${r.id}\n  접수일 ${r.received_at} · ${r.requester_type === "author" ? "원문 글쓴이" : "사이트 운영자"} · ${r.contact_email ?? "연락처 없음"}\n  원문 ${r.original_url}${r.note ? `\n  사유 ${r.note}` : ""}`);
  }
  if (data.length) console.log("\n요청자를 확인했다면: npm run takedown:process -- --approve <id>");
  process.exit(0);
}

const { data: req } = await admin.from("deletion_requests").select("*").eq("id", approveId).eq("status", "received").maybeSingle();
if (!req) { console.error("처리 대기 중인 요청을 찾지 못했습니다."); process.exit(1); }
const { data: reviews } = await admin.from("reviews").select("id, original_url").eq("origin", "external").not("original_url", "is", null);
const targets = (reviews ?? []).filter((r: { original_url: string }) => matchesRequestedUrl(r.original_url, req.original_url));
if (targets.length) {
  const { error } = await admin.from("reviews").delete().in("id", targets.map((r: { id: string }) => r.id));
  if (error) { console.error("삭제 실패:", error.message); process.exit(1); }
}
await admin.from("deletion_requests").update({ status: "done" }).eq("id", req.id);
console.log(`요약 ${targets.length}건을 삭제하고 요청을 처리 완료로 바꿨습니다. ${req.contact_email ? `결과를 ${req.contact_email} 로 알려 주세요.` : ""}`);
