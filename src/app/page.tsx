"use client";

import { useState } from "react";
import { AssessmentForm, formSchema } from "@/components/AssessmentForm";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { z } from "zod";
import Image from "next/image";
import { LanguageProvider, useLanguage } from "@/lib/i18n/LanguageContext";
import { SUPPORTED_LANGUAGES, LanguageCode } from "@/lib/i18n/config";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  return (
    <Select value={language} onValueChange={(val) => setLanguage(val as LanguageCode)}>
      <SelectTrigger className="w-[120px] h-9 text-xs font-medium bg-white/10 text-[#DDE8E1] border-white/20 hover:bg-white/20 focus:ring-0 focus-visible:ring-0">
        <Globe className="w-3.5 h-3.5 mr-2 opacity-70" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, config]) => (
          <SelectItem key={code} value={code}>
            {config.nativeLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MainApp() {
  const [assessmentData, setAssessmentData] = useState<z.infer<typeof formSchema> | null>(null);

  return (
    <div className="min-h-screen bg-app-bg text-text-primary font-sans">
      {/* Header */}
      <header className="bg-header-bg border-b border-white/10 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setAssessmentData(null)}
              className="flex items-center gap-2.5 md:gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-lg cursor-pointer group text-left"
              aria-label="Go to GramVyapar AI home"
            >
              <div className="rounded-[10px] overflow-hidden flex items-center justify-center bg-white shrink-0 shadow-sm border border-white/10 transition-transform group-hover:scale-105">
                <Image src="/logo.png" alt="GramVyapar AI Logo" width={48} height={48} className="w-9 h-9 md:w-11 md:h-11 object-contain" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight whitespace-nowrap mt-0.5">
                GramVyapar AI
              </h1>
            </button>
            <span className="hidden sm:inline-block text-[10px] md:text-xs font-semibold text-[#DDE8E1] bg-white/10 px-2 py-0.5 md:py-1 rounded-full border border-white/20 whitespace-nowrap self-center">
              Prototype
            </span>
          </div>
          <div className="flex items-center">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {!assessmentData ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 md:mb-3 text-text-primary">Hyper-Local Business Advisory</h2>
              <p className="text-text-secondary max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                Smart financial structuring and feasibility analysis for rural micro-entrepreneurs.
              </p>
            </div>
            <AssessmentForm onSubmitSuccess={setAssessmentData} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-300">
            <ResultsDashboard data={assessmentData} onReset={() => setAssessmentData(null)} />
          </div>
        )}
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
