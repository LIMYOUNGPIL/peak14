"use client";

// 후기 쓰기 양식: 별점(1~5점)과 후기 글
//
// 등록하면 서버가 욕설·개인정보를 걸러 보고, 걸리면 이유를 알려 준다. (입력한 글은 그대로 남겨 둔다)

import { useActionState, useState } from "react";
import type { ReviewFormState } from "@/lib/reviews/actions";

type Props = {
  action: (prev: ReviewFormState, formData: FormData) => Promise<ReviewFormState>;
  mountainSlug: string;
  routeId: string;
  text: {
    rating: string;
    ratingLabels: string[]; // 1점~5점의 읽어 주는 이름
    body: string;
    placeholder: string;
    counter: string; // "{n} / 1000자" 처럼 {n} 자리를 가진 문구 (서버 화면에서는 함수를 넘길 수 없다)
    submit: string;
    submitting: string;
  };
};

export default function ReviewForm({ action, mountainSlug, routeId, text }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    status: "idle",
    message: null,
  });
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");

  // 등록에 성공했을 때만 입력을 비운다. 걸러진 경우에는 고쳐 쓸 수 있게 글을 남겨 둔다.
  const [handledSuccess, setHandledSuccess] = useState<ReviewFormState | null>(null);
  if (state.status === "success" && handledSuccess !== state) {
    setHandledSuccess(state);
    setRating(0);
    setBody("");
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="mountainSlug" value={mountainSlug} />
      <input type="hidden" name="routeId" value={routeId} />

      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`rounded-lg border px-3 py-2 text-sm ${
            state.status === "error"
              ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300"
              : "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          }`}
        >
          {state.message}
        </p>
      )}

      <fieldset>
        <legend className="mb-1 text-sm text-zinc-600 dark:text-zinc-400">{text.rating}</legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer text-2xl leading-none">
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                required
                className="sr-only"
              />
              <span aria-label={text.ratingLabels[n - 1]} className={n <= rating ? "text-amber-400" : "text-zinc-400"}>
                ★
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block space-y-1">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">{text.body}</span>
        <textarea
          name="body"
          required
          rows={5}
          maxLength={1000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={text.placeholder}
          className="w-full rounded-lg border border-black/15 bg-transparent px-3 py-2 dark:border-white/20"
        />
        <span className="block text-right text-xs text-zinc-500">{text.counter.replace("{n}", String(body.length))}</span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-foreground px-5 py-2 font-medium text-background disabled:opacity-60"
      >
        {pending ? text.submitting : text.submit}
      </button>
    </form>
  );
}
