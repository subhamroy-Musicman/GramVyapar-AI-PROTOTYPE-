/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assessmentSchema, AssessmentData } from "./schema";
import { AssessmentSidebar } from "./AssessmentSidebar";
import { Step1Profile } from "./Step1Profile";
import { Step2DairyPlan } from "./Step2DairyPlan";
import { AnalysisStep } from "../analysis/AnalysisStep";
import { AssessmentBrief } from "../dashboard/AssessmentBrief";

import { calculateFinancialAssessment } from "@/domain/finance/financial-assessment";
import { calculateStressAssessment } from "@/domain/stress/stress-engine";
import { evaluateDecision } from "@/domain/decision/decision-engine";
import { STRESS_CONFIG } from "@/config/stress";
import { FinancialAssessment } from "@/domain/finance/types";
import { StressAssessment } from "@/domain/stress/types";
import { DecisionResult } from "@/domain/decision/types";

interface AssessmentShellProps {
  onComplete: () => void;
}

export function AssessmentShell({ onComplete }: AssessmentShellProps) {
  const [step, setStep] = useState(1);
  
  // Store the domain calculation results so they aren't recalculated randomly
  const [domainResults, setDomainResults] = useState<{
    assessment: FinancialAssessment;
    stress: StressAssessment;
    decision: DecisionResult;
  } | null>(null);
  
  const form = useForm<AssessmentData>({
    // @ts-expect-error bypass
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      state: "Maharashtra",
      district: "Pune",
      village: "Baramati",
      name: "",
      occupation: "",
      yearsLivestock: 0,
      farmingBackground: "yes",
      marginCapital: 100000,
      existingDebt: 0,
      businessIntent: "start",
      landAvailable: "yes",
      // Step 2 Defaults
      animalCount: 5,
      animalType: "cow",
      animalPurchaseCost: 60000,
      
      milkYieldPerDay: 12,
      milkPrice: 45,
      lactationDays: 280,
      
      feedCostPerDay: 150,
      veterinaryAnnual: 5000,
      labourMonthly: 0,
      utilitiesMonthly: 500,
      insuranceAnnual: 3000,
      transportMonthly: 1000,
      otherOperatingAnnual: 2000,
      
      shedCost: 50000,
      equipmentCost: 20000,
      workingCapital: 30000,
      otherSetupCost: 5000,

      category: "dairy",
      experienceLevel: "intermediate",
    },
    mode: "onTouched",
  });

  const handleNext = () => {
    if (step === 2) {
      // We are leaving Step 2 and entering Step 3 (Analysis).
      // Time to calculate the deterministic results.
      const data = form.getValues();
      
      const entrepreneurInputs = {
        marginCapital: data.marginCapital,
        existingDebt: data.existingDebt
      };

      const dairyPlanInputs = {
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

      const assessment = calculateFinancialAssessment(entrepreneurInputs, dairyPlanInputs);
      const stress = calculateStressAssessment(entrepreneurInputs, dairyPlanInputs, STRESS_CONFIG.scenarios.PRIMARY_DOWNSIDE);
      const decision = evaluateDecision(stress);

      setDomainResults({ assessment, stress, decision });
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete(); // e.g. reset
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="flex w-full min-h-[calc(100vh-64px)] bg-[#F7F4EE]">
      {/* Sidebar for Desktop */}
      <AssessmentSidebar currentStep={step} />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-[260px] flex justify-center">
        <div className="w-full max-w-[840px] px-4 md:px-8 py-8 md:py-12">
          
          {/* Mobile Step Indicator */}
          <div className="md:hidden mb-6 flex items-center gap-2 text-sm font-medium text-text-secondary">
            Step {step} of 4: <span className="text-text-primary">
              {step === 1 ? 'Entrepreneur Profile' : step === 2 ? 'Dairy Plan' : step === 3 ? 'Analysis' : 'Assessment Brief'}
            </span>
          </div>

          <FormProvider {...form}>
            {/* We intercept standard submission to handle it via steps, but keep form context active */}
            <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
              {step === 1 && <Step1Profile onNext={handleNext} />}
              {step === 2 && <Step2DairyPlan onNext={handleNext} onBack={handleBack} />}
              
              {step === 3 && domainResults && (
                <AnalysisStep 
                  assessment={domainResults.assessment}
                  decision={domainResults.decision}
                  onNext={handleNext} 
                  onBack={handleBack} 
                />
              )}

              {step === 4 && domainResults && (
                <AssessmentBrief 
                  data={form.getValues()}
                  assessment={domainResults.assessment}
                  stress={domainResults.stress}
                  decision={domainResults.decision}
                  onBack={handleBack}
                />
              )}
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}
