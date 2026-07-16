import type { Metadata } from "next";
import { IBM_Plex_Sans, Doto, Inter } from "next/font/google";
import GlobalShader from '@/components/GlobalShaders'
import ScreenOverlay from '@/components/ScreenOverlay'
import PrimaryFooter from '@/components/ui/PrimaryFooter'
import ScrollToTopButton from '@/components/ui/ScrollToTopButton'

import "./globals.scss";

// TRIAL SWAP — Ufficio (local font files) swapped for IBM Plex Sans, as a
// preview of the change. Same static weights Ufficio used (300/400/500/600),
// just Google-hosted instead of local .ttf files. Revert by restoring the
// old `localFont` Ufficio block + the previous variable name in
// globals.scss's --font-sans line.
const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const doto = Doto({
  variable: "--font-doto",
  subsets: ["latin"],
  weight: "variable",
  axes: ["ROND"],
});

export const metadata: Metadata = {
  title: "Dennis Cortés - Designer & Music Producer",
  description: "Software Product Designer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${inter.variable} ${doto.variable} antialiased`}>
      <body className="bg-white text-black dark:bg-black dark:text-white gradient-background">
        {/* The DOM the shader samples — all pages render inside this */}
        <div id="site-content" className="mx-auto w-full max-w-7xl">
          {children}
          <PrimaryFooter />
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
