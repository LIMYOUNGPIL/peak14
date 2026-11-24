import type { NextConfig } from "next";

// 보안 헤더 (공개 전 보안 점검 4번)
//
// 브라우저에게 "이 사이트는 이렇게만 다뤄라"라고 알려 주는 안전장치다.
//  - frame-ancestors / X-Frame-Options: 다른 사이트가 우리 화면을 투명한 틀로 덮어 클릭을 훔치는 것(클릭재킹)을 막는다.
//  - CSP: 불러올 수 있는 곳(스크립트, 이미지, 연결 주소)을 우리 사이트와 Supabase 로 제한한다.
//  - nosniff, Referrer-Policy, Permissions-Policy: 형식 추측·주소 유출·불필요한 기기 권한을 막는다.
//
// 한계: Next.js 의 미리 그린 화면은 매번 바뀌는 임시 값(nonce)을 쓸 수 없어서 script-src 에
// 'unsafe-inline' 을 허용한다. 그래서 CSP 가 "스크립트 끼워 넣기(XSS)"를 완전히 막아 주지는 않는다.
// 이 앱은 사용자가 입력한 글을 HTML 로 그리지 않아서(항상 글자로 그림) 이 부분은 다른 방어에 기댄다.
const isDev = process.env.NODE_ENV !== "production";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : "*.supabase.co";

const csp = [
  "default-src 'self'",
  // 개발 서버(빠른 새로고침)에는 eval 이 필요하다. 배포본에는 넣지 않는다.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // 브라우저에서 저장소(Supabase)로 직접 연결하는 주소
  `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  // 로그인 양식이 저장소·구글 로그인 주소로 이동하는 것을 허용한다.
  `form-action 'self' https://${supabaseHost} https://accounts.google.com`,
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // 응답 머리글에서 "Next.js 를 쓴다"는 정보를 지운다.
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
