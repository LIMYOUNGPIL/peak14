import Link from "next/link";
import { notFound } from "next/navigation";
import { getMountain, mountains } from "@/lib/data/mountains";

export function generateStaticParams() {
  return mountains.map((m) => ({ slug: m.slug }));
}

export default async function MountainPage({
  params,
}: PageProps<"/mountains/[slug]">) {
  const { slug } = await params;
  const mountain = getMountain(slug);
  if (!mountain) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← 14좌 목록
      </Link>

      <header className="mt-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {mountain.nameKo}
        </h1>
        <p className="text-zinc-500">{mountain.nameEn}</p>
      </header>

      <h2 className="mb-4 text-lg font-semibold">트레킹 루트</h2>

      {mountain.routes.length === 0 ? (
        <p className="rounded-xl border border-dashed border-black/20 p-6 text-zinc-600 dark:border-white/20 dark:text-zinc-400">
          아직 등록된 루트가 없습니다. 출처를 확인한 정보만 등록합니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {mountain.routes.map((r) => (
            <li key={r.id}>
              <Link
                href={`/mountains/${mountain.slug}/routes/${r.id}`}
                className="block rounded-xl border border-black/10 p-5 transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/[.06]"
              >
                <span className="font-semibold">{r.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
