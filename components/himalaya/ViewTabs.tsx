"use client";

// 화면 방식 선택: 3D / 목록 / 피크 한 곳씩 보기
// 첫 화면의 세 가지 보기 방식을 한 줄로 바꿔 준다.

import { makeT, type Locale } from "@/lib/i18n/messages";

export type ViewMode = "scene" | "list" | "spotlight";

type Props = {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
  locale: Locale;
  sceneDisabled?: boolean; // 3D를 쓸 수 없는 기기
  className?: string;
};

export default function ViewTabs({ view, onChange, locale, sceneDisabled, className = "" }: Props) {
  const t = makeT(locale);
  const items: { id: ViewMode; label: string; disabled?: boolean }[] = [
    { id: "scene", label: t("explore.viewScene"), disabled: sceneDisabled },
    { id: "list", label: t("explore.viewList") },
    { id: "spotlight", label: t("explore.viewSpotlight") },
  ];
  return (
    <div role="group" aria-label={t("explore.viewLabel")} className={`hx-tabs ${className}`}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={item.disabled}
          aria-pressed={view === item.id}
          onClick={() => view !== item.id && onChange(item.id)}
          className={`hx-tab ${view === item.id ? "is-on" : ""}`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
