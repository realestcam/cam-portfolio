import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
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
        <Analytics />
        {process.env.NEXT_PUBLIC_RB2B_ID && (
          <Script id="rb2b" strategy="afterInteractive">
            {`!function(){var reb2b=window.reb2b=window.reb2b||[];if(reb2b.invoked)return;reb2b.invoked=true;reb2b.methods=["identify","collect"];reb2b.factory=function(method){return function(){var args=Array.prototype.slice.call(arguments);args.unshift(method);reb2b.push(args);return reb2b;};};for(var i=0;i<reb2b.methods.length;i++){var key=reb2b.methods[i];reb2b[key]=reb2b.factory(key);}reb2b.load=function(key){var script=document.createElement("script");script.type="text/javascript";script.async=true;script.src="https://b2bjsstore.s3.us-west-2.amazonaws.com/b/"+key+"/"+key+".js.gz";var first=document.getElementsByTagName("script")[0];first.parentNode.insertBefore(script,first);};reb2b.SNIPPET_VERSION="1.0.1";reb2b.load("${process.env.NEXT_PUBLIC_RB2B_ID}");}();`}
          </Script>
        )}
      </body>
    </html>
  );
}
