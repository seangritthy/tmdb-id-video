import { initPolyfill } from '@/utils/xhr-polyfill';
initPolyfill();

export const runtime = 'edge';

import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/config/site";
import { Poppins, Battambang } from "@/utils/fonts";
import "../styles/globals.css";
import "../styles/lightbox.css";
import Providers from "./providers";
import TopNavbar from "@/components/ui/layout/TopNavbar";
import BottomNavbar from "@/components/ui/layout/BottomNavbar";
import Sidebar from "@/components/ui/layout/Sidebar";
import { cn } from "@/utils/helpers";
import { IS_PRODUCTION, SpacingClasses } from "@/utils/constants";
import dynamic from "next/dynamic";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Suspense } from "react";
const AdBlockerPrompt = dynamic(() => import("@/components/ui/overlay/AdBlockerPrompt"));
const ServerOriginBadge = dynamic(() => import("@/components/ui/overlay/ServerOriginBadge"));
import { DictionaryProvider } from "@/components/providers/DictionaryProvider";
import { getDictionary, LOCALE_COOKIE_KEY, Locale } from "@/utils/i18n";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: siteConfig.name,
  applicationName: siteConfig.name,
  description: siteConfig.description,
  manifest: "/manifest.json",
  icons: {
    icon: siteConfig.favicon,
  },
  twitter: {
    card: "summary",
    title: {
      default: siteConfig.name,
      template: siteConfig.name,
    },
    description: siteConfig.description,
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: {
      default: siteConfig.name,
      template: siteConfig.name,
    },
    description: siteConfig.description,
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0D0C0F" },
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get(LOCALE_COOKIE_KEY)?.value;
  const locale = (rawLocale === "en" ? "en" : "km") as Locale;
  const dictionary = getDictionary(locale);

  const fontClass = locale === "km" ? Battambang.className : Poppins.className;

  return (
    <html suppressHydrationWarning lang={locale}>
      <head>
        <link rel="dns-prefetch" href="https://dns.adguard.com" />
        <link rel="preconnect" href="https://dns.adguard.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://dns.adguard-dns.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{window.open=function(){return null;};}catch(e){}})();`,
          }}
        />
      </head>
      <body className={cn("bg-background min-h-dvh antialiased select-none", fontClass)}>
        <Suspense>
          <svg width="0" height="0" className="absolute hidden">
            <defs>
              <linearGradient id="googlePlayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4285F4" />
                <stop offset="33%" stopColor="#EA4335" />
                <stop offset="66%" stopColor="#FBBC05" />
                <stop offset="100%" stopColor="#34A853" />
              </linearGradient>
            </defs>
          </svg>
          <NuqsAdapter>
            <DictionaryProvider dictionary={dictionary}>
              <Providers>
                <AdBlockerPrompt />
                <ServerOriginBadge />
                <TopNavbar />
                <Sidebar>
                  <main className={cn("container mx-auto max-w-full", SpacingClasses.main)}>
                    {children}
                  </main>
                </Sidebar>
                <BottomNavbar />
              </Providers>
            </DictionaryProvider>
          </NuqsAdapter>
        </Suspense>
        {IS_PRODUCTION && (
          <script disable-devtool-auto src='https://cdn.jsdelivr.net/npm/disable-devtool@latest'></script>
        )}
      </body>
    </html>
  );
}
