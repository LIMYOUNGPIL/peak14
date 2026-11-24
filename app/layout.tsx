import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Header from "@/components/Header";
import { getT } from "@/lib/i18n/server";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Peak14",
  description: "Himalayan 14 peaks trekking routes and safety information · 히말라야 14좌 트레킹 루트와 안전 정보",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<div className="h-[65px] border-b border-black/10 dark:border-white/15" />}>
          <Header />
        </Suspense>
        {children}
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </body>
    </html>
  );
}

async function Footer() {
  const t = await getT();
  return (
    <footer className="border-t border-black/10 px-6 py-4 text-center text-xs text-zinc-500 dark:border-white/15">
      <Link href="/takedown" className="underline">{t("takedown.footerLink")}</Link>
    </footer>
  );
}
