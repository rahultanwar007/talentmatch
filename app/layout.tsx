import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalentMatch Pro — Intelligent Profile & Project Matcher",
  description:
    "Match employer/talent profiles against company project requirements with AI skill gap analysis, multi-candidate squad builder, and automated ATS pipeline.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f8fafc",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ colorScheme: "light" }}
    >
      <body className="h-full bg-slate-50 text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900 overflow-hidden">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
