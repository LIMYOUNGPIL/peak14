// 모든 화면 요청 앞에서 로그인 상태를 새로 고친다.
// (Next.js 16 에서는 middleware 가 proxy 로 이름이 바뀌었다.)

import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/db/session";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // 정적 파일과 이미지는 건너뛴다.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
