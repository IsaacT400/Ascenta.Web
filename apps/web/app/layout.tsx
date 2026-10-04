import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { PageTransition } from "@/components/page-transition";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Ascenta Executive", template: "%s | Ascenta Executive" },
  description: "Private chauffeur service for considered airport, executive, and city transportation.",
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${inter.variable} ${playfair.variable} antialiased`}><PageTransition>{children}</PageTransition></body></html>;
}
