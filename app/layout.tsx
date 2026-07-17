import type { Metadata } from "next";
import { IBM_Plex_Sans, Doto, Inter } from "next/font/google";
import GlobalShader from '@/components/GlobalShaders'
import ScreenOverlay from '@/components/ScreenOverlay'
import PrimaryFooter from '@/components/ui/PrimaryFooter'
import ScrollToTopButton from '@/components/ui/ScrollToTopButton'

import "./globals.scss";

// Loads IBM Plex Sans with static weights 300/400/500/600.
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
