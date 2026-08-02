import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Astera — Deep Research Workspace",
    template: "%s | Astera",
  },
  description:
    "Astera is an open-source research workspace that searches the web, reads trusted sources, reconciles evidence, and delivers comprehensive research reports.",
  keywords: [
    "AI research assistant",
    "deep research",
    "web scraper",
    "evidence synthesis",
    "report generator",
    "Auth.js",
    "Prisma Supabase",
    "ChatGPT alternative for research",
  ],
  authors: [{ name: "Astera Team" }],
  creator: "Astera",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://astera.vercel.app"),
  openGraph: {
    title: "Astera — Deep Research Workspace",
    description: "An open-source research workspace powered by multi-query planning and autonomous evidence agents.",
    url: "/",
    siteName: "Astera",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Astera — Deep Research Workspace",
    description: "Autonomous multi-query web research and evidence synthesis.",
    creator: "@astera_ai",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
