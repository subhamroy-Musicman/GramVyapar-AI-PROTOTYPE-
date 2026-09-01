"use client";

import { AssessmentShell } from "@/components/assessment/AssessmentShell";
import Image from "next/image";
import { LanguageProvider, useLanguage } from "@/lib/i18n/LanguageContext";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/i18n/config";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, HelpCircle } from "lucide-react";

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  return (
    <Select value={language} onValueChange={(val) => setLanguage(val as LanguageCode)}>
      <SelectTrigger className="w-[110px] h-8 text-[11px] font-medium bg-transparent text-text-primary border-border-subtle hover:bg-surface-subtle focus:ring-0 focus-visible:ring-0">
        <Globe className="w-3.5 h-3.5 mr-1.5 opacity-70" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, config]) => (
          <SelectItem key={code} value={code} className="text-[11px]">
            {config.nativeLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MainApp() {
  return (
    <div className="min-h-screen bg-[#F7F4EE] text-text-primary font-sans flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b border-border-subtle h-[64px] shrink-0 sticky top-0 z-50">
        <div className="w-full px-4 md:px-6 h-full flex items-center justify-between">
          
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-2.5 focus:outline-none rounded-sm group text-left"
              aria-label="GramVyapar AI home"
            >
              <div className="rounded-[6px] overflow-hidden flex items-center justify-center bg-white shrink-0 border border-border-subtle">
                <Image src="/logo.png" alt="GramVyapar AI Logo" width={28} height={28} className="w-7 h-7 object-contain p-0.5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-text-primary tracking-tight leading-none">
                  GramVyapar AI
                </h1>
                <p className="text-[10px] font-medium tracking-widest text-text-secondary mt-0.5 uppercase">
                  Rural Business Assessment
                </p>
              </div>
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-block text-[10px] font-bold tracking-wider text-text-secondary bg-surface-subtle px-2.5 py-1 rounded-full border border-border-subtle uppercase">
              MVP · Dairy Assessment
            </span>
            <div className="w-px h-4 bg-border-subtle hidden sm:block"></div>
            <button className="hidden sm:flex text-text-secondary hover:text-text-primary items-center gap-1.5 text-xs font-medium">
              <HelpCircle className="w-4 h-4" /> Help
            </button>
            <LanguageSelector />
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
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
