"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Compass,
  Briefcase,
  Users,
  Sparkles,
  GraduationCap,
  Menu,
  X,
  Database,
  Layers,
  BarChart3,
} from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Compass },
    { href: "/projects", label: "Projects", icon: Briefcase },
    { href: "/employers", label: "Employer Profiles", icon: Users },
    { href: "/match", label: "Match Studio", icon: Sparkles },
    { href: "/squad", label: "Squad Builder", icon: Layers },
    { href: "/analytics", label: "Market Analytics", icon: BarChart3 },
    { href: "/courses", label: "Courses Hub", icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-2xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-sm shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
              TalentMatch
              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-mono text-indigo-700 border border-indigo-200 font-bold">
                PRO
              </span>
            </span>
            <p className="text-[10px] text-slate-500 leading-none">
              Drizzle • PostgreSQL • Next.js
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive ? "text-indigo-600" : "text-slate-500"
                  )}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button & Database Status */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            <Database className="h-3 w-3" />
            <span>PostgreSQL 18</span>
          </div>

          <Link
            href="/match"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-700 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Analyze Match
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 shadow-lg space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className="h-4 w-4 text-indigo-600" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
