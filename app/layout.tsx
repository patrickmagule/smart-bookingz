import type { Metadata } from "next";
import { Fraunces, Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "HostelFind — Find Your Home Away from Home",
  description:
      "Discover, compare, and book verified off-campus hostels near MUBAS with real-time availability and transparent pricing.",
};

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className={cn(fraunces.variable, inter.variable, "font-sans", geist.variable)}>
      <body className="font-sans bg-navy">{children}</body>
      </html>
  );
}