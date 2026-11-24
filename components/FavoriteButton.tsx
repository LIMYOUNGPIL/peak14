"use client";

// ★ 즐겨찾기 버튼. 누르면 서버가 담거나 뺀다. 결과가 오기 전에도 바로 바뀐 것처럼 보여 준다.

import { useOptimistic, useState, useTransition } from "react";
import type { FavoriteState } from "@/lib/favorites/actions";

type Props = {
  mountainSlug: string;
  routeId: string | null;
  initial: boolean;
  action: (mountainSlug: string, routeId: string | null) => Promise<FavoriteState>;
  text: { add: string; remove: string; limit: string; failed: string };
};

export default function FavoriteButton({ mountainSlug, routeId, initial, action, text }: Props) {
  const [saved, setSaved] = useState(initial);
  const [optimistic, setOptimistic] = useOptimistic(saved);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={pending}
        aria-pressed={optimistic}
        onClick={() =>
          startTransition(async () => {
            setMessage(null);
            setOptimistic(!saved);
            const r = await action(mountainSlug, routeId);
            if (r.error) setMessage(r.error === "limit" ? text.limit : text.failed);
            else setSaved(r.favorited);
          })
        }
        className="rounded-full border border-black/15 px-4 py-1.5 text-sm transition-colors hover:bg-black/[.04] disabled:opacity-60 dark:border-white/20 dark:hover:bg-white/[.06]"
      >
        <span className={optimistic ? "text-amber-400" : "text-zinc-400"}>{optimistic ? "★" : "☆"}</span>{" "}
        {optimistic ? text.remove : text.add}
      </button>
      {message && <span role="alert" className="text-xs text-red-600 dark:text-red-300">{message}</span>}
    </div>
  );
}
