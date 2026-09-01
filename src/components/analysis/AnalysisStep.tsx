import { CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import { DecisionResult } from "@/domain/decision/types";

import { FinancialAssessment } from "@/domain/finance/types";


interface AnalysisStepProps {
  assessment: FinancialAssessment;
  decision: DecisionResult;
  onNext: () => void;
  onBack: () => void;
}

export function AnalysisStep({ assessment, decision, onNext, onBack }: AnalysisStepProps) {
  const metrics = decision.metricsUsed;
  
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-wider text-text-secondary uppercase mb-3">
          Step 3 · Financial & Risk Analysis
        </p>
        <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-3">
          We are testing the plan, not just the loan.
        </h2>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
          GramVyapar evaluates business economics, financing pressure and downside resilience before preparing your assessment brief.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Checklist */}
        <div className="bg-white p-6 rounded-xl border border-border-subtle shadow-sm flex flex-col justify-center">
          <ul className="space-y-4">
            {[
              "Business inputs validated",
              "Dairy economics calculated",
              "Project cost and funding gap structured",
              "Repayment burden calculated",
              "Downside stress test completed",
              "Deterministic viability decision generated"
            ].map((check, i) => (
              <li key={i} className="flex items-center text-sm text-text-primary font-medium">
                <CheckCircle2 className="w-5 h-5 text-brand-600 mr-3 shrink-0" />
                {check}
              </li>
            ))}
          </ul>
        </div>

        {/* Key Numbers Preview */}
        <div className="bg-[#1F4A45] p-6 rounded-xl border border-[#123524] text-white shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-semibold mb-5 text-[#DDE8E1]">Preview</h3>
          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            <div>
              <p className="text-[10px] text-[#DDE8E1]/70 uppercase tracking-wider mb-1">Project Cost</p>
              <p className="text-lg font-medium">{formatCurrency(assessment.project.projectCost)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#DDE8E1]/70 uppercase tracking-wider mb-1">Funding Gap</p>
              <p className="text-lg font-medium">{formatCurrency(metrics.fundingGap)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#DDE8E1]/70 uppercase tracking-wider mb-1">Operating Surplus</p>
              <p className="text-lg font-medium">{formatCurrency(metrics.baseOperatingSurplus)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#DDE8E1]/70 uppercase tracking-wider mb-1">Post-Repay Cash</p>
              <p className="text-lg font-medium">{formatCurrency(metrics.basePostRepaymentCash)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#DDE8E1]/70 uppercase tracking-wider mb-1">Stress Post-Repay Cash</p>
              <p className="text-lg font-medium">{formatCurrency(metrics.stressPostRepaymentCash)}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#DDE8E1]/70 uppercase tracking-wider mb-1">Decision Status</p>
              <p className={`text-sm font-bold mt-1 inline-block px-2 py-0.5 rounded ${
                decision.status === 'PROCEED' ? 'bg-[#DDE8E1] text-[#1F4A45]' : 
                decision.status === 'MODIFY' ? 'bg-amber-500/20 text-amber-200' : 
                'bg-red-500/20 text-red-200'
              }`}>
                {decision.status.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between pt-6 border-t border-border-subtle gap-4">
        <button 
          type="button" 
          onClick={onBack}
          className="h-12 w-full sm:w-auto px-4 text-text-secondary hover:text-text-primary font-medium flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to dairy plan
        </button>
        <button 
          type="button"
          onClick={onNext}
          className="h-12 w-full sm:w-auto bg-brand-700 text-white px-8 rounded-md font-medium hover:bg-brand-800 flex items-center justify-center transition-colors shadow-sm"
        >
          View assessment brief
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
}
