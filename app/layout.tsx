import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import GlobalShader from '@/components/GlobalShaders'

import "./globals.scss";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body className="bg-white text-black dark:bg-black dark:text-white">
        {/* The DOM the shader samples — all pages render inside this */}
        <div id="site-content">
          {children}
        </div>

        {/* One canvas, every page */}
        <GlobalShader />
      </body>
    </html>
  );
}
