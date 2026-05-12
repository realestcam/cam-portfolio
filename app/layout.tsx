import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { MobileTopBar } from "./components/MobileTopBar";

export const metadata: Metadata = {
  metadataBase: new URL("https://cameron-bell.com"),
  title: "Cameron Bell",
  description: "Art Director in LA.",
  openGraph: {
    title: "Cameron Bell",
    description: "Art Director in LA.",
    url: "https://cameron-bell.com",
    siteName: "Cameron Bell",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cameron Bell",
    description: "Art Director in LA.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Script id="cb-intro-check" strategy="beforeInteractive">
          {`(function(){try{var p=new URLSearchParams(location.search);var seen=localStorage.getItem('cb_hasSeenIntro')==='1';var force=p.get('intro')==='true';var skip=p.get('skipIntro')==='true';if(skip||(!force&&seen)){document.documentElement.classList.add('cb-skip-intro');}}catch(e){}})();`}
        </Script>
        <MobileTopBar />
        <div className="mobile-spacer" aria-hidden />
        {children}
      </body>
    </html>
  );
}
