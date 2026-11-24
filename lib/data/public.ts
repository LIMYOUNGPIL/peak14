// 로그인 전에 화면으로 보내도 되는 정보만 골라 주는 도우미
//
// Design Ref: §5.2 — 로그인하지 않은 사람에게는 안전 유의사항의 "내용"을 보내지 않고 "건수"만 보낸다.
// 서버에서만 쓸 수 있다. 화면(브라우저) 코드가 산·루트 데이터 파일을 직접 불러오지 못하게 막기 위해서다.

import "server-only";
import type { Mountain, PublicMountain, PublicRoute, Route } from "@/types/mountain";
import { mountains } from "./mountains";

export function toPublicMountain(m: Mountain): PublicMountain {
  return {
    slug: m.slug,
    nameKo: m.nameKo,
    nameEn: m.nameEn,
    elevationM: m.elevationM,
    lat: m.lat,
    lon: m.lon,
    countries: m.countries,
    source: m.source,
    asOf: m.asOf,
    story: m.story,
    routeCount: m.routes.length,
  };
}

export function toPublicRoute(r: Route): PublicRoute {
  return { id: r.id, name: r.name, nameEn: r.nameEn, safetyCount: r.safetyNotes.length };
}

export function getPublicMountains(): PublicMountain[] {
  return mountains.map(toPublicMountain);
}
