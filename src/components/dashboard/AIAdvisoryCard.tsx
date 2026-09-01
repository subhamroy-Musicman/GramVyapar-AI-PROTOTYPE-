/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, Square, Send, Loader2 } from "lucide-react";
import { TTSProvider, STTProvider } from "@/lib/voice";

interface AIAdvisoryCardProps {
  advisory: any;
  advisoryLoading: boolean;
  decision: string;
  isSpeaking: boolean;
  setIsSpeaking: (v: boolean) => void;
  handleTTS: (text: string) => void;
  t: (key: string) => string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  transcript: string;
  submitQuestion: () => void;
  qaLoading: boolean;
  voiceError: string;
  qaAnswer: string;
}

export function AIAdvisoryCard({
  advisory,
  advisoryLoading,
  decision,
  isSpeaking,
  setIsSpeaking,
  handleTTS,
  t,
  isListening,
  startListening,
  stopListening,
  transcript,
  submitQuestion,
  qaLoading,
  voiceError,
  qaAnswer
}: AIAdvisoryCardProps) {
  return (
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
                    onClick={isListening ? stopListening : startListening}
                    className={isListening ? "animate-pulse" : "border-slate-300 text-slate-700"}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {isListening ? "Listening..." : "Tap to Speak"}
                  </Button>
                  
                  {transcript && (
                    <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
                      <div className="text-sm text-slate-600 italic bg-slate-50 px-3 py-2 rounded-md flex-1 border border-slate-200">
                        &quot;{transcript}&quot;
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
  );
}

