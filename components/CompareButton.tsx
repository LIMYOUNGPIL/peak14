"use client";

// "비교에 담기" 버튼 (루트 화면). 담은 루트가 2개가 되면 "비교하기" 링크가 나온다.

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { addToCompare, clearCompare, getServerSnapshot, getSnapshot, removeFromCompare, subscribe } from "@/lib/compare-store";

type Props = {
  routeId: string;
  text: { add: string; remove: string; full: string; compare: string; clear: string; count: string };
};

const btn = "rounded-full border border-black/15 px-4 py-1.5 text-sm transition-colors hover:bg-black/[.04] dark:border-white/20 dark:hover:bg-white/[.06]";

export default function CompareButton({ routeId, text }: Props) {
  const ids: string[] = JSON.parse(useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot));
  const [full, setFull] = useState(false);
  const has = ids.includes(routeId);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {has ? (
        <button type="button" className={btn} onClick={() => { removeFromCompare(routeId); setFull(false); }}>{text.remove}</button>
      ) : (
        <button type="button" className={btn} onClick={() => setFull(addToCompare(routeId) === "full")}>{text.add}</button>
      )}
      {ids.length === 2 && (
        <Link href={`/compare?a=${encodeURIComponent(ids[0])}&b=${encodeURIComponent(ids[1])}`} className="rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background">
          {text.compare}
        </Link>
      )}
      {ids.length > 0 && (
        <button type="button" className="text-xs text-zinc-500 underline" onClick={() => { clearCompare(); setFull(false); }}>{text.clear}</button>
      )}
      <span className="text-xs text-zinc-500" role="status">{full ? text.full : text.count.replace("{n}", String(ids.length))}</span>
    </div>
  );
}
