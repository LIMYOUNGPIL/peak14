import { Suspense } from "react";
import Experience from "@/components/himalaya/Experience";
import { getPublicMountains } from "@/lib/data/public";
import { getLocale } from "@/lib/i18n/server";

// 첫 화면: 히말라야 3D 전경. 드래그로 돌려 보고, 산을 누르면 정보가 나온다.
// (3D를 쓸 수 없으면 14좌 목록으로 바뀐다.)
export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeExperience />
    </Suspense>
  );
}

async function HomeExperience() {
  const locale = await getLocale(); // 고른 언어는 쿠키에서 읽는다
  // 화면(브라우저)으로는 로그인 전에도 되는 공개 정보만 보낸다.
  return <Experience mountains={getPublicMountains()} locale={locale} />;
}
