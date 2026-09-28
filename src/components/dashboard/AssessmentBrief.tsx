import { CheckCircle2, AlertTriangle, XCircle, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import { FinancialAssessment } from "@/domain/finance/types";
import { StressAssessment } from "@/domain/stress/types";
import { DecisionResult } from "@/domain/decision/types";
import { DECISION_REASON_COPY } from "@/lib/presentation/decision-copy";
import { AssessmentData } from "../assessment/schema";
import { HyperLocalEvidence } from "../assessment/HyperLocalEvidence";
import { AIAdvisory } from "../advisory/AIAdvisory";
import { useState, useMemo } from "react";
import { EvidenceResult } from "@/domain/evidence/types";
import { calculateMarketReach } from "@/domain/evidence/market-reach";
import { calculateOpportunityAnalysis } from "@/domain/evidence/opportunity-analysis";
import { calculateSwotAnalysis } from "@/domain/evidence/swot-analysis";
import { calculateThreatAnalysis } from "@/domain/evidence/threat-analysis";
import { calculateCompetitorMapping } from "@/domain/evidence/competitor-mapping";
import { calculatePricingIntelligence } from "@/domain/finance/pricing-intelligence";

interface AssessmentBriefProps {
  data: AssessmentData; // Form data
  assessment: FinancialAssessment;
  stress: StressAssessment;
  decision: DecisionResult;
  onBack: () => void;
  onReset: () => void;
}

export function AssessmentBrief({ data, assessment, stress, decision, onBack, onReset }: AssessmentBriefProps) {
  const [terminalEvidence, setTerminalEvidence] = useState<EvidenceResult | 'UNAVAILABLE' | null>(null);

  const pricingIntelligence = useMemo(() => {
    const inputs = {
      animalCount: data.animalCount,
      animalType: data.animalType,
      animalPurchaseCost: data.animalPurchaseCost,
      milkYieldPerDay: data.milkYieldPerDay,
      milkPrice: data.milkPrice,
      lactationDays: data.lactationDays,
      feedCostPerDay: data.feedCostPerDay,
      veterinaryAnnual: data.veterinaryAnnual,
      labourMonthly: data.labourMonthly,
      utilitiesMonthly: data.utilitiesMonthly,
      insuranceAnnual: data.insuranceAnnual,
      transportMonthly: data.transportMonthly,
      otherOperatingAnnual: data.otherOperatingAnnual,
      shedCost: data.shedCost,
      equipmentCost: data.equipmentCost,
      workingCapital: data.workingCapital,
      otherSetupCost: data.otherSetupCost
    };
    return calculatePricingIntelligence(assessment, stress, inputs as any);
  }, [assessment, stress, data]);

  const { swotAnalysis, threatAnalysis, competitorMapping } = useMemo(() => {
    if (!terminalEvidence) {
      return { swotAnalysis: null, threatAnalysis: null, competitorMapping: null }; // wait for fetch to complete or fail
    }
    
    let reach = null;
    let opps = null;
    
    if (terminalEvidence !== 'UNAVAILABLE' && (terminalEvidence as any).geocodeStatus === 'SUCCESS') {
      reach = calculateMarketReach(terminalEvidence as EvidenceResult);
      opps = calculateOpportunityAnalysis(terminalEvidence as EvidenceResult, reach);
    }
    
    return {
      swotAnalysis: calculateSwotAnalysis(assessment, stress, terminalEvidence, reach, opps),
      threatAnalysis: calculateThreatAnalysis(assessment, stress, decision, terminalEvidence, reach, opps),
      competitorMapping: calculateCompetitorMapping(terminalEvidence)
    };
  }, [terminalEvidence, assessment, stress, decision]);

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
              <p className="text-xs text-brand-700/80 font-medium mb-2">Scheme Router</p>
              <div className="text-[10px] text-brand-800 space-y-0.5">
                <p>Interest: {(assessment.repayment.annualInterestRate * 100).toFixed(1)}%</p>
                <p>Tenure: {assessment.repayment.tenureYears} yrs</p>
                <p>Moratorium: {assessment.repayment.moratoriumMonths} mos</p>
                <p>Freq: Quarterly</p>
              </div>
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

        {/* SECTION E.5: PRICING & MARKET VALUE */}
        {pricingIntelligence !== "INSUFFICIENT_DATA" && (
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
            <div className="mb-6">
              <h3 className="text-lg font-serif text-text-primary mb-2">Pricing & Market Value</h3>
              <p className="text-sm text-text-secondary">Comparing your assumed price against the modelled business requirements.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-brand-50/50 rounded-lg border border-brand-100">
                  <p className="text-[10px] font-bold text-brand-700 uppercase tracking-wider mb-1">Your Assumed Price</p>
                  <p className="text-xl font-serif text-brand-900">₹{pricingIntelligence.userAssumedPricePerUnit.toFixed(2)} / L</p>
                  <span className="inline-block mt-2 text-[9px] px-1.5 py-0.5 bg-white border border-border-subtle rounded text-slate-500 uppercase tracking-wider">User Input</span>
                </div>
                <div className="p-4 bg-surface-subtle rounded-lg border border-border-subtle">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Operating Break-Even</p>
                  <p className="text-xl font-serif text-text-primary">₹{pricingIntelligence.operatingBreakEvenPricePerUnit.toFixed(2)} / L</p>
                  <span className="inline-block mt-2 text-[9px] px-1.5 py-0.5 bg-white border border-border-subtle rounded text-slate-500 uppercase tracking-wider">Calculated</span>
                </div>
                <div className="p-4 bg-surface-subtle rounded-lg border border-border-subtle">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Debt-Service Break-Even</p>
                  <p className="text-xl font-serif text-text-primary">₹{pricingIntelligence.debtServiceBreakEvenPricePerUnit.toFixed(2)} / L</p>
                  <span className="inline-block mt-2 text-[9px] px-1.5 py-0.5 bg-white border border-border-subtle rounded text-slate-500 uppercase tracking-wider">Calculated</span>
                </div>
                <div className="p-4 bg-amber-50/30 rounded-lg border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Stress-Case Break-Even</p>
                  <p className="text-xl font-serif text-amber-900">
                    {pricingIntelligence.stressDebtServiceBreakEvenPricePerUnit !== null 
                      ? `₹${pricingIntelligence.stressDebtServiceBreakEvenPricePerUnit.toFixed(2)} / L` 
                      : 'N/A'}
                  </p>
                  <span className="inline-block mt-2 text-[9px] px-1.5 py-0.5 bg-white border border-border-subtle rounded text-slate-500 uppercase tracking-wider">Calculated</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-surface-subtle rounded-lg border border-border-subtle">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Local Market Reference</p>
                  {pricingIntelligence.localMarketReference.status === "DATA_UNAVAILABLE" ? (
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-1">Data unavailable</p>
                      <p className="text-xs text-text-secondary">{pricingIntelligence.localMarketReference.message}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xl font-serif text-text-primary mb-1">
                        ₹{pricingIntelligence.localMarketReference.pricePerUnit?.toFixed(2)} / L
                      </p>
                      <p className="text-xs text-text-secondary">Source: {pricingIntelligence.localMarketReference.source}</p>
                    </div>
                  )}
                </div>
                
                <div className="p-4 bg-surface-subtle rounded-lg border border-border-subtle">
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Regional Purchasing Power</p>
                  {pricingIntelligence.purchasingPowerReference.status === "DATA_UNAVAILABLE" ? (
                    <div>
                      <p className="text-sm font-medium text-text-primary mb-1">Data unavailable</p>
                      <p className="text-xs text-text-secondary">{pricingIntelligence.purchasingPowerReference.message}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xl font-serif text-text-primary mb-1">
                        {pricingIntelligence.purchasingPowerReference.value}
                      </p>
                      <p className="text-xs text-text-secondary">Source: {pricingIntelligence.purchasingPowerReference.source}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                <h4 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">What this means</h4>
                <p className="text-sm text-blue-900">{pricingIntelligence.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border-subtle">
                <div>
                  <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-2">Validate before investing</h4>
                  <ul className="text-xs text-text-secondary leading-relaxed list-disc pl-4 space-y-1">
                    {pricingIntelligence.validationActions.map((act, idx) => (
                      <li key={idx}>{act}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-2">Limitations</h4>
                  <ul className="text-xs text-text-secondary leading-relaxed list-disc pl-4 space-y-1">
                    {pricingIntelligence.limitations.map((lim, idx) => (
                      <li key={idx}>{lim}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

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

        {/* SECTION G: HYPER-LOCAL EVIDENCE */}
        <HyperLocalEvidence 
          villageTown={data.village} 
          district={data.district} 
          state={data.state} 
          onTerminalState={setTerminalEvidence}
        />

        {/* SECTION G1.5: COMPETITOR MAPPING */}
        {competitorMapping && (
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle min-w-0">
            <div className="mb-6">
              <h3 className="text-lg font-serif text-text-primary mb-2">Competitor Mapping</h3>
              <p className="text-sm text-text-secondary">{competitorMapping.interpretation}</p>
            </div>

            {competitorMapping.status === 'DATA_UNAVAILABLE' ? (
              <div className="bg-surface-subtle p-6 rounded-xl border border-border-subtle text-center">
                <p className="text-sm text-text-secondary font-medium">Mapped competitor/business evidence unavailable.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-1">Within 5 km</p>
                    <p className="text-2xl font-serif text-blue-900">{competitorMapping.radius5km?.mappedSimilarBusinessSignals ?? '-'}</p>
                    <p className="text-[10px] text-blue-600/80 mt-1">Mapped Similar-Business Signals</p>
                  </div>
                  <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mb-1">Within 10 km</p>
                    <p className="text-2xl font-serif text-blue-900">{competitorMapping.radius10km?.mappedSimilarBusinessSignals ?? '-'}</p>
                    <p className="text-[10px] text-blue-600/80 mt-1">Mapped Similar-Business Signals</p>
                  </div>
                  <div className="p-4 bg-surface-subtle rounded-lg border border-border-subtle">
                    <p className="text-xs text-text-secondary font-bold uppercase tracking-wider mb-1">Evidence Confidence</p>
                    <p className="text-sm font-bold text-text-primary mt-2">{competitorMapping.evidenceConfidence}</p>
                  </div>
                </div>

                {competitorMapping.entities.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border-subtle pb-2 mb-4">Nearest Mapped Signals</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {competitorMapping.entities.slice(0, 6).map((entity) => (
                        <div key={entity.id} className="p-3 bg-surface-subtle border border-border-subtle rounded-lg">
                          <p className="text-sm font-medium text-text-primary truncate">{entity.name || "Unnamed mapped dairy-related signal"}</p>
                          <div className="flex justify-between items-end mt-2">
                            <span className="text-[10px] px-1.5 py-0.5 bg-white border border-border-subtle rounded text-slate-500 uppercase">
                              Mapped dairy-related signal
                            </span>
                            {entity.distanceKm !== null && entity.distanceKm !== undefined && (
                              <span className="text-xs text-text-secondary font-medium">Approx. {entity.distanceKm.toFixed(1)} km</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border-subtle">
                  <div>
                    <h4 className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-2">What this does not prove</h4>
                    <ul className="text-xs text-text-secondary leading-relaxed list-disc pl-4 space-y-1">
                      {competitorMapping.limitations.map((lim, idx) => (
                        <li key={idx}>{lim}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-2">Validate before investing</h4>
                    <ul className="text-xs text-text-secondary leading-relaxed list-disc pl-4 space-y-1">
                      {competitorMapping.validationActions.map((act, idx) => (
                        <li key={idx}>{act}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* SECTION G2: SWOT ANALYSIS */}
        {swotAnalysis && (
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle min-w-0">
            <div className="mb-6">
              <h3 className="text-lg font-serif text-text-primary mb-2">SWOT Analysis</h3>
              <p className="text-sm text-text-secondary">{swotAnalysis.summary}</p>
            </div>

            {swotAnalysis.strengths.length === 0 && swotAnalysis.weaknesses.length === 0 && swotAnalysis.opportunities.length === 0 && swotAnalysis.threats.length === 0 ? (
              <div className="bg-surface-subtle p-6 rounded-xl border border-border-subtle text-center">
                <p className="text-sm text-text-secondary font-medium">No defensible items identified from current evidence.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* STRENGTHS */}
                <div className="space-y-4 min-w-0">
                  <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider border-b border-border-subtle pb-2">Strengths</h4>
                  {swotAnalysis.strengths.length === 0 ? (
                    <p className="text-xs text-text-secondary italic">No defensible item identified from current evidence.</p>
                  ) : (
                    swotAnalysis.strengths.map(item => (
                      <div key={item.id} className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 min-w-0">
                        <p className="text-sm font-medium text-text-primary mb-2">{item.statement}</p>
                        <p className="text-xs text-text-secondary mb-3">{item.sourceDetail}</p>
                        <div className="flex gap-2 items-center flex-wrap">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white border border-border-subtle rounded text-slate-600 tracking-wider">
                            {item.sourceType.replace(/_/g, ' ')}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider ${
                            item.confidence === 'HIGH' ? 'bg-emerald-100 text-emerald-800' :
                            item.confidence === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {item.confidence} CONFIDENCE
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* WEAKNESSES */}
                <div className="space-y-4 min-w-0">
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider border-b border-border-subtle pb-2">Weaknesses</h4>
                  {swotAnalysis.weaknesses.length === 0 ? (
                    <p className="text-xs text-text-secondary italic">No defensible item identified from current evidence.</p>
                  ) : (
                    swotAnalysis.weaknesses.map(item => (
                      <div key={item.id} className="bg-amber-50/50 p-4 rounded-lg border border-amber-100 min-w-0">
                        <p className="text-sm font-medium text-text-primary mb-2">{item.statement}</p>
                        <p className="text-xs text-text-secondary mb-3">{item.sourceDetail}</p>
                        <div className="flex gap-2 items-center flex-wrap">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white border border-border-subtle rounded text-slate-600 tracking-wider">
                            {item.sourceType.replace(/_/g, ' ')}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider ${
                            item.confidence === 'HIGH' ? 'bg-emerald-100 text-emerald-800' :
                            item.confidence === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {item.confidence} CONFIDENCE
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* OPPORTUNITIES */}
                <div className="space-y-4 min-w-0">
                  <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider border-b border-border-subtle pb-2">Opportunities</h4>
                  {swotAnalysis.opportunities.length === 0 ? (
                    <p className="text-xs text-text-secondary italic">No defensible item identified from current evidence.</p>
                  ) : (
                    swotAnalysis.opportunities.map(item => (
                      <div key={item.id} className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 min-w-0">
                        <p className="text-sm font-medium text-text-primary mb-2">{item.statement}</p>
                        <p className="text-xs text-text-secondary mb-3">{item.sourceDetail}</p>
                        <div className="flex gap-2 items-center flex-wrap">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white border border-border-subtle rounded text-slate-600 tracking-wider">
                            {item.sourceType.replace(/_/g, ' ')}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider ${
                            item.confidence === 'HIGH' ? 'bg-emerald-100 text-emerald-800' :
                            item.confidence === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {item.confidence} CONFIDENCE
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* THREATS */}
                <div className="space-y-4 min-w-0">
                  <h4 className="text-xs font-bold text-red-700 uppercase tracking-wider border-b border-border-subtle pb-2">Threats</h4>
                  {swotAnalysis.threats.length === 0 ? (
                    <p className="text-xs text-text-secondary italic">No defensible item identified from current evidence.</p>
                  ) : (
                    swotAnalysis.threats.map(item => (
                      <div key={item.id} className="bg-red-50/50 p-4 rounded-lg border border-red-100 min-w-0">
                        <p className="text-sm font-medium text-text-primary mb-2">{item.statement}</p>
                        <p className="text-xs text-text-secondary mb-3">{item.sourceDetail}</p>
                        <div className="flex gap-2 items-center flex-wrap">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-white border border-border-subtle rounded text-slate-600 tracking-wider">
                            {item.sourceType.replace(/_/g, ' ')}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider ${
                            item.confidence === 'HIGH' ? 'bg-emerald-100 text-emerald-800' :
                            item.confidence === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {item.confidence} CONFIDENCE
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {swotAnalysis.limitations.length > 0 && (
              <div className="mt-8 bg-surface-subtle p-4 rounded-lg border border-border-subtle">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-2">Limitations</span>
                <ul className="text-xs text-text-secondary leading-relaxed list-disc pl-4 space-y-1">
                  {swotAnalysis.limitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* SECTION G3: THREAT IDENTIFICATION */}
        {threatAnalysis && (
          <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle min-w-0">
            <div className="mb-6">
              <h3 className="text-lg font-serif text-text-primary mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Key Threats & Mitigation
              </h3>
              <p className="text-sm text-text-secondary">{threatAnalysis.summary}</p>
            </div>

            {threatAnalysis.threats.length === 0 ? (
              <div className="bg-surface-subtle p-6 rounded-xl border border-border-subtle text-center">
                <p className="text-sm text-text-secondary font-medium">No material threat was identified by the current deterministic stress and evidence rules. Field validation is still required.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {threatAnalysis.threats.slice(0, 4).map(threat => (
                  <div key={threat.id} className={`p-4 md:p-5 rounded-lg border flex flex-col md:flex-row gap-4 md:gap-6 ${
                    threat.severity === 'HIGH' ? 'bg-red-50/50 border-red-200' :
                    threat.severity === 'MEDIUM' ? 'bg-amber-50/50 border-amber-200' :
                    'bg-slate-50 border-slate-200'
                  }`}>
                    {/* Left column */}
                    <div className="md:w-1/3 shrink-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded tracking-wider ${
                          threat.severity === 'HIGH' ? 'bg-red-100 text-red-800' :
                          threat.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-200 text-slate-800'
                        }`}>
                          SEVERITY: {threat.severity}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-text-primary mb-1 uppercase tracking-tight">{threat.title}</h4>
                      <div className="text-[10px] font-bold px-1.5 py-0.5 bg-white border border-border-subtle rounded text-slate-600 tracking-wider inline-block mb-3">
                        {threat.sourceType.replace(/_/g, ' ')}
                      </div>
                    </div>
                    
                    {/* Right column */}
                    <div className="md:w-2/3 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Why it matters</span>
                        <p className="text-sm text-text-primary">{threat.description}</p>
                      </div>
                      
                      {threat.notVerified.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1">Not Verified</span>
                          <ul className="text-sm text-text-secondary list-disc pl-4 space-y-0.5">
                            {threat.notVerified.map((nv, idx) => (
                              <li key={idx}>{nv}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="bg-white p-3 rounded border border-border-subtle shadow-sm mt-2">
                        <span className="text-xs font-bold text-brand-700 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> What to do
                        </span>
                        <p className="text-sm text-text-primary font-medium">{threat.mitigationAction}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {threatAnalysis.limitations.length > 0 && (
              <div className="mt-8 bg-surface-subtle p-4 rounded-lg border border-border-subtle">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-2">Limitations</span>
                <ul className="text-xs text-text-secondary leading-relaxed list-disc pl-4 space-y-1">
                  {threatAnalysis.limitations.map((lim, idx) => (
                    <li key={idx}>{lim}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* SECTION H: AI ADVISORY */}
        <AIAdvisory 
          data={data}
          assessment={assessment}
          stress={stress}
          decision={decision}
          evidence={terminalEvidence}
        />
        
        {/* SECTION I: TRANSPARENCY & ASSUMPTIONS */}
        <section className="bg-surface-subtle p-6 rounded-xl border border-border-subtle text-sm">
          <h3 className="font-semibold text-text-primary mb-3">How this assessment was calculated</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-secondary text-xs">
            <div>
              <p className="font-bold text-[10px] uppercase tracking-wider mb-1">USER INPUT</p>
              <p>Dairy and financial assumptions entered by the entrepreneur.</p>
            </div>
            <div>
              <p className="font-bold text-[10px] uppercase tracking-wider mb-1">ROUTING ASSUMPTION</p>
              <p>Official Scheme Routing based on actual Project Cost limits, applying scheme-specific interest rates and moratoriums.</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <p className="text-xs text-text-secondary italic">
              This is a prototype decision-support assessment, not a loan approval or official eligibility determination.
            </p>
          </div>
        </section>

      </div>

      <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <button 
          type="button" 
          onClick={onBack}
          className="h-12 px-4 text-text-secondary hover:text-text-primary font-medium flex items-center transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Edit assessment inputs
        </button>
        <button 
          type="button" 
          onClick={onReset}
          className="h-12 px-6 bg-transparent border border-border-strong text-text-primary font-semibold rounded-lg hover:bg-surface-subtle transition-colors flex items-center shadow-sm"
        >
          Start New Assessment
        </button>
      </div>

      <footer className="mt-16 pt-6 border-t border-border-subtle text-center">
        <p className="text-sm font-medium text-text-secondary">
          Made by Team HackBlitz for SIH 2026
        </p>
      </footer>

    </div>
  );
}
