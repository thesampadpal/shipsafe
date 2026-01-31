import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShipSafe — Security Scanner for AI-Built Apps",
  description:
    "Free security scan for apps built with Cursor, Lovable, Bolt, and Replit. Find exposed API keys, broken RLS, and missing security headers in 60 seconds.",
  keywords: [
    "security scanner",
    "vibe coding",
    "cursor",
    "lovable",
    "bolt.new",
    "replit",
    "API key exposure",
    "supabase security",
    "indie hacker security",
  ],
  authors: [{ name: "ShipSafe" }],
  openGraph: {
    title: "ShipSafe — Security Scanner for AI-Built Apps",
    description:
      "Find exposed API keys before attackers do. Free security scan for vibe-coded apps.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShipSafe — Security Scanner for AI-Built Apps",
    description:
      "Find exposed API keys before attackers do. Free security scan for vibe-coded apps.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
