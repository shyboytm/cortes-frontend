import type { Metadata } from "next";
import { Suspense } from "react";
import { Space_Grotesk, Space_Mono, Doto } from "next/font/google";
import GlobalShader from '@/components/GlobalShaders'
import ScreenOverlay from '@/components/ScreenOverlay'
import PrimaryFooter from '@/components/ui/PrimaryFooter'
import ScrollToTopButton from '@/components/ui/ScrollToTopButton'
import ScrollRestoration from '@/components/ScrollRestoration'
import NavigationHistoryTracker from '@/components/NavigationHistoryTracker'
import CuelumeSetup from '@/components/CuelumeSetup'
import ImageProtection from '@/components/ImageProtection'
import { Analytics } from '@vercel/analytics/next';
import { SITE_URL } from '@/lib/site-config';
import { resolvePageMetadata } from '@/lib/page-meta';
import { SpeedInsights } from "@vercel/speed-insights/next"

import "./globals.scss";

const ibmPlexSans = Space_Grotesk({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const doto = Doto({
  variable: "--font-doto-marquee",
  subsets: ["latin"],
  weight: "variable",
  axes: ["ROND"],
});

export async function generateMetadata(): Promise<Metadata> {
  const homeMetadata = await resolvePageMetadata(
    "home",
    {
      title: "Designer & Music Producer",
      description: "Software Designer, Musician, and Photographer based in Nashville, TN",
    },
    "/"
  );

  return {
    metadataBase: new URL(SITE_URL),
    ...homeMetadata,
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${spaceMono.variable} ${doto.variable} antialiased`}>
      <body className="bg-white text-black dark:bg-black dark:text-white gradient-background">
        <ScrollRestoration />
        <NavigationHistoryTracker />
        <CuelumeSetup />
        <ImageProtection />

        <div id="site-content" className="mx-auto w-full max-w-7xl">
          {children}
          <Analytics />
          <SpeedInsights/>
          <Suspense fallback={<div className="h-[400px]" />}>
            <PrimaryFooter />
          </Suspense>
        </div>
        
        <GlobalShader />
        <ScreenOverlay />
        <ScrollToTopButton />
      </body>
    </html>
  );
}
