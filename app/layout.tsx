import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

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
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200/80 bg-white py-8 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="font-medium text-slate-600">
              TalentMatch Pro — Next.js 16 • Tailwind CSS v4 • Drizzle ORM • PostgreSQL
            </p>
            <p className="text-slate-400">
              Intelligent Skill Gap, Squad Building & Placement Engine
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
