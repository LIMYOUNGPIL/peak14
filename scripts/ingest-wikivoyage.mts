// 위키보야지(Wikivoyage) 여행 안내 글을 요약해 루트별 "외부 글 요약 후기"로 저장한다 (PLAN 13번)
//
// 실행: node scripts/ingest-wikivoyage.mts --dry-run   (저장하지 않고 결과만 출력)
//       node scripts/ingest-wikivoyage.mts             (실제 저장)
//
// 지키는 규칙
//  - 위키보야지는 CC BY-SA 4.0 이다. 원문 링크 + 라이선스 표기를 함께 저장하고, 원문 전체는 복사하지 않는다(요약만).
//  - 안전 관련 구간("Stay safe" 등)은 AI가 요약하지 않는다. (안전 유의사항은 공식 자료만 그대로 보여 준다)
//  - 같은 구간을 두 번 저장하지 않는다(루트+원문 주소가 같으면 건너뜀).
//  - 위키미디어 서버 예의: 요청 사이에 간격을 둔다.

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { classifySentiment } from "../lib/ai/sentiment-core.ts";
import { summarizeSection } from "../lib/ai/summarize-core.ts";

const root = path.resolve(import.meta.dirname, "..");
const require = createRequire(path.join(root, "package.json"));
const { createClient } = require("@supabase/supabase-js");
const dryRun = process.argv.includes("--dry-run");

const env = Object.fromEntries(
  fs.readFileSync(path.join(root, ".env"), "utf8").split("\n")
    .filter((l) => /^[A-Za-z_]\w*=/.test(l))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")]),
);

// 위키보야지 글 제목 → 우리 루트 id
const ARTICLES: { title: string; routeId: string }[] = [
  { title: "Annapurna Circuit", routeId: "annapurna-circuit" },
  { title: "Annapurna Sanctuary trek", routeId: "annapurna-sanctuary" },
  { title: "Everest Base Camp Trek", routeId: "everest-base-camp-trek" },
  { title: "Manaslu Trek", routeId: "manaslu-circuit" },
  { title: "K2 base camp trek", routeId: "baltoro-concordia" },
];
const WANTED = /^(understand|prepare|walk|get in|itinerar|route|see|do)/i;
const SKIPPED = /(safe|health|danger|cope|respect|connect)/i; // 안전·건강 구간은 요약하지 않는다
const MAX_PER_ROUTE = 3;
const MIN_CHARS = 400;
const WAIT_MS = 12000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const today = new Date().toISOString().slice(0, 10);

async function fetchArticle(title: string) {
  const url = "https://en.wikivoyage.org/w/api.php?" + new URLSearchParams({
    action: "query", format: "json", formatversion: "2", redirects: "1",
    prop: "extracts|revisions", explaintext: "1", rvprop: "timestamp", titles: title,
  });
  const res = await fetch(url, { headers: { "User-Agent": "Peak14-student-project/0.1 (trekking info app)" } });
  if (!res.ok) throw new Error(`${title}: HTTP ${res.status}`);
  const page = (await res.json()).query?.pages?.[0];
  if (!page || page.missing) throw new Error(`${title}: 글이 없습니다`);
  return { title: page.title as string, text: page.extract as string, edited: page.revisions?.[0]?.timestamp as string };
}

// "== 제목 ==" 단위(최상위)로 나눈다. 하위 제목("=== ... ===")은 본문에 그대로 포함한다.
function sections(text: string) {
  const parts = text.split(/^== ([^=].*?) ==\s*$/m);
  const out: { heading: string; body: string }[] = [];
  for (let i = 1; i < parts.length; i += 2) out.push({ heading: parts[i].trim(), body: (parts[i + 1] ?? "").trim() });
  return out;
}

const admin = dryRun ? null : createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let saved = 0, skipped = 0, rejected = 0;
for (const [i, a] of ARTICLES.entries()) {
  if (i > 0) await sleep(WAIT_MS);
  let art;
  try { art = await fetchArticle(a.title); } catch (e) { console.log(`✗ ${(e as Error).message}`); continue; }
  const year = new Date(art.edited).getUTCFullYear();
  const picked = sections(art.text)
    .filter((s) => WANTED.test(s.heading) && !SKIPPED.test(s.heading) && s.body.length >= MIN_CHARS)
    .slice(0, MAX_PER_ROUTE);
  console.log(`\n■ ${art.title} → ${a.routeId} (마지막 편집 ${art.edited.slice(0, 10)}, 구간 ${picked.length}개)`);

  for (const s of picked) {
    const originalUrl = `https://en.wikivoyage.org/wiki/${encodeURIComponent(art.title.replace(/ /g, "_"))}#${encodeURIComponent(s.heading.replace(/ /g, "_"))}`;
    if (admin) {
      const { data: exists } = await admin.from("reviews").select("id").eq("route_id", a.routeId).eq("original_url", originalUrl).maybeSingle();
      if (exists) { console.log(`  · ${s.heading}: 이미 저장됨, 건너뜀`); skipped++; continue; }
    }
    const summary = await summarizeSection(s.body, { apiKey: env.OPENAI_API_KEY });
    if (!summary) { console.log(`  ✗ ${s.heading}: 요약 실패 또는 근거 없는 숫자 포함 → 버림`); rejected++; continue; }
    const sentiment = await classifySentiment(summary.en, { apiKey: env.OPENAI_API_KEY });
    console.log(`  ✓ ${s.heading} [${sentiment ?? "판정 중"}]\n    KO: ${summary.ko}\n    EN: ${summary.en}\n    ${originalUrl}`);
    if (admin) {
      const { error } = await admin.from("reviews").insert({
        route_id: a.routeId, origin: "external", language: "en", written_year: year,
        summary_ko: summary.ko, summary_en: summary.en, sentiment,
        author_name: "Wikivoyage 기여자", original_url: originalUrl,
        license: "CC BY-SA 4.0", link_checked_at: today,
      });
      if (error) console.log(`    저장 실패: ${error.message}`); else saved++;
    }
  }
}
console.log(`\n${dryRun ? "[dry-run] " : ""}저장 ${saved}건, 건너뜀 ${skipped}건, 버림 ${rejected}건`);
