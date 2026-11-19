"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";
import { HelpGuideModal } from "@/components/ui/help-guide-modal";
import {
  Compass,
  Briefcase,
  Users,
  Sparkles,
  Layers,
  BarChart3,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldCheck,
  Zap,
} from "lucide-react";

export interface NavGroup {
  label: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
    description: string;
  }[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [
      {
        href: "/",
        label: "Dashboard",
        icon: Compass,
        description: "Overview of projects, bench & metrics",
      },
    ],
  },
  {
    label: "Talent & Requisitions",
    items: [
      {
        href: "/projects",
        label: "Projects",
        icon: Briefcase,
        description: "Open company project requisitions",
      },
      {
        href: "/employers",
        label: "Talent Bench",
        icon: Users,
        description: "Candidate profiles and verified skills",
      },
    ],
  },
  {
    label: "AI Matching & Teams",
    items: [
      {
        href: "/match",
        label: "Match Studio",
        icon: Sparkles,
        badge: "AI",
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
        description: "1-on-1 AI compatibility & upskilling simulator",
      },
      {
        href: "/squad",
        label: "Squad Builder",
        icon: Layers,
        badge: "Teams",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
        description: "Multi-engineer complementary squad builder",
      },
    ],
  },
  {
    label: "Insights & Learning",
    items: [
      {
        href: "/analytics",
        label: "Market Intel",
        icon: BarChart3,
        description: "Skill supply vs demand & smart parser",
      },
      {
        href: "/courses",
        label: "Academy",
        icon: GraduationCap,
        description: "Curated bridge courses & learning paths",
      },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate?: () => void;
  isMobile?: boolean;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onNavigate,
  isMobile = false,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-slate-200/80 bg-white select-none transition-all duration-300 ease-in-out h-full",
        isMobile
          ? "w-full border-r-0"
          : isCollapsed
          ? "w-20"
          : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-slate-100">
        <Link
          href="/"
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 group transition-all overflow-hidden",
            isCollapsed && !isMobile && "justify-center w-full"
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 shadow-sm shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
              <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5 truncate">
                TalentMatch
                <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-mono text-indigo-700 border border-indigo-200 font-bold">
                  PRO
                </span>
              </span>
              <p className="text-[10px] text-slate-500 truncate">
                AI Talent & Project Matcher
              </p>
            </div>
          )}
        </Link>
      </div>

      {/* Nav Groups List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            {(!isCollapsed || isMobile) && (
              <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {group.label}
              </h3>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                const linkContent = (
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 cursor-pointer",
                      isActive
                        ? "bg-indigo-50/90 text-indigo-700 shadow-2xs font-bold border border-indigo-100/80"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      isCollapsed && !isMobile && "justify-center px-2"
                    )}
                  >
                    {/* Active accent pill indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-indigo-600" />
                    )}

                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                        isActive
                          ? "text-indigo-600"
                          : "text-slate-400 group-hover:text-slate-600"
                      )}
                    />

                    {(!isCollapsed || isMobile) && (
                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span
                            className={cn(
                              "rounded-md border px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider",
                              item.badgeColor
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );

                if (isCollapsed && !isMobile) {
                  return (
                    <Tooltip
                      key={item.href}
                      side="right"
                      content={
                        <div className="text-left">
                          <p className="font-bold text-white text-xs">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-slate-300">
                            {item.description}
                          </p>
                        </div>
                      }
                    >
                      {linkContent}
                    </Tooltip>
                  );
                }

                return <React.Fragment key={item.href}>{linkContent}</React.Fragment>;
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
        {/* PostgreSQL Status Pill */}
        <div
          className={cn(
            "flex items-center rounded-xl border border-emerald-200/80 bg-emerald-50/70 p-2 text-xs text-emerald-800 font-medium transition-all",
            isCollapsed && !isMobile ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {(!isCollapsed || isMobile) && (
              <span className="text-[11px] font-semibold text-emerald-900">
                Prisma Postgres Live
              </span>
            )}
          </div>
          {(!isCollapsed || isMobile) && (
            <Database className="h-3.5 w-3.5 text-emerald-600" />
          )}
        </div>

        {/* Desktop Collapse / Expand Button */}
        {!isMobile && (
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  );
}
