import Link from "next/link";
import { mountains } from "@/lib/data/mountains";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Peak14</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          히말라야 14좌의 트레킹 루트와 안전 정보를 한곳에서 확인하세요.
        </p>
      </header>

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
                  ? `트레킹 루트 ${m.routes.length}개`
                  : "등록된 루트 없음"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
