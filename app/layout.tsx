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
  title: "Seclure — Security for Vibe Coders",
  description:
    "We don't just find security holes. We fix them. Auto-fix vulnerabilities in apps built with Cursor, Lovable, Bolt, and Replit.",
  keywords: [
    "security",
    "vibe coding",
    "cursor",
    "lovable",
    "bolt.new",
    "replit",
    "API key exposure",
    "supabase security",
    "indie hacker security",
  ],
  authors: [{ name: "Seclure" }],
  metadataBase: new URL("https://seclure.vercel.app"),
  openGraph: {
    title: "Seclure — Security for Vibe Coders",
    description:
      "We don't just find security holes. We fix them. Ship secure, ship fast.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seclure — Security for Vibe Coders",
    description:
      "We don't just find security holes. We fix them. Ship secure, ship fast.",
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
