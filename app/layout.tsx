import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KNEE · 나의 투자 관제실",
  description: "MACD 20·60·9와 무릎가격으로 점검하는 국내·미국 투자 워크스페이스",
  other: {
    "google-adsense-account": "ca-pub-2520258098503069",
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
      <head><script id="labelpos-adsense-loader" dangerouslySetInnerHTML={{ __html: "(function(){var h=location.hostname;if(h!==\"toolbox.labelpos.com\"&&h!==\"stock.labelpos.com\")return;if(document.querySelector('script[src*=\"pagead2.googlesyndication.com/pagead/js/adsbygoogle.js\"]'))return;var s=document.createElement(\"script\");s.async=true;s.crossOrigin=\"anonymous\";s.src=\"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2520258098503069\";document.head.appendChild(s);})();" }} /></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
