import { CheckCircle2, AlertTriangle, XCircle, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import { FinancialAssessment } from "@/domain/finance/types";
import { StressAssessment } from "@/domain/stress/types";
import { DecisionResult } from "@/domain/decision/types";
import { DECISION_REASON_COPY } from "@/lib/presentation/decision-copy";
import { AssessmentData } from "../assessment/schema";

interface AssessmentBriefProps {
  data: AssessmentData; // Form data
  assessment: FinancialAssessment;
  stress: StressAssessment;
  decision: DecisionResult;
  onBack: () => void;
}

export function AssessmentBrief({ data, assessment, stress, decision, onBack }: AssessmentBriefProps) {
  const isProceed = decision.status === 'PROCEED';
  const isModify = decision.status === 'MODIFY';
  
  const statusColor = isProceed ? 'bg-brand-50 text-brand-900 border-brand-200' : 
                      isModify ? 'bg-amber-50 text-amber-900 border-amber-200' : 
                      'bg-red-50 text-red-900 border-red-200';
  
  const StatusIcon = isProceed ? CheckCircle2 : isModify ? AlertTriangle : XCircle;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-16">
      
      {/* Intro */}
      <div className="mb-8">
        <p className="text-[11px] font-bold tracking-wider text-text-secondary uppercase mb-3">
          Step 4 · Assessment Brief
        </p>
        <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-3">
          Here is what the numbers say.
        </h2>
        <p className="text-text-secondary text-base leading-relaxed max-w-2xl">
          This assessment combines business economics, financing structure and downside resilience.
        </p>
      </div>

      <div className="space-y-6">
        
        {/* SECTION A: FINAL DECISION */}
        <section className={`p-6 md:p-8 rounded-xl border shadow-sm ${statusColor}`}>
          <div className="flex items-start md:items-center gap-4">
            <StatusIcon className="w-8 h-8 shrink-0" />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl font-bold tracking-tight">{decision.status.replace('_', ' ')}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 border border-current/10 font-semibold uppercase tracking-wider">
                  Dairy Farming
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 border border-current/10 font-semibold">
                  {data.animalCount} Animals
                </span>
              </div>
              <p className="text-sm font-medium opacity-90">
                {DECISION_REASON_COPY[decision.primaryReason]?.title || decision.primaryReason}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION B: ELIGIBILITY != VIABILITY */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
          <h3 className="text-lg font-serif mb-6 text-text-primary flex items-center">
            Eligibility <span className="mx-2 text-text-secondary font-sans font-light">≠</span> Viability
          </h3>
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-2 mb-6">
            <div className="flex-1 bg-surface-subtle p-4 rounded-lg border border-border-subtle">
              <p className="text-xl font-bold text-text-primary">{formatCurrency(assessment.funding.effectiveOwnContribution)}</p>
              <p className="text-xs text-text-secondary mt-1 font-medium">Available Capital</p>
            </div>
            <div className="hidden md:block text-border-strong">→</div>
            <div className="flex-1 bg-surface-subtle p-4 rounded-lg border border-border-subtle">
              <p className="text-xl font-bold text-text-primary">{formatCurrency(assessment.project.projectCost)}</p>
              <p className="text-xs text-text-secondary mt-1 font-medium">Project Cost</p>
            </div>
            <div className="hidden md:block text-border-strong">→</div>
            <div className="flex-1 bg-surface-subtle p-4 rounded-lg border border-border-subtle">
              <p className="text-xl font-bold text-text-primary">{formatCurrency(assessment.funding.fundingGap)}</p>
              <p className="text-xs text-text-secondary mt-1 font-medium">Funding Requirement</p>
            </div>
            <div className="hidden md:block text-border-strong">→</div>
            <div className="flex-1 bg-brand-50 p-4 rounded-lg border border-brand-200">
              <p className="text-sm font-bold text-brand-900 leading-tight mb-1">
                {assessment.financing.category.replace(/_/g, ' ')}
              </p>
              <p className="text-xs text-brand-700/80 font-medium">Prototype Route</p>
            </div>
          </div>
          <p className="text-xs text-text-secondary italic">
            * Financing range does not determine business viability. GramVyapar evaluates repayment and downside resilience separately.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* SECTION C: BUSINESS ECONOMICS */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
            <h3 className="text-lg font-serif mb-6 text-text-primary">Business Economics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                <span className="text-sm text-text-secondary">Annual Revenue</span>
                <span className="font-medium">{formatCurrency(assessment.economics.annualMilkRevenue)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                <span className="text-sm text-text-secondary">Annual Operating Cost</span>
                <span className="font-medium">{formatCurrency(assessment.economics.annualOperatingExpenses)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-subtle bg-surface-subtle -mx-6 px-6">
                <span className="text-sm font-semibold text-text-primary">Operating Surplus</span>
                <span className="font-bold text-text-primary">{formatCurrency(assessment.economics.operatingSurplus)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                <span className="text-sm text-text-secondary">Annual Repayment Burden</span>
                <span className="font-medium text-amber-700">{formatCurrency(assessment.repayment.annualRepaymentBurden)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                <span className="text-sm font-semibold text-text-primary">Post-Repayment Cash</span>
                <span className="font-bold text-text-primary">{formatCurrency(assessment.cashFlow.postNewLoanRepaymentCash)}</span>
              </div>
              <div className="flex justify-between items-center py-2 bg-surface-subtle -mx-6 px-6">
                <span className="text-sm font-semibold text-text-primary">Net Cash After Existing Debt</span>
                <span className={`font-bold ${assessment.cashFlow.netCashAfterExistingDebt > 0 ? 'text-brand-700' : 'text-red-600'}`}>
                  {formatCurrency(assessment.cashFlow.netCashAfterExistingDebt)}
                </span>
              </div>
            </div>
          </section>

          {/* SECTION D: PROJECT STRUCTURE */}
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
            <h3 className="text-lg font-serif mb-6 text-text-primary">Project Structure</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                <span className="text-sm text-text-secondary">Animal Purchase</span>
                <span className="font-medium">{formatCurrency(assessment.project.animalPurchaseTotal)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                <span className="text-sm text-text-secondary">Shed / Infrastructure</span>
                <span className="font-medium">{formatCurrency(data.shedCost)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                <span className="text-sm text-text-secondary">Equipment</span>
                <span className="font-medium">{formatCurrency(data.equipmentCost)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-subtle">
                <span className="text-sm text-text-secondary">Working Capital</span>
                <span className="font-medium">{formatCurrency(data.workingCapital)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border-subtle bg-surface-subtle -mx-6 px-6">
                <span className="text-sm font-semibold text-text-primary">Total Project Cost</span>
                <span className="font-bold text-text-primary">{formatCurrency(assessment.project.projectCost)}</span>
              </div>
              <div className="flex justify-between items-center py-2 pt-4">
                <span className="text-sm text-text-secondary">Own Contribution</span>
                <span className="font-medium text-brand-700">{formatCurrency(assessment.funding.effectiveOwnContribution)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-text-secondary">Funding Gap</span>
                <span className="font-medium">{formatCurrency(assessment.funding.fundingGap)}</span>
              </div>
            </div>
          </section>
        </div>

        {/* SECTION E: STRESS TEST */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-serif text-text-primary">What happens if conditions worsen?</h3>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold tracking-wider text-amber-800 bg-amber-100 px-2 py-1 rounded border border-amber-200">
                Milk Yield ↓20%
              </span>
              <span className="text-[10px] font-bold tracking-wider text-amber-800 bg-amber-100 px-2 py-1 rounded border border-amber-200">
                Feed Cost ↑15%
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-text-secondary border-b border-border-subtle">
                <tr>
                  <th className="font-medium py-3 px-4">Metric</th>
                  <th className="font-medium py-3 px-4 text-right">Base Case</th>
                  <th className="font-medium py-3 px-4 text-right">Stress Case</th>
                  <th className="font-medium py-3 px-4 text-right">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                <tr>
                  <td className="py-3 px-4">Annual Revenue</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(assessment.economics.annualMilkRevenue)}</td>
                  <td className="py-3 px-4 text-right font-medium text-amber-700">{formatCurrency(stress.stressed.economics.annualMilkRevenue)}</td>
                  <td className="py-3 px-4 text-right text-xs text-text-secondary">{formatCurrency(stress.comparison.revenueChange)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Operating Cost</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(assessment.economics.annualOperatingExpenses)}</td>
                  <td className="py-3 px-4 text-right font-medium text-amber-700">{formatCurrency(stress.stressed.economics.annualOperatingExpenses)}</td>
                  <td className="py-3 px-4 text-right text-xs text-text-secondary">+{formatCurrency(stress.comparison.operatingExpenseChange)}</td>
                </tr>
                <tr className="bg-surface-subtle">
                  <td className="py-3 px-4 font-semibold text-text-primary">Operating Surplus</td>
                  <td className="py-3 px-4 text-right font-bold text-text-primary">{formatCurrency(assessment.economics.operatingSurplus)}</td>
                  <td className="py-3 px-4 text-right font-bold text-amber-700">{formatCurrency(stress.stressed.economics.operatingSurplus)}</td>
                  <td className="py-3 px-4 text-right text-xs text-text-secondary">{formatCurrency(stress.comparison.operatingSurplusChange)}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Repayment Burden</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(assessment.repayment.annualRepaymentBurden)}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatCurrency(stress.stressed.repayment.annualRepaymentBurden)}</td>
                  <td className="py-3 px-4 text-right text-xs text-text-secondary">No change</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Post-Repayment Cash</td>
                  <td className="py-3 px-4 text-right font-bold">{formatCurrency(assessment.cashFlow.postNewLoanRepaymentCash)}</td>
                  <td className={`py-3 px-4 text-right font-bold ${stress.stressed.cashFlow.postNewLoanRepaymentCash > 0 ? 'text-text-primary' : 'text-red-600'}`}>{formatCurrency(stress.stressed.cashFlow.postNewLoanRepaymentCash)}</td>
                  <td className="py-3 px-4 text-right text-xs text-text-secondary">{formatCurrency(stress.comparison.postRepaymentCashChange)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-text-secondary italic mt-4">
            * Loan terms are unchanged in this stress scenario.
          </p>
        </section>

        {/* SECTION F: WHY THIS DECISION & RISKS */}
        <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
          <h3 className="text-lg font-serif mb-6 text-text-primary">Why this decision?</h3>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-bold tracking-wider text-text-secondary uppercase mb-3">Primary Reason</h4>
              <div className="bg-surface-subtle p-4 rounded border border-border-subtle">
                <p className="font-semibold text-text-primary text-sm mb-1">{DECISION_REASON_COPY[decision.primaryReason]?.title}</p>
                <p className="text-sm text-text-secondary">{DECISION_REASON_COPY[decision.primaryReason]?.description}</p>
              </div>
            </div>

            {decision.reasonCodes.filter(c => c !== decision.primaryReason).length > 0 && (
              <div>
                <h4 className="text-xs font-bold tracking-wider text-text-secondary uppercase mb-3">Contributing Factors</h4>
                <ul className="space-y-2">
                  {decision.reasonCodes.filter(c => c !== decision.primaryReason).map(code => (
                    <li key={code} className="text-sm flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-border-strong mt-1.5 mr-2 shrink-0"></span>
                      <span>
                        <strong className="text-text-primary font-medium">{DECISION_REASON_COPY[code]?.title}:</strong>{" "}
                        <span className="text-text-secondary">{DECISION_REASON_COPY[code]?.description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {decision.warnings.length > 0 && (
              <div>
                <h4 className="text-xs font-bold tracking-wider text-amber-700 uppercase mb-3">Identified Risks</h4>
                <ul className="space-y-2">
                  {decision.warnings.map((w, i) => (
                    <li key={i} className="text-sm flex items-start bg-amber-50 p-3 rounded border border-amber-100">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 mr-2 shrink-0" />
                      <div>
                        <span className="text-amber-900">{w}</span>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white/60 rounded text-amber-800 tracking-wider">CALCULATED</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* SECTION H: TRANSPARENCY */}
        <section className="bg-surface-subtle p-6 rounded-xl border border-border-subtle text-sm">
          <h3 className="font-semibold text-text-primary mb-3">How this assessment was calculated</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-secondary text-xs">
            <div>
              <p className="font-bold text-[10px] uppercase tracking-wider mb-1">USER INPUT</p>
              <p>Dairy and financial assumptions entered by the entrepreneur.</p>
            </div>
            <div>
              <p className="font-bold text-[10px] uppercase tracking-wider mb-1">PROTOTYPE ASSUMPTION</p>
              <p>8% annual interest, 7-year tenure, 6-month moratorium, quarterly repayment, prototype routing thresholds.</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <p className="text-xs text-text-secondary italic">
              This is a prototype decision-support assessment, not a loan approval or official eligibility determination.
            </p>
          </div>
        </section>

      </div>

      <div className="mt-10">
        <button 
          type="button" 
          onClick={onBack}
          className="h-12 px-4 text-text-secondary hover:text-text-primary font-medium flex items-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Edit assessment inputs
        </button>
      </div>

    </div>
  );
}
