import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

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
        <html lang="en" className={cn(fraunces.variable, inter.variable)}>
        <body className="font-sans bg-[#F9F8F6] text-[#1A1A1E] antialiased">
        {children}
        </body>
        </html>
    );
}