"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  HelpCircle,
  Sparkles,
  Briefcase,
  Users,
  GraduationCap,
  Layers,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export function HelpGuideModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-2xs hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
        title="New here? See how this tool works"
      >
        <HelpCircle className="h-3.5 w-3.5 text-indigo-500" />
        <span>How It Works</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles className="h-4 w-4" />
              </div>
              <DialogTitle>Quick Guide to TalentMatch Pro</DialogTitle>
            </div>
            <DialogDescription>
              Understand how to find, evaluate, and place engineering talent in 3 easy steps — no tech background needed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-2">
            {/* Step 1 */}
            <div className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">
                1
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-600" />
                  Pick a Project or Job Opening
                </h4>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                  Browse company requisitions in <strong>Projects</strong> to see what skills (e.g. React, Python, Cloud) and experience levels are required.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">
                2
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                  Match Talent & Check Readiness
                </h4>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                  In <strong>Match Studio</strong>, the AI grades candidate fit from 0 to 100%. A traffic-light verdict tells you instantly if they are ready to hire today or need quick training.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">
                3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
                  Close Gaps or Place into Pipeline
                </h4>
                <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                  Click <em>"Simulate Closing Gaps"</em> to see how short accredited courses turn a 75% match into a 95% perfect fit, then add them directly to your hiring pipeline!
                </p>
              </div>
            </div>

            {/* Bonus: Squad Builder */}
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <Layers className="h-3.5 w-3.5 text-indigo-600" />
                <span>Bonus: Need a whole team?</span>
              </div>
              <p className="mt-1 text-[11px] text-indigo-700 leading-relaxed">
                Use <strong>Squad Builder</strong> to pair 2 to 3 engineers together. The engine calculates how their collective skills cover 100% of the project without hiring an army.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="default"
              onClick={() => setIsOpen(false)}
              className="w-full sm:w-auto"
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" />
              Got It, Let's Explore!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
