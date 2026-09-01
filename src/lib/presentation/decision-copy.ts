import { DecisionReasonCode } from '@/domain/decision/types';

export const DECISION_REASON_COPY: Record<DecisionReasonCode, { title: string; description: string }> = {
  BASE_OPERATING_SURPLUS_NEGATIVE: {
    title: "Base economics are unsustainable",
    description: "Operating surplus is negative even before factoring in loan repayment or stress."
  },
  BASE_POST_REPAYMENT_CASH_NEGATIVE: {
    title: "Repayment pressure",
    description: "The base case does not generate sufficient post-repayment cash to support this financing structure."
  },
  EXISTING_DEBT_PRESSURE: {
    title: "Existing debt pressure",
    description: "Existing debt obligations materially weaken the business resilience to negative cash flow."
  },
  STRESS_POST_REPAYMENT_CASH_NEGATIVE: {
    title: "Stress creates repayment pressure",
    description: "Cash after repayment becomes negative when milk yield falls and feed costs rise."
  },
  STRESS_EXISTING_DEBT_PRESSURE: {
    title: "Stress exposes existing debt risk",
    description: "The business cannot comfortably cover existing debt obligations under downside stress conditions."
  },
  STRESS_RESILIENCE_THIN: {
    title: "Thin stress buffer",
    description: "The business remains technically cash-positive under stress, but the buffer is materially thin."
  },
  FINANCING_OUTSIDE_PROTOTYPE_RANGE: {
    title: "Financing structure needs revision",
    description: "The funding requirement exceeds the prototype financing range even though business economics may remain positive."
  },
  STRONG_BASE_ECONOMICS: {
    title: "Strong base economics",
    description: "Operating surplus and post-repayment cash remain positive under current baseline assumptions."
  },
  STRESS_CASE_REMAINS_POSITIVE: {
    title: "Resilient under stress",
    description: "The business remains cash-positive after the defined downside scenario."
  }
};
