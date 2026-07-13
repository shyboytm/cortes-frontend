import type { Metadata } from "next";
import { Doto, Inter } from "next/font/google";
import localFont from "next/font/local";
import GlobalShader from '@/components/GlobalShaders'
import ScreenOverlay from '@/components/ScreenOverlay'
import PrimaryFooter from '@/components/ui/PrimaryFooter'

import "./globals.scss";

// Primary sans typeface. Local weight files, no variable axis, so each
// static weight is registered separately.
const ufficio = localFont({
  variable: "--font-ufficio",
  display: "swap",
  src: [
    { path: "./fonts/Ufficio-300.ttf", weight: "300", style: "normal" },
    { path: "./fonts/Ufficio-400.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Ufficio-500.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Ufficio-600.ttf", weight: "600", style: "normal" },
  ],
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
    <html lang="en" className={`${ufficio.variable} ${inter.variable} ${doto.variable} antialiased`}>
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
      </body>
    </html>
  );
}
