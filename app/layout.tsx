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
import { Analytics } from '@vercel/analytics/next';

import "./globals.scss";

// Was IBM Plex Sans; swapped to Space Grotesk site-wide. Kept the
// "--font-ibm-plex-sans" variable name (same reasoning as the --font-doto
// and --font-space-mono aliases elsewhere in this file/globals.scss — a
// stable slot name for "the site's sans font", not a literal description)
// so --font-sans in globals.scss and the couple of explicit font-sans
// classes (PrimaryNav's wordmark/email link, DetailStickyBar's back
// button/like count) all pick this up with no further changes. Same static
// weights as before — 300/400/500/700 are all real static cuts Google
// serves for Space Grotesk, matching what was actually in use (400/500 body
// text, 700 for font-bold).
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

// Doto again, but scoped this time: it's the rounded variable-weight font
// this site used to use everywhere (see the --font-doto/dot-font naming
// still sprinkled through the codebase, now aliased to Space Mono instead —
// see globals.scss). Rather than reclaim that name and flip the whole site
// back, this is its own variable used in exactly one spot: the scrolling
// background phrase in WorkTogetherCTA.
const doto = Doto({
  variable: "--font-doto-marquee",
  subsets: ["latin"],
  weight: "variable",
  axes: ["ROND"],
});

export const metadata: Metadata = {
  title: "Dennis Cortés - Designer & Music Producer",
  description: "Software Designer, Musician, and Photographer based in Nashville, TN",
};

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

        <div id="site-content" className="mx-auto w-full max-w-7xl">
          {children}
          <Analytics />
          {/* PrimaryFooter awaits a Last.fm fetch server-side; Suspense keeps
              that from blocking the initial HTML flush for every route. */}
          <Suspense fallback={<div className="h-[400px]" />}>
            <PrimaryFooter />
          </Suspense>
        </div>

        {/* One canvas, every page */}
        <GlobalShader />

        {/* Film grain + CRT overlay, above all content on every page */}
        <ScreenOverlay />

        {/* Back-to-top, every page */}
        <ScrollToTopButton />
      </body>
    </html>
  );
}
