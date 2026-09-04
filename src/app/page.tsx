"use client";

import { AssessmentShell } from "@/components/assessment/AssessmentShell";
import Image from "next/image";







function MainApp() {
  return (
    <div className="min-h-screen bg-[#F7F4EE] text-text-primary font-sans flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-border-subtle h-[72px] shrink-0 sticky top-0 z-50">
        <div className="w-full px-4 md:px-6 h-full flex items-center justify-between">
          
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-3 focus:outline-none rounded-sm group text-left"
              aria-label="GramVyapar AI home"
            >
              <div className="rounded-[6px] overflow-hidden flex items-center justify-center bg-white shrink-0 border border-border-subtle">
                <Image src="/logo.png" alt="GramVyapar AI Logo" width={32} height={32} className="w-8 h-8 object-contain p-0.5" />
              </div>
              <div>
                <h1 className="text-[18px] font-bold text-text-primary tracking-tight leading-none">
                  GramVyapar AI
                </h1>
                <p className="text-[11px] font-medium tracking-widest text-text-secondary mt-1 uppercase">
                  Rural Business Assessment
                </p>
              </div>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-[11px] font-bold tracking-wider text-text-secondary bg-surface-subtle px-3 py-1.5 rounded-full border border-border-subtle uppercase">
              MVP · DAIRY ASSESSMENT
            </span>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full">
        <AssessmentShell onComplete={() => window.location.reload()} />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    
      <MainApp />
    
  );
}
