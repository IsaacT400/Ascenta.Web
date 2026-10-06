import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { PageTransition } from "@/components/page-transition";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  title: { default: "ASCENTA · Executive Transportation", template: "%s | ASCENTA" },
  description: "Prepare executive transportation requests and follow their review in your ASCENTA account.",
  other: { "codex-preview": "development" },
  icons: { icon: "/ascenta-logo.png", shortcut: "/ascenta-logo.png" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${inter.variable} ${playfair.variable} antialiased`}><PageTransition>{children}</PageTransition></body></html>;
}
