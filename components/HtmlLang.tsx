"use client";

// <html lang> 을 고른 언어에 맞춘다. (루트 레이아웃은 미리 만들어지므로 브라우저에서 바꾼다)

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n/messages";

export default function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
