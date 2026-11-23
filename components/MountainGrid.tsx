// 14좌 카드 목록
//
// 3D 화면을 쓸 수 없거나 사용자가 "목록으로 보기"를 눌렀을 때 보여 주는 대체 화면.
// (Design Ref: §3.1 — 3D가 안 보이면 14좌 목록으로 전환할 수 있다.)

import Link from "next/link";
import type { Mountain } from "@/types/mountain";
import { t } from "@/lib/i18n/messages";

export default function MountainGrid({ mountains }: { mountains: Mountain[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {mountains.map((m, i) => (
        <li key={m.slug}>
          <Link
            href={`/mountains/${m.slug}`}
            className="block rounded-xl border border-black/10 p-5 transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
          >
            <span className="text-sm text-zinc-500">{i + 1}</span>
            <h2 className="mt-1 text-xl font-semibold">{m.nameKo}</h2>
            <p className="text-sm text-zinc-500">{m.nameEn}</p>
            <p className="mt-3 text-sm">
              {m.routes.length > 0
                ? t("home.routeCount", { count: m.routes.length })
                : t("home.noRoutes")}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
