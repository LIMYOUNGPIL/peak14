// 소셜 로그인 켜기 (.env 의 키를 Supabase 프로젝트에 등록한다)
//
// 실행: node scripts/configure-social-login.mjs
//       node scripts/configure-social-login.mjs --site-url https://내-배포-주소.vercel.app
//
// .env 에 아래 이름이 있으면 그 제공사를 켠다. (값은 화면에도 로그에도 출력하지 않는다)
//   구글:   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
//   카카오: KAKAO_CLIENT_ID,  KAKAO_CLIENT_SECRET
// 그리고 로그인을 마친 뒤 돌아올 수 있는 주소 목록(허용 목록)에 개발 주소와 배포 주소를 넣는다.

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");

// .env 읽기
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env"), "utf8")
    .split("\n")
    .filter((l) => /^[A-Za-z_][A-Za-z0-9_]*=/.test(l))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const token = env.SUPABASE_ACCESS_TOKEN;
const ref = env.SUPABASE_PROJECT_REF;
if (!token || !ref) {
  console.error("SUPABASE_ACCESS_TOKEN 과 SUPABASE_PROJECT_REF 가 .env 에 필요합니다.");
  process.exit(1);
}

const siteArg = process.argv.indexOf("--site-url");
const siteUrl = siteArg > -1 ? process.argv[siteArg + 1] : null;

const payload = {};
const enabled = [];
const missing = [];

for (const [name, idKey, secretKey] of [
  ["google", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
  ["kakao", "KAKAO_CLIENT_ID", "KAKAO_CLIENT_SECRET"],
]) {
  const id = env[idKey];
  const secret = env[secretKey];
  if (id && secret) {
    payload[`external_${name}_enabled`] = true;
    payload[`external_${name}_client_id`] = id;
    payload[`external_${name}_secret`] = secret;
    enabled.push(name);
  } else if (id || secret) {
    missing.push(`${name}: ${id ? secretKey : idKey} 가 없습니다`);
  }
}

// 로그인을 마치고 돌아올 수 있는 주소 (개발용 + 배포용)
const allow = ["http://localhost:3000/**"];
if (siteUrl) {
  allow.push(`${siteUrl.replace(/\/$/, "")}/**`);
  payload.site_url = siteUrl.replace(/\/$/, "");
}
payload.uri_allow_list = allow.join(",");

const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
if (!res.ok) {
  console.error(`Supabase 설정 변경 실패: ${res.status}`);
  process.exit(1);
}

console.log("켜진 소셜 로그인:", enabled.length ? enabled.join(", ") : "없음 (.env 에 키가 아직 없습니다)");
for (const m of missing) console.log("확인 필요 ->", m);
console.log("돌아올 수 있는 주소:", allow.join(", "));
console.log("");
console.log("제공사(구글·카카오) 설정 화면의 '리디렉션 URI'에 아래 주소를 등록하세요:");
console.log(`  ${env.NEXT_PUBLIC_SUPABASE_URL ?? `https://${ref}.supabase.co`}/auth/v1/callback`);
