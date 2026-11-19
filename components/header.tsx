"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpGuideModal } from "@/components/ui/help-guide-modal";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Sparkles,
  ChevronRight,
  Database,
  Search,
  PanelLeft,
  Briefcase,
  Users,
  Layers,
  BarChart3,
  GraduationCap,
} from "lucide-react";

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onToggleSidebarCollapse: () => void;
  isSidebarCollapsed: boolean;
}

export function Header({
  onOpenMobileMenu,
  onToggleSidebarCollapse,
  isSidebarCollapsed,
}: HeaderProps) {
  const pathname = usePathname();

  // Determine current page title & parent for breadcrumbs
  const getPageInfo = () => {
    if (pathname === "/") return { title: "Dashboard", category: "Overview" };
    if (pathname.startsWith("/projects/")) {
      if (pathname.includes("/pipeline")) {
        return { title: "Staffing Pipeline", category: "Projects" };
      }
      return { title: "Project Overview", category: "Projects" };
    }
    if (pathname.startsWith("/projects")) return { title: "Projects", category: "Requisitions" };
    if (pathname.startsWith("/employers/")) return { title: "Candidate Profile", category: "Talent Bench" };
    if (pathname.startsWith("/employers")) return { title: "Talent Bench", category: "Candidates" };
    if (pathname.startsWith("/match")) return { title: "Match Studio", category: "AI Intelligence" };
    if (pathname.startsWith("/squad")) return { title: "Squad Builder", category: "AI Teams" };
    if (pathname.startsWith("/analytics")) return { title: "Market Intel", category: "Analytics" };
    if (pathname.startsWith("/courses")) return { title: "Academy", category: "Learning" };
    if (pathname.startsWith("/dossier")) return { title: "Executive Dossier", category: "Reporting" };
    return { title: "Platform", category: "TalentMatch" };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md shadow-2xs">
      {/* Left: Sidebar Toggle + Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Trigger */}
        <button
          onClick={onOpenMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 md:hidden cursor-pointer"
          aria-label="Open Mobile Menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleSidebarCollapse}
          className="hidden md:flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          aria-label="Toggle Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>

        {/* Breadcrumb Path */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="font-medium text-slate-400">
            {pageInfo.category}
          </span>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="font-bold text-slate-900">
            {pageInfo.title}
          </span>
        </div>
      </div>

      {/* Right Tools: Help Guide + Live DB + Action */}
      <div className="flex items-center gap-2.5">
        {/* "How It Works" Guide Modal */}
        <HelpGuideModal />

        {/* Live DB Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>PostgreSQL Live</span>
        </div>

        {/* Primary Analyze Action */}
        <Link href="/match">
          <Button
            variant="default"
            size="sm"
            className="shadow-sm shadow-indigo-600/20 text-xs font-semibold"
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Analyze Match</span>
            <span className="sm:hidden">Match</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
