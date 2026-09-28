import { describe, it, expect } from 'vitest';
import { calculateSwotAnalysis } from './swot-analysis';

describe('SWOT Analysis', () => {
  const createMockInputs = (
    surplus: number, 
    postRepaymentCash: number, 
    stressCash: number, 
    debtRatio: number,
    salesChannels: number,
    fallback: boolean,
    consumerUnavailable: boolean
  ) => {
    const financial: any = {
      project: { projectCost: 100000 },
      funding: { fundingGap: 100000 * debtRatio },
      economics: { operatingSurplus: surplus },
      cashFlow: { postNewLoanRepaymentCash: postRepaymentCash }
    };
    
    const stress: any = {
      stressed: { cashFlow: { postNewLoanRepaymentCash: stressCash } }
    };
    
    const evidence: any = {
      commercialEvidenceCoverage: 'MEDIUM',
      location: { resolutionLevel: fallback ? 'DISTRICT' : 'LOCALITY' }
    };
    
    const marketReach: any = {
      status: 'AVAILABLE',
      radius10km: { potentialSalesChannels: salesChannels, supportInfrastructure: 0 },
      consumerBase: { status: consumerUnavailable ? 'DATA_UNAVAILABLE' : 'AVAILABLE' }
    };
    
    const opportunityAnalysis: any = {
      opportunities: salesChannels > 0 ? [{
        id: 'SALES',
        hypothesis: 'Mapped sales channels hypothesis',
        observation: 'obs',
        confidence: 'MEDIUM',
        validationAction: 'val'
      }] : []
    };
    
    return { financial, stress, evidence, marketReach, opportunityAnalysis };
  };

  it('Positive operating surplus creates Strength', () => {
    const { financial, stress, evidence, marketReach, opportunityAnalysis } = createMockInputs(5000, 1000, 1000, 0.5, 0, false, false);
    const swot = calculateSwotAnalysis(financial, stress, evidence, marketReach, opportunityAnalysis);
    
    expect(swot.strengths.some(s => s.id === 'S_POSITIVE_SURPLUS')).toBe(true);
    const item = swot.strengths.find(s => s.id === 'S_POSITIVE_SURPLUS')!;
    expect(item.sourceType).toBe('CALCULATED_RESULT');
    expect(item.sourceDetail).toContain('5,000');
  });

  it('Positive post-repayment cash creates Strength', () => {
    const { financial, stress, evidence, marketReach, opportunityAnalysis } = createMockInputs(5000, 2000, 2000, 0.5, 0, false, false);
    const swot = calculateSwotAnalysis(financial, stress, evidence, marketReach, opportunityAnalysis);
    
    expect(swot.strengths.some(s => s.id === 'S_POSITIVE_CASH_POST_REPAYMENT')).toBe(true);
  });

  it('Mapped sales channels do not create high demand claim', () => {
    const { financial, stress, evidence, marketReach, opportunityAnalysis } = createMockInputs(0, 0, 0, 0.5, 5, false, false);
    const swot = calculateSwotAnalysis(financial, stress, evidence, marketReach, opportunityAnalysis);
    
    const allText = JSON.stringify(swot).toLowerCase();
    expect(allText).not.toContain('high demand');
  });

  it('Opportunity SWOT item comes only from existing OpportunityAnalysis', () => {
    const { financial, stress, evidence, marketReach, opportunityAnalysis } = createMockInputs(0, 0, 0, 0.5, 5, false, false);
    const swot = calculateSwotAnalysis(financial, stress, evidence, marketReach, opportunityAnalysis);
    
    expect(swot.opportunities.length).toBe(1);
    expect(swot.opportunities[0].statement).toBe('Mapped sales channels hypothesis');
    expect(swot.opportunities[0].sourceType).toBe('OPPORTUNITY_HYPOTHESIS');
  });

  it('Stress sensitivity can create Weakness or Threat', () => {
    // Weakness case: drops >30% but remains >0
    const wInputs = createMockInputs(10000, 10000, 5000, 0.5, 0, false, false);
    const wSwot = calculateSwotAnalysis(wInputs.financial, wInputs.stress, wInputs.evidence, wInputs.marketReach, wInputs.opportunityAnalysis);
    expect(wSwot.weaknesses.some(w => w.id === 'W_STRESS_SENSITIVE')).toBe(true);
    
    // Threat case: drops <0
    const tInputs = createMockInputs(10000, 10000, -1000, 0.5, 0, false, false);
    const tSwot = calculateSwotAnalysis(tInputs.financial, tInputs.stress, tInputs.evidence, tInputs.marketReach, tInputs.opportunityAnalysis);
    expect(tSwot.threats.some(t => t.id === 'T_STRESS_DETERIORATION')).toBe(true);
  });

  it('Consumer-base unavailable becomes limitation, not business weakness', () => {
    const { financial, stress, evidence, marketReach, opportunityAnalysis } = createMockInputs(10000, 10000, 10000, 0.5, 0, false, true);
    const swot = calculateSwotAnalysis(financial, stress, evidence, marketReach, opportunityAnalysis);
    
    expect(swot.weaknesses.length).toBe(0);
    expect(swot.limitations).toContain('Consumer population is currently unavailable.');
  });
  
  it('No generic "competition is high" claim', () => {
    const { financial, stress, evidence, marketReach, opportunityAnalysis } = createMockInputs(10000, 10000, 10000, 0.5, 0, false, false);
    const swot = calculateSwotAnalysis(financial, stress, evidence, marketReach, opportunityAnalysis);
    
    const allText = JSON.stringify(swot).toLowerCase();
    expect(allText).not.toContain('competition is high');
  });
});
