"use client";

import { useState } from "react";
import { AssessmentForm, formSchema } from "@/components/AssessmentForm";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { z } from "zod";
import { Leaf } from "lucide-react";

export default function Home() {
  const [assessmentData, setAssessmentData] = useState<z.infer<typeof formSchema> | null>(null);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-2">
          <div className="bg-green-600 p-2 rounded-lg">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">GramVyapar AI <span className="text-sm font-normal text-slate-500 ml-2">Prototype</span></h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {!assessmentData ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-3">Hyper-Local Business Advisory</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Smart financial structuring and feasibility analysis for rural micro-entrepreneurs. 
                Fill out the details below to generate a tailored business model.
              </p>
            </div>
            <AssessmentForm onSubmitSuccess={setAssessmentData} />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
            <ResultsDashboard data={assessmentData} onReset={() => setAssessmentData(null)} />
          </div>
        )}
      </main>
    </div>
  );
}
