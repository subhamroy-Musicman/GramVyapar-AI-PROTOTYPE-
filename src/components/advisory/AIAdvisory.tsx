"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Loader2, Globe, AlertCircle, RefreshCw, Volume2, Square } from "lucide-react";
import { AssessmentData } from "@/components/assessment/schema";
import { FinancialAssessment } from "@/domain/finance/types";
import { StressAssessment } from "@/domain/stress/types";
import { DecisionResult } from "@/domain/decision/types";
import { EvidenceResult } from "@/domain/evidence/types";
import { AdvisoryResult, SupportedLanguage } from "@/domain/advisory/types";
import { BrowserTTSProvider } from "@/lib/voice/providers";

interface AIAdvisoryProps {
  data: AssessmentData;
  assessment: FinancialAssessment;
  stress: StressAssessment;
  decision: DecisionResult;
  evidence: EvidenceResult | 'UNAVAILABLE' | null; // null means loading evidence
}

const LANGUAGES: { code: SupportedLanguage; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
];

export function AIAdvisory({ data, assessment, stress, decision, evidence }: AIAdvisoryProps) {
  const [language, setLanguage] = useState<SupportedLanguage>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  // To handle stale responses / fast language switching
  const requestAbortController = useRef<AbortController | null>(null);

  // Safely resolve evidence state
  const safeEvidence = useMemo(() => {
    if (!evidence) return null;
    if (evidence === 'UNAVAILABLE') {
      return {
        availability: 'PROVIDER_UNAVAILABLE',
        location: { resolvedDisplayName: `${data.village}, ${data.district}, ${data.state}` } as any,
        radius5km: null as any,
        radius10km: null as any,
        dairySpecificConfidence: 'INSUFFICIENT',
        competitiveSignal: 'LIMITED',
        salesChannelSignal: 'LIMITED',
        limitations: ['Evidence could not be fetched due to provider unavailability']
      } as unknown as EvidenceResult;
    }
    return evidence;
  }, [evidence, data.village, data.district, data.state]);

  // Construct complete request payload
  const currentPayload = useMemo(() => {
    if (!safeEvidence) return null;
    return {
      language,
      entrepreneur: {
        location: `${data.village}, ${data.district}, ${data.state}`,
        assessmentPurpose: data.businessIntent,
        experienceYears: data.yearsLivestock,
      },
      business: {
        category: "DAIRY",
        animalCount: data.animalCount,
        animalType: data.animalType,
      },
      financial: {
        projectCost: assessment.project.projectCost,
        ownContribution: assessment.funding.effectiveOwnContribution,
        fundingGap: assessment.funding.fundingGap,
        financingCategory: assessment.financing.category,
        annualRevenue: assessment.economics.annualMilkRevenue,
        annualOperatingExpenses: assessment.economics.annualOperatingExpenses,
        operatingSurplus: assessment.economics.operatingSurplus,
        annualRepaymentBurden: assessment.repayment.annualRepaymentBurden,
        postRepaymentCash: assessment.cashFlow.postNewLoanRepaymentCash,
        netCashAfterExistingDebt: assessment.cashFlow.netCashAfterExistingDebt,
      },
      stress: {
        scenarioLabel: stress.scenario.label,
        milkYieldChangePct: stress.scenario.milkYieldChangePct,
        feedCostChangePct: stress.scenario.feedCostChangePct,
        annualRevenue: stress.stressed.economics.annualMilkRevenue,
        annualOperatingExpenses: stress.stressed.economics.annualOperatingExpenses,
        operatingSurplus: stress.stressed.economics.operatingSurplus,
        annualRepaymentBurden: stress.stressed.repayment.annualRepaymentBurden,
        postRepaymentCash: stress.stressed.cashFlow.postNewLoanRepaymentCash,
        netCashAfterExistingDebt: stress.stressed.cashFlow.netCashAfterExistingDebt,
      },
      decision: {
        status: decision.status,
        primaryReason: decision.primaryReason,
        reasonCodes: decision.reasonCodes,
        warnings: decision.warnings,
      },
      localEvidence: safeEvidence
    };
  }, [language, data, assessment, stress, decision, safeEvidence]);

  // Canonical stable request identity string (deterministic fingerprint)
  const requestFingerprint = currentPayload ? JSON.stringify(currentPayload) : null;

  // Track the generated advisory and the fingerprint it corresponds to
  const [advisoryCache, setAdvisoryCache] = useState<{ fingerprint: string | null; data: AdvisoryResult | null }>({
    fingerprint: null,
    data: null
  });

  const fetchAdvisory = async () => {
    if (!currentPayload || !requestFingerprint) return;

    if (requestAbortController.current) {
      requestAbortController.current.abort();
    }

    const abortController = new AbortController();
    requestAbortController.current = abortController;
    
    setLoading(true);
    setError(false);

    try {
      const res = await fetch("/api/advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentPayload),
        signal: abortController.signal
      });

      if (!res.ok) throw new Error("Failed to fetch advisory");
      
      const resultData = await res.json();
      
      if (resultData.language === language) {
        setAdvisoryCache({
          fingerprint: requestFingerprint,
          data: resultData
        });
      }
      
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.error("Advisory error:", err);
      setError(true);
    } finally {
      if (requestAbortController.current === abortController) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAdvisory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestFingerprint]);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as SupportedLanguage);
  };

  // TTS State
  const [ttsState, setTtsState] = useState<'IDLE' | 'SPEAKING' | 'ERROR' | 'UNSUPPORTED' | 'NO_VOICE_FALLBACK'>('IDLE');
  const ttsProviderRef = useRef<BrowserTTSProvider | null>(null);

  useEffect(() => {
    ttsProviderRef.current = new BrowserTTSProvider();
    if (!ttsProviderRef.current.isSupported()) {
      setTtsState('UNSUPPORTED');
    }
  }, []);

  // Determine if we should show the advisory or hide it (because it's stale)
  const isAdvisoryStale = requestFingerprint !== advisoryCache.fingerprint;
  const showAdvisory = advisoryCache.data && !isAdvisoryStale;
  const advisory = advisoryCache.data;

  // Stop TTS immediately on unmount or stale state changes (language/assessment/advisory change)
  useEffect(() => {
    if (isAdvisoryStale && ttsProviderRef.current) {
      ttsProviderRef.current.stop();
      if (ttsState === 'SPEAKING' || ttsState === 'NO_VOICE_FALLBACK') setTtsState('IDLE');
    }
  }, [isAdvisoryStale, ttsState]);

  useEffect(() => {
    return () => {
      if (ttsProviderRef.current) {
        ttsProviderRef.current.stop();
      }
    };
  }, []);

  const handleToggleVoice = async () => {
    if (!ttsProviderRef.current || ttsState === 'UNSUPPORTED') return;
    
    if (ttsState === 'SPEAKING' || ttsState === 'NO_VOICE_FALLBACK') {
      ttsProviderRef.current.stop();
      setTtsState('IDLE');
      return;
    }

    if (!advisory || isAdvisoryStale) return;

    setTtsState('SPEAKING');

    try {
      // Compose text explicitly
      let textToSpeak = `${advisory?.summary}. ${advisory?.whyThisDecision}. `;
      if (advisory?.recommendedActions && advisory?.recommendedActions.length > 0) {
        textToSpeak += `Recommendations: ${advisory?.recommendedActions.join('. ')}.`;
      }

      await ttsProviderRef.current.speak(textToSpeak, language, (fallbackUsed) => {
        if (fallbackUsed) {
          setTtsState('NO_VOICE_FALLBACK');
        } else {
          setTtsState('SPEAKING');
        }
      });
      setTtsState('IDLE');
    } catch (e) {
      console.error("TTS Error:", e);
      setTtsState('ERROR');
    }
  };

  const getLanguageName = (code: string) => {
    switch (code) {
      case 'hi': return 'Hindi';
      case 'bn': return 'Bengali';
      case 'mr': return 'Marathi';
      case 'ta': return 'Tamil';
      default: return 'English';
    }
  };

  return (
    <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle mt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-border-subtle pb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-serif text-text-primary">AI Advisory</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold tracking-wider">
              EXPLANATION LAYER
            </span>
            {showAdvisory && (
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={handleToggleVoice}
                  className="flex items-center gap-1.5 ml-2 text-xs font-medium px-2 py-1 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded border border-brand-200 transition-colors"
                  aria-label={ttsState === 'SPEAKING' || ttsState === 'NO_VOICE_FALLBACK' ? "Stop advisory audio" : "Listen to advisory"}
                  disabled={ttsState === 'UNSUPPORTED'}
                >
                  {ttsState === 'SPEAKING' || ttsState === 'NO_VOICE_FALLBACK' ? <Square className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  {ttsState === 'SPEAKING' || ttsState === 'NO_VOICE_FALLBACK' ? "Stop" : "Listen"}
                </button>
                {ttsState === 'UNSUPPORTED' && (
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                    Audio playback isn&apos;t supported in this browser.
                  </span>
                )}
                {ttsState === 'ERROR' && (
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                    Audio playback couldn&apos;t start. You can continue reading the advisory.
                  </span>
                )}
                {ttsState === 'NO_VOICE_FALLBACK' && (
                  <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 max-w-[250px] inline-block truncate" title={`A ${getLanguageName(language)} system voice was not found. Trying the browser&apos;s available voice.`}>
                    A {getLanguageName(language)} system voice was not found. Trying the browser&apos;s available voice.
                  </span>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-text-secondary">
            Plain-language guidance based on the calculated assessment and available local evidence.
          </p>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <Globe className="w-4 h-4 text-text-secondary" />
          <select 
            className="text-sm border border-border-subtle rounded-md px-3 py-1.5 bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
            value={language}
            onChange={handleLanguageChange}
            disabled={!evidence || (loading && !showAdvisory)}
            aria-label="Select Advisory Language"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-6 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          Financial calculations and viability status are determined separately by GramVyapar&apos;s deterministic assessment engine.
        </p>
      </div>

      {!evidence || (loading && !showAdvisory && !error) ? (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-4" />
          <p className="text-text-secondary font-medium">Preparing plain-language guidance from your assessment...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-10 px-4">
          <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="text-lg font-medium text-red-900 mb-1">Failed to load AI advisory</h3>
          <p className="text-sm text-red-700/80 mb-6 max-w-md">
            Your financial assessment, stress test, viability decision, and local evidence remain available above.
          </p>
          <button 
            type="button"
            onClick={() => fetchAdvisory()}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 rounded-md text-red-700 hover:bg-red-50 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Retry advisory
          </button>
        </div>
      ) : showAdvisory ? (
        <div className="space-y-8 animate-in fade-in duration-500 relative">
          
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
              <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-border-subtle flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                <span className="text-sm font-medium text-text-secondary">Generating advisory?...</span>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-sm font-bold text-text-primary mb-2">Summary</h4>
            <p className="text-text-secondary leading-relaxed">{advisory?.summary}</p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-text-primary mb-2">Why This Decision</h4>
            <p className="text-text-secondary leading-relaxed">{advisory?.whyThisDecision}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-3">Biggest Risks</h4>
              <ul className="space-y-2">
                {advisory?.biggestRisks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-text-secondary leading-relaxed">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                    <span className="text-sm">{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-3">Recommended Actions</h4>
              <ul className="space-y-2">
                {advisory?.recommendedActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-text-secondary leading-relaxed">
                    <span className="text-brand-500 font-bold shrink-0 mt-0.5">•</span>
                    <span className="text-sm">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-text-primary mb-2">Stress-Test Interpretation</h4>
            <p className="text-text-secondary leading-relaxed text-sm">{advisory?.stressTestInterpretation}</p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-text-primary mb-2">Local Evidence Context</h4>
            <p className="text-text-secondary leading-relaxed text-sm">{advisory?.localEvidenceContext}</p>
          </div>

          <div className="bg-surface-subtle border border-border-subtle rounded-lg p-5">
            <h4 className="text-sm font-bold text-text-primary mb-3">Verify Before Borrowing</h4>
            <ul className="space-y-2">
              {advisory?.verifyBeforeBorrowing.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-text-secondary leading-relaxed">
                  <span className="text-blue-500 font-bold shrink-0 mt-0.5">→</span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-border-subtle">
            <p className="text-xs text-slate-400 leading-relaxed italic">
              {advisory?.disclaimer}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
