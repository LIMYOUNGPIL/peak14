// 외부 글 원문 링크 확인 (PLAN 14번)
//
// 실행: npm run links:check
// 저장된 외부 요약의 원문 주소(글 단위)를 열어 보고, 열리면 "링크 확인일"을 오늘로 바꾼다.
// 열리지 않으면(404·410 등) 목록으로 알려 준다. 자동으로 지우지는 않는다. (일시 오류일 수 있어 사람이 판단)

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(path.join(root, "package.json"));
const { createClient } = require("@supabase/supabase-js");
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, ".env"), "utf8").split("\n").filter((l) => /^[A-Za-z_]\w*=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const today = new Date().toISOString().slice(0, 10);

const { data, error } = await admin.from("reviews").select("id, route_id, original_url").eq("origin", "external").not("original_url", "is", null);
if (error) { console.error("읽지 못했습니다:", error.message); process.exit(1); }

// 같은 글의 여러 구간은 한 번만 확인한다.
const byPage = new Map<string, string[]>();
for (const r of data) {
  const page = r.original_url.split("#")[0];
  byPage.set(page, [...(byPage.get(page) ?? []), r.id]);
}

let ok = 0; const broken: string[] = []; let n = 0;
for (const [page, ids] of byPage) {
  if (n++ > 0) await new Promise((r) => setTimeout(r, 3000)); // 예의상 간격
  let status = 0;
  try {
    const res = await fetch(page, { method: "GET", redirect: "follow", headers: { "User-Agent": "Peak14-student-project/0.1 (link check)" }, signal: AbortSignal.timeout(20000) });
    status = res.status;
  } catch { status = 0; }
  if (status >= 200 && status < 300) {
    await admin.from("reviews").update({ link_checked_at: today }).in("id", ids);
    ok++;
  } else broken.push(`${page} (상태 ${status || "연결 실패"}, 요약 ${ids.length}건)`);
}
console.log(`확인한 글 ${byPage.size}개 → 열림 ${ok}개, 문제 ${broken.length}개`);
for (const b of broken) console.log("  확인 필요 ->", b);
