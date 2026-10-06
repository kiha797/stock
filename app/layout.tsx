import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KNEE · 나의 투자 관제실",
  description: "MACD 20·60·9와 무릎가격으로 점검하는 국내·미국 투자 워크스페이스",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
