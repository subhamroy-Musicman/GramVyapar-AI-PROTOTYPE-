"use client";

import { z } from "zod";
import { formSchema } from "./AssessmentForm";
import { 
  calculateEconomics, 
  calculateProjectCost, 
  formatINR, 
  getSchemeDetails 
} from "@/lib/calculations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle2, TrendingDown, Info, ArrowDown, MapPin, Building2, TrendingUp, AlertCircle, RefreshCw, Pencil, Mic, Volume2, Square, Send, VolumeX } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";

import { useEffect, useState } from "react";
import { LiveEvidence, EvidenceItem } from "@/types/evidence";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTranslation } from "@/lib/i18n/translations";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/config";
import { STTProvider, TTSProvider } from "@/lib/voice";

const EvidenceBadge = ({ item }: { item?: EvidenceItem | null }) => {
  if (!item) {
    return (
      <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200 uppercase font-semibold">
        Data Unavailable
      </Badge>
    );
  }
  const isLimited = item.label.includes("No relevant mapped POIs") || item.value?.zone10 === 0 || item.value?.zone10?.count === 0;
  return (
    <div className="flex flex-col items-end gap-0.5">
      <Badge variant="outline" className={`text-[10px] uppercase font-semibold shadow-sm ${isLimited ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
        {isLimited ? 'Limited Evidence' : 'Live Evidence'}
      </Badge>
      <span className="text-[9px] text-slate-400 capitalize">
        {item.source} • {item.confidence} Conf.
      </span>
    </div>
  );
};

interface ResultsDashboardProps {
  data: z.infer<typeof formSchema>;
  onReset: () => void;
}

export function ResultsDashboard({ data, onReset }: ResultsDashboardProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [evidence, setEvidence] = useState<LiveEvidence | null>(null);
  const [evidenceLoading, setEvidenceLoading] = useState(true);

  const [advisory, setAdvisory] = useState<any>(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(true);

  // Voice Q&A State
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaAnswer, setQaAnswer] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speechLocale = SUPPORTED_LANGUAGES[language]?.speechLocale || "en-IN";

  // TTS Helper
  const handleTTS = (text: string) => {
    if (!TTSProvider.isSupported()) {
      alert(t("Voice output is not supported in this browser."));
      return;
    }
    
    if (isSpeaking) {
      TTSProvider.stop();
      setIsSpeaking(false);
      return;
    }
    
    const textLanguage = SUPPORTED_LANGUAGES[language]?.nativeLabel || "English";
    console.log(`[tts] language=${language}`);
    console.log(`[tts] textLanguage=${textLanguage}`);
    console.log(`[tts] textLength=${text.length}`);

    setIsSpeaking(true);
    TTSProvider.speak(
      text, 
      speechLocale, 
      () => setIsSpeaking(false), 
      () => setIsSpeaking(false)
    );
  };

  // STT Helper
  const startListening = () => {
    if (!STTProvider.isSupported()) {
      setVoiceError(t("Voice input is not supported in this browser. Please use text."));
      return;
    }
    
    setVoiceError("");
    setTranscript("");
    setQaAnswer("");
    setIsListening(true);
    
    STTProvider.startListening(
      speechLocale,
      (text) => setTranscript(text),
      (err) => {
        setVoiceError(err);
        setIsListening(false);
      },
      () => setIsListening(false)
    );
  };

  const submitQuestion = async () => {
    if (!transcript) return;
    setQaLoading(true);
    setVoiceError("");
    setQaAnswer("");
    
    try {
      const payload = {
        business: {
          type: "Dairy Farming",
          location: `${data.village}, ${data.district}, ${data.state}`,
          herdSize: data.animalCount
        },
        decision: decision,
        financial: {
          availableCapital: data.marginCapital,
          projectCost: projectCost,
          fundingGap: Math.max(0, projectCost - data.marginCapital),
          indicativeLoan: maxEligibleLoan,
          annualRevenue: normalEconomics.annualMilkProduction * data.milkPrice,
          annualOperatingCost: normalEconomics.totalOperatingCost,
          operatingSurplus: normalEconomics.annualOperatingSurplus,
          repaymentBurden: normalEconomics.annualRepaymentBurden,
          postRepaymentCash: normalEconomics.postRepaymentSurplus
        },
        stressTest: {
          scenario: "20% yield drop, 15% cost increase",
          stressedRevenue: stressEconomics.annualMilkProduction * data.milkPrice,
          stressedOperatingCost: stressEconomics.totalOperatingCost,
          stressedPostRepaymentCash: stressEconomics.postRepaymentSurplus
        },
        localEvidence: {
          marketReach5km: evidence?.marketReach?.value?.zone5 ?? null,
          marketReach10km: evidence?.marketReach?.value?.zone10 ?? null,
          directDairySignals5km: evidence?.competitorSignal?.value?.zone5 ?? null,
          directDairySignals10km: evidence?.competitorSignal?.value?.zone10 ?? null,
          competitorConfidence: evidence?.competitorSignal?.confidence ?? null,
          weatherContext: evidence?.weatherRisk?.label ?? null,
          availabilityState: evidence ? "AVAILABLE" : "PROVIDER_UNAVAILABLE"
        },
        language: language,
        question: transcript
      };

      const res = await fetch('/api/advisory/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const resData = await res.json();
      if (resData.status === "AVAILABLE" && resData.answer) {
        setQaAnswer(resData.answer);
        handleTTS(resData.answer);
      } else {
        setVoiceError(t("AI Advisory is currently unavailable."));
      }
    } catch(err) {
      setVoiceError(t("AI Advisory is currently unavailable."));
    } finally {
      setQaLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    setEvidenceLoading(true);
    import("@/app/actions/evidence").then(({ getEvidenceAction }) => {
      getEvidenceAction(data.village, data.district, data.state)
        .then(res => { if (active) setEvidence(res); })
        .catch(err => console.error(err))
        .finally(() => { if (active) setEvidenceLoading(false); });
    });
    return () => { active = false; };
  }, [data.village, data.district, data.state]);
  // 1. Core Calculations - UNCANGED
  const projectCost = calculateProjectCost(data.marginCapital);
  const scheme = getSchemeDetails(projectCost);
  const maxEligibleLoan = Math.min(projectCost * 0.90, scheme.maxLoan);
  
  const normalEconomics = calculateEconomics(data, 1.0, 1.0);
  const stressEconomics = calculateEconomics(data, 0.8, 1.15); // 20% yield drop, 15% feed cost increase

  // Decision Logic - UNCHANGED
  let decision: "PROCEED" | "MODIFY" | "HIGH RISK" = "HIGH RISK";
  if (normalEconomics.postRepaymentSurplus > 0) {
    if (stressEconomics.postRepaymentSurplus > 0) {
      decision = "PROCEED";
    } else {
      decision = "MODIFY";
    }
  }

  useEffect(() => {
    if (evidenceLoading) return;
    
    let active = true;
    setAdvisoryLoading(true);

    fetch('/api/advisory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business: {
          type: "Dairy Farming",
          location: `${data.village}, ${data.district}, ${data.state}`,
          herdSize: data.animalCount
        },
        decision: decision,
        financial: {
          availableCapital: data.marginCapital,
          projectCost: projectCost,
          fundingGap: projectCost - data.marginCapital,
          indicativeLoan: maxEligibleLoan,
          annualRevenue: normalEconomics.annualMilkRevenue,
          annualOperatingCost: normalEconomics.totalOperatingCost,
          operatingSurplus: normalEconomics.annualOperatingSurplus,
          repaymentBurden: normalEconomics.annualRepaymentBurden,
          postRepaymentCash: normalEconomics.postRepaymentSurplus
        },
        stressTest: {
          scenario: "20% yield drop, 15% feed cost increase",
          stressedRevenue: stressEconomics.annualMilkRevenue,
          stressedOperatingCost: stressEconomics.totalOperatingCost,
          stressedPostRepaymentCash: stressEconomics.postRepaymentSurplus
        },
        localEvidence: {
          marketReach5km: evidence?.marketReach?.value?.zone5?.count ?? null,
          marketReach10km: evidence?.marketReach?.value?.zone10?.count ?? null,
          directDairySignals5km: evidence?.competitorSignal?.value?.zone5 ?? null,
          directDairySignals10km: evidence?.competitorSignal?.value?.zone10 ?? null,
          competitorConfidence: evidence?.competitorSignal?.confidence ?? null,
          weatherContext: evidence?.weatherRisk?.label ?? null,
          availabilityState: evidence ? "AVAILABLE" : "PROVIDER_UNAVAILABLE" // Approximate for full object
        },
        language: language
      })
    })
    .then(res => res.json())
    .then(res => {
      if (active && res.status === "AVAILABLE") setAdvisory(res.advisory);
    })
    .catch(err => console.error(err))
    .finally(() => { if (active) setAdvisoryLoading(false); });

    return () => { active = false; };
  }, [
    language,
    evidenceLoading, 
    evidence, 
    data.village, 
    data.district, 
    data.state, 
    data.animalCount, 
    data.marginCapital, 
    decision, 
    projectCost, 
    maxEligibleLoan, 
    // Stringify the economics to prevent object reference inequality infinite loops
    JSON.stringify(normalEconomics), 
    JSON.stringify(stressEconomics)
  ]);

  // Cost per litre for PMV - UNCHANGED
  const costPerLitreNormal = normalEconomics.totalOperatingCost / normalEconomics.annualMilkProduction;
  const marginPerLitre = data.milkPrice - costPerLitreNormal;
  
  let pricingPosition = "Moderate";
  if (marginPerLitre > 15) pricingPosition = "High Margin";
  else if (marginPerLitre < 5) pricingPosition = "Low Margin";

  // Eligibility vs Viability calculations
  // Preserving the 25% scale reduction heuristic logic for MODIFY case
  const suggestedProjectScale = decision === 'PROCEED' ? 1.0 : 0.75;
  const suggestedProjectCost = projectCost * suggestedProjectScale;
  const suggestedLoan = maxEligibleLoan * suggestedProjectScale;

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16 text-slate-800">
      
      {/* Mobile Top Actions */}
      <div className="flex md:hidden justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-4">
        <Button variant="ghost" size="sm" onClick={onReset} className="text-slate-600">
          <Pencil className="w-4 h-4 mr-2" /> Adjust
        </Button>
        <Button variant="outline" size="sm" onClick={onReset} className="text-slate-600">
          <RefreshCw className="w-4 h-4 mr-2" /> New
        </Button>
      </div>

      {/* A. Executive Decision */}
      <Card className={`overflow-hidden border border-slate-200 shadow-sm ${
        decision === 'PROCEED' ? 'border-t-4 border-t-emerald-600' : 
        decision === 'MODIFY' ? 'border-t-4 border-t-amber-500' : 
        'border-t-4 border-t-red-600'
      }`}>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-slate-500 font-normal uppercase tracking-wider text-xs">
                  GramVyapar Executive Decision
                </Badge>
              </div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                {decision === 'PROCEED' && <CheckCircle2 className="w-8 h-8 text-emerald-600" />}
                {decision === 'MODIFY' && <AlertTriangle className="w-8 h-8 text-amber-500" />}
                {decision === 'HIGH RISK' && <AlertCircle className="w-8 h-8 text-red-600" />}
                <span className={
                  decision === 'PROCEED' ? 'text-emerald-800' : 
                  decision === 'MODIFY' ? 'text-amber-800' : 
                  'text-red-800'
                }>{decision}</span>
              </h2>
              <p className="mt-4 text-slate-600 text-lg leading-relaxed max-w-2xl">
                {decision === 'PROCEED' && `You are financially eligible for a ${formatINR(maxEligibleLoan)} loan. The proposed dairy plan shows strong resilience even under stress scenarios. Proceed with the application.`}
                {decision === 'MODIFY' && `You are financially eligible for a ${formatINR(maxEligibleLoan)} loan under the ${scheme.name}, but the proposed dairy plan becomes vulnerable when milk yield falls and feed costs rise. Consider reducing the initial investment or herd size.`}
                {decision === 'HIGH RISK' && `The current financial structure is unsustainable. Operating surplus does not cover the required loan repayments for the proposed scale.`}
              </p>
              
              <div className="flex items-center gap-4 mt-6 text-sm text-slate-500">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {data.village}, {data.district}</span>
                <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> Dairy Farming ({data.animalCount} Animals)</span>
              </div>
            </div>
            
            <div className="hidden md:flex flex-col gap-2">
              <Button variant="outline" onClick={onReset} className="border-slate-300 text-slate-700 hover:bg-slate-50">
                <Pencil className="w-4 h-4 mr-2" /> Adjust Assessment
              </Button>
              <Button variant="ghost" onClick={onReset} className="text-slate-500">
                Start New
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Advisory Layer */}
      <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              {t("AI Advisory")}
              {advisoryLoading && <span className="text-xs font-normal text-slate-500 animate-pulse bg-slate-200 px-2 py-0.5 rounded-full">{t("Generating explanation...") || "Generating explanation..."}</span>}
            </CardTitle>
            <p className="text-sm text-slate-500 mt-1">AI-generated explanation of your deterministic results</p>
          </div>
          {advisory && !advisoryLoading && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (isSpeaking) {
                  TTSProvider.stop();
                  setIsSpeaking(false);
                } else {
                  handleTTS(`${decision}. ${advisory.whyThisDecision} ${advisory.biggestRisk} ${advisory.stressExplanation || ''} ${(advisory.recommendedActions || []).join('. ')}`);
                }
              }}
              className="hidden sm:flex text-brand-700 border-brand-200 bg-brand-50 hover:bg-brand-100"
            >
              {isSpeaking ? (
                <><Square className="w-4 h-4 mr-2" /> Stop</>
              ) : (
                <><Volume2 className="w-4 h-4 mr-2" /> Listen</>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          {advisoryLoading ? (
             <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
                {t("Analyzing financial and mapped evidence...")}
             </div>
          ) : advisory ? (
             <div className="space-y-6">
                <div>
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("Summary")}</h4>
                   <p className="text-slate-700 text-sm">{advisory.summary}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("Why This Decision?")}</h4>
                    <p className="text-slate-700 text-sm">{advisory.whyThisDecision}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("Biggest Risk")}</h4>
                    <p className="text-slate-700 text-sm">{advisory.biggestRisk}</p>
                  </div>
                  {advisory.stressExplanation && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("Stress Test Implication")}</h4>
                      <p className="text-slate-700 text-sm">{advisory.stressExplanation}</p>
                    </div>
                  )}
                  {advisory.localMarketExplanation && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("Local Evidence Context")}</h4>
                      <p className="text-slate-700 text-sm">{advisory.localMarketExplanation}</p>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{t("Recommended Actions")}</h4>
                  <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                    {advisory.recommendedActions.map((action: string, i: number) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
                
                {/* Voice Q&A Section */}
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                    <Mic className="w-4 h-4 text-brand-600" /> {t("Ask a Question via Voice")} <span className="text-xs font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-1">BHASHINI-ready</span>
                  </h4>
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Button 
                      variant={isListening ? "destructive" : "outline"}
                      onClick={isListening ? () => STTProvider.stopListening() : startListening}
                      className={isListening ? "animate-pulse" : "border-slate-300 text-slate-700"}
                    >
                      <Mic className="w-4 h-4 mr-2" />
                      {isListening ? "Listening..." : "Tap to Speak"}
                    </Button>
                    
                    {transcript && (
                      <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                        <div className="text-sm text-slate-600 italic bg-slate-50 px-3 py-2 rounded-md flex-1 border border-slate-200">
                          "{transcript}"
                        </div>
                        <Button 
                          onClick={submitQuestion} 
                          disabled={qaLoading}
                          className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white"
                        >
                          {qaLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                          Ask
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {voiceError && (
                    <p className="text-sm text-red-500 mt-2">{voiceError}</p>
                  )}
                  
                  {qaAnswer && (
                    <div className="mt-4 bg-brand-50 border border-brand-100 p-4 rounded-md">
                      <p className="text-sm text-slate-800">{qaAnswer}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleTTS(qaAnswer)}
                        className="mt-2 text-brand-700 p-0 h-auto hover:bg-transparent"
                      >
                        <Volume2 className="w-3.5 h-3.5 mr-1" /> Listen to Answer
                      </Button>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-100">
                  <span className="font-semibold text-slate-600">Disclaimer:</span> {advisory.evidenceCaveat}
                </div>
             </div>
          ) : (
             <div className="h-20 flex items-center justify-center text-slate-400 text-sm">
                {t("AI Advisory is currently unavailable.")}
             </div>
          )}
        </CardContent>
      </Card>

      {/* B. Eligibility vs Viability */}
      <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-800">{t("Eligibility vs Viability")}</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Maximum borrowing eligibility is not always the same as optimal capital deployment.</p>
        </CardHeader>
        <CardContent className="p-6 md:p-8 space-y-8">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-slate-600">Maximum Eligible Project Size</span>
              <span className="text-xl font-bold tabular-nums text-slate-800">{formatINR(projectCost)}</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-slate-300 w-full" />
            </div>
            <p className="text-xs text-slate-400 mt-1 text-right">Max capacity based on margin</p>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                Prototype Suggested Project Size
                <Badge variant="outline" className="text-[10px] uppercase bg-emerald-50 text-emerald-700 border-emerald-200">Recommendation</Badge>
              </span>
              <span className="text-xl font-bold tabular-nums text-emerald-700">{formatINR(suggestedProjectCost)}</span>
            </div>
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 transition-all" style={{ width: `${suggestedProjectScale * 100}%` }} />
            </div>
            <p className="text-xs text-emerald-600/70 mt-1 text-right">Scaled to survive stress heuristic</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Corresponding Loan Amounts</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Max Eligible Loan</div>
                <div className="font-semibold tabular-nums text-slate-800">{formatINR(maxEligibleLoan)}</div>
              </div>
              <div>
                <div className="text-xs text-emerald-700 mb-1">Suggested Indicative Loan</div>
                <div className="font-semibold tabular-nums text-emerald-700">{formatINR(suggestedLoan)}</div>
              </div>
            </div>
          </div>
          
          {decision === 'MODIFY' && (
            <Alert className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm ml-2">
                You may qualify for the maximum project structure, but a smaller initial project may reduce downside exposure.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* C. Financial Eligibility Pipeline */}
      <Card className="border border-slate-200 shadow-sm bg-white">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-800">Financial Eligibility Pipeline</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Rule-based calculation flow</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
            
            <div className="flex flex-col items-center text-center w-full md:w-1/4">
              <span className="text-2xl font-bold tabular-nums text-slate-800">{formatINR(data.marginCapital)}</span>
              <span className="text-sm text-slate-500 mt-1">Available Margin</span>
              <Badge variant="outline" className="mt-2 text-[10px] bg-slate-50">User Input</Badge>
            </div>

            <ArrowDown className="w-5 h-5 text-slate-300 md:-rotate-90 shrink-0" />

            <div className="flex flex-col items-center text-center w-full md:w-1/4">
              <span className="text-2xl font-bold tabular-nums text-slate-800">{formatINR(projectCost)}</span>
              <span className="text-sm text-slate-500 mt-1">Feasible Project Cost</span>
              <Badge variant="outline" className="mt-2 text-[10px] bg-slate-50">Calculated</Badge>
            </div>

            <ArrowDown className="w-5 h-5 text-slate-300 md:-rotate-90 shrink-0" />

            <div className="flex flex-col items-center text-center w-full md:w-1/4">
              <span className="text-2xl font-bold tabular-nums text-emerald-700">{formatINR(maxEligibleLoan)}</span>
              <span className="text-sm text-slate-500 mt-1">Maximum Loan</span>
              <Badge variant="outline" className="mt-2 text-[10px] bg-slate-50">Calculated</Badge>
            </div>

            <ArrowDown className="w-5 h-5 text-slate-300 md:-rotate-90 shrink-0" />

            <div className="flex flex-col items-center text-center w-full md:w-1/4 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-800">{scheme.name}</span>
              <span className="text-xs text-slate-500 mt-1">
                {scheme.isEligible ? `${scheme.interestRate}% · ${scheme.tenureYears} yrs · ${scheme.moratoriumMonths}mo moratorium` : 'Outside Range'}
              </span>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* D & E. Business Economics & Stress Test */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* D. Business Economics */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg text-slate-800">Business Economics</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Normal Case Scenario (Annual)</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Annual Revenue</span>
              <span className="font-medium tabular-nums text-slate-800">{formatINR(normalEconomics.annualMilkRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Annual Operating Cost</span>
              <span className="font-medium tabular-nums text-slate-800">{formatINR(normalEconomics.totalOperatingCost)}</span>
            </div>
            <Separator className="bg-slate-200" />
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-slate-800">Operating Surplus</span>
              <span className="font-semibold tabular-nums text-slate-800">{formatINR(normalEconomics.annualOperatingSurplus)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Approx. Repayment Burden</span>
              <span className="font-medium tabular-nums text-slate-500">- {formatINR(normalEconomics.annualRepaymentBurden)}</span>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 mt-4 border border-emerald-100 flex justify-between items-center">
              <span className="font-semibold text-emerald-900">Post-Repayment Cash</span>
              <span className={`text-xl font-bold tabular-nums ${normalEconomics.postRepaymentSurplus > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {formatINR(normalEconomics.postRepaymentSurplus)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* E. Stress Test */}
        <Card className="border border-amber-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-amber-50 border-b border-amber-100 pb-4">
            <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" /> Stress Test
            </CardTitle>
            <p className="text-sm text-amber-700 mt-1">Milk Yield -20% | Feed Cost +15%</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x divide-slate-100">
              <div className="p-6 bg-white space-y-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Normal Case</div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Revenue</div>
                  <div className="font-medium tabular-nums text-slate-800">{formatINR(normalEconomics.annualMilkRevenue)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Operating Cost</div>
                  <div className="font-medium tabular-nums text-slate-800">{formatINR(normalEconomics.totalOperatingCost)}</div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-medium text-slate-700 mb-1">Post-Repayment</div>
                  <div className={`font-bold tabular-nums ${normalEconomics.postRepaymentSurplus > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatINR(normalEconomics.postRepaymentSurplus)}
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-amber-50/30 space-y-4 relative">
                <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-4">Stress Case</div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Revenue</div>
                  <div className="font-medium tabular-nums text-slate-800">{formatINR(stressEconomics.annualMilkRevenue)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Operating Cost</div>
                  <div className="font-medium tabular-nums text-slate-800">{formatINR(stressEconomics.totalOperatingCost)}</div>
                </div>
                <div className="pt-2 border-t border-amber-100">
                  <div className="text-xs font-medium text-slate-700 mb-1">Post-Repayment</div>
                  <div className={`font-bold tabular-nums ${stressEconomics.postRepaymentSurplus > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {formatINR(stressEconomics.postRepaymentSurplus)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* F, G, H, I: Local Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
                {/* F. Market Reach */}
        <Card className="border border-slate-200 shadow-sm flex flex-col h-full">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base text-slate-800">Market Reach</CardTitle>
              <p className="text-xs text-slate-500 mt-1">{data.village}, {data.district}</p>
            </div>
            <EvidenceBadge item={evidence?.marketReach} />
          </CardHeader>
          <CardContent className="p-5 flex-1">
            {evidenceLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
            ) : evidence?.marketReach ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">5 KM</h4>
                    <p className="text-2xl font-black text-slate-800">{evidence.marketReach.value.zone5.count}</p>
                    <p className="text-xs font-medium text-slate-500">Signal: {evidence.marketReach.value.zone5.signal}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">10 KM</h4>
                    <p className="text-2xl font-black text-slate-800">{evidence.marketReach.value.zone10.count}</p>
                    <p className="text-xs font-medium text-slate-500">Signal: {evidence.marketReach.value.zone10.signal}</p>
                  </div>
                </div>
                <Separator className="bg-slate-100" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Likely Channels</h4>
                  <div className="flex flex-wrap gap-2">
                    {evidence.marketReach.value.channels.length > 0 ? evidence.marketReach.value.channels.map((channel: string) => (
                      <Badge key={channel} variant="secondary" className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium">{channel}</Badge>
                    )) : (
                      <span className="text-sm text-slate-400">Insufficient mapped channels</span>
                    )}
                  </div>
                </div>
                {evidence.marketReach.value.samples && evidence.marketReach.value.samples.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">View Evidence</p>
                    <ul className="text-xs text-slate-500 space-y-1.5">
                      {evidence.marketReach.value.samples.map((s: any, idx: number) => (
                        <li key={idx} className="flex justify-between border-b border-slate-50 pb-1 last:border-0"><span className="font-medium text-slate-700 truncate pr-2">{s.name}</span> <span>{s.distanceKm.toFixed(1)} km</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-slate-400 italic mt-2">Mapped activity is used as a local market proxy in this prototype.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Live mapped channel evidence is currently unavailable.
                </p>
                <div>
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Prototype / Validation Checklist</h4>
                  <p className="text-sm text-slate-500 mb-1">Potential dairy channels to validate locally:</p>
                  <ul className="text-sm text-slate-500 list-disc pl-4 space-y-1">
                    <li>Households</li>
                    <li>Tea Shops</li>
                    <li>Sweet Shops</li>
                    <li>Milk Collection Centres</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* G. Opportunity Analysis */}
        <Card className="border border-slate-200 shadow-sm flex flex-col h-full">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base text-slate-800">Opportunity Analysis</CardTitle>
              <CardDescription className="mt-1">Tailored for {data.animalCount} herd size</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200 uppercase font-semibold">Prototype</Badge>
          </CardHeader>
          <CardContent className="p-5 flex-1">
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600"><strong className="text-slate-800">Direct Delivery:</strong> {evidence?.marketReach ? "Likely viable channel given mapped market presence, though local willingness-to-pay must be verified." : "Potential channel to validate locally. Household willingness-to-pay has not been independently verified."}</span>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600"><strong className="text-slate-800">Bulk Supply:</strong> {evidence?.marketReach?.value?.channels?.includes("Collection/cooperative channel") ? "Mapped cooperative infrastructure supports bulk supply routes." : "Explore nearby collection/cooperative channels after local verification."}</span>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600"><strong className="text-slate-800">Value-Added Products:</strong> Future Phase 2 scaling via curd and paneer manufacturing.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

{/* H. Product Market Value */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-base text-slate-800">Product Market Value</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Target Price <Badge variant="outline" className="ml-2 text-[10px]">Input</Badge></span>
              <span className="font-medium tabular-nums">₹{data.milkPrice}/L</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-600">Est. Operating Cost</span>
              <span className="font-medium tabular-nums">₹{costPerLitreNormal.toFixed(1)}/L</span>
            </div>
            <Separator className="bg-slate-100" />
            <div className="flex justify-between items-center text-sm pt-1">
              <span className="font-medium text-slate-800">Positioning</span>
              <Badge variant={pricingPosition === 'High Margin' ? 'default' : 'secondary'} className={pricingPosition === 'High Margin' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-100 text-slate-700'}>
                {pricingPosition}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
                {/* I. Competitor Mapping */}
        <Card className="border border-slate-200 shadow-sm flex flex-col h-full">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-start justify-between">
            <CardTitle className="text-base text-slate-800">Competitor Mapping</CardTitle>
            <EvidenceBadge item={evidence?.competitorSignal} />
          </CardHeader>
          <CardContent className="p-5 flex-1 space-y-5">
            {evidenceLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
            ) : evidence?.competitorSignal ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">5 KM</h4>
                    <p className="text-2xl font-black text-slate-800">{evidence.competitorSignal.value.zone5}</p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase">Mapped Dairy POIs</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">10 KM</h4>
                    <p className="text-2xl font-black text-slate-800">{evidence.competitorSignal.value.zone10}</p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase">Mapped Dairy POIs</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">{evidence.competitorSignal.value.signal}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {evidence.competitorSignal.value.guidance}
                  </p>
                </div>
                {evidence.competitorSignal.value.samples && evidence.competitorSignal.value.samples.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">View Evidence</p>
                    <ul className="text-xs text-slate-500 space-y-1.5">
                      {evidence.competitorSignal.value.samples.map((s: any, idx: number) => (
                        <li key={idx} className="flex justify-between border-b border-slate-50 pb-1 last:border-0"><span className="font-medium text-slate-700 truncate pr-2">{s.name}</span> <span>{s.distanceKm.toFixed(1)} km</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-[11px] text-slate-400 italic">
                  {evidence.competitorSignal.caveat}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Live density maps and local enterprise datasets are currently unavailable.
                </p>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1">Guidance</h4> 
                  <p className="text-sm text-slate-500">Low competition indicates opportunity; high competition indicates established demand but potential price pressure.</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

{/* J & K: SWOT & Threats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* J. SWOT */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg text-slate-800">SWOT Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-white p-4">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Strengths</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• {data.marginCapital >= 100000 ? "Solid initial capital" : "Accessible scale"}</li>
                  <li>• Local knowledge of {data.state}</li>
                </ul>
              </div>
              <div className="bg-white p-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Weaknesses</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• {data.experienceLevel === 'beginner' ? "Limited operational experience" : "Scale constraints"}</li>
                  <li>• Input dependency</li>
                </ul>
              </div>
              <div className="bg-white p-4">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Opportunities</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• {evidence?.marketReach ? "Growing local demand identified" : "Potential local dairy demand — requires validation"}</li>
                  <li>• Scheme support eligible</li>
                </ul>
              </div>
              <div className="bg-white p-4">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Threats</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Climate volatility</li>
                  <li>• Market price fluctuations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* K. Threats */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg text-slate-800">Threat Identification</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Ranked risks for your profile</p>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {evidence?.weatherRisk && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-medium text-sm text-slate-800 block flex items-center gap-2">
                      Environmental Risk <EvidenceBadge item={evidence.weatherRisk} />
                    </span>
                    <span className="text-xs text-slate-500">{evidence.weatherRisk.label}</span>
                  </div>
                  <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 shrink-0">Variable</Badge>
                </div>
                <Separator className="bg-slate-100" />
              </>
            )}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-medium text-sm text-slate-800 block">Feed Cost Volatility</span>
                <span className="text-xs text-slate-500">Highly sensitive to market rates</span>
              </div>
              <Badge variant="destructive" className="bg-red-600 text-white hover:bg-red-700 shrink-0">High Risk</Badge>
            </div>
            <Separator className="bg-slate-100" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-medium text-sm text-slate-800 block">Seasonal Milk Yield Variation</span>
                <span className="text-xs text-slate-500">Summer drops affect cash flow</span>
              </div>
              <Badge variant="destructive" className="bg-red-600 text-white hover:bg-red-700 shrink-0">High Risk</Badge>
            </div>
            <Separator className="bg-slate-100" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-medium text-sm text-slate-800 block">Buyer Dependency</span>
                <span className="text-xs text-slate-500">Relying on few collection points</span>
              </div>
              <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 shrink-0">Medium Risk</Badge>
            </div>
            <Separator className="bg-slate-100" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-medium text-sm text-slate-800 block">Veterinary Accessibility</span>
                <span className="text-xs text-slate-500">Emergency care availability</span>
              </div>
              <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 shrink-0">Medium Risk</Badge>
            </div>
            <Separator className="bg-slate-100" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-medium text-sm text-slate-800 block">Working Capital Pressure</span>
                <span className="text-xs text-slate-500">Monthly operational buffer</span>
              </div>
              <Badge variant="outline" className="text-slate-600 border-slate-300 bg-slate-50 shrink-0">Low Risk</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* L. Prototype Disclaimer */}
      <Alert className="bg-slate-100 border-slate-200 text-slate-600">
        <Info className="h-4 w-4" />
        <AlertTitle className="font-semibold text-slate-800">Prototype Context</AlertTitle>
        <AlertDescription className="text-sm mt-1">
          This is a hackathon prototype assessment based on user inputs and deterministic regional assumptions. Live demographic, market, competitor and pricing datasets will be integrated in the next phase. No real financial commitment is made.
        </AlertDescription>
      </Alert>
    </div>
  );
}
