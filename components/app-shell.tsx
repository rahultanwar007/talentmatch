"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex shrink-0 h-full">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile Drawer Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 max-w-[85vw] border-r-0">
          <Sidebar
            isCollapsed={false}
            onToggleCollapse={() => {}}
            onNavigate={() => setIsMobileMenuOpen(false)}
            isMobile={true}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        {/* Modern Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onToggleSidebarCollapse={() => setIsCollapsed(!isCollapsed)}
          isSidebarCollapsed={isCollapsed}
        />

        {/* Scrollable Main Canvas */}
        <main className="flex-1 overflow-y-auto">
          {children}

          {/* Clean App Footer */}
          <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500 mt-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="font-semibold text-slate-600">
                TalentMatch Pro — Intelligent Profile & Project Matcher
              </p>
              <p className="text-slate-400">
                Next.js 16 • Tailwind CSS v4 • Drizzle ORM • PostgreSQL 18
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
