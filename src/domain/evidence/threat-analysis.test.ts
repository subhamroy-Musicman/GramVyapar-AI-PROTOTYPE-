import { describe, it, expect } from 'vitest';
import { calculateThreatAnalysis } from './threat-analysis';

describe('Threat Analysis', () => {
  const createMockInputs = (
    baseCash: number,
    stressCash: number,
    decisionStatus: 'PROCEED' | 'MODIFY' | 'HIGH_RISK',
    decisionReasons: string[],
    evidenceCoverage: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT',
    isDistrictFallback: boolean,
    providerAvailable: boolean,
    infraCount: number
  ) => {
    const financial: any = {
      funding: { fundingGap: 50000 },
      cashFlow: { postNewLoanRepaymentCash: baseCash }
    };
    
    const stress: any = {
      stressed: { cashFlow: { postNewLoanRepaymentCash: stressCash } }
    };

    const decision: any = {
      status: decisionStatus,
      reasonCodes: decisionReasons
    };
    
    const evidence: any = providerAvailable ? {
      availability: 'AVAILABLE',
      commercialEvidenceCoverage: evidenceCoverage,
      location: { resolutionLevel: isDistrictFallback ? 'DISTRICT' : 'LOCALITY' }
    } : 'UNAVAILABLE';
    
    const marketReach: any = providerAvailable ? {
      status: 'AVAILABLE',
      radius10km: { supportInfrastructure: infraCount },
      consumerBase: { status: 'AVAILABLE' }
    } : { status: 'DATA_UNAVAILABLE' };
    
    return { financial, stress, decision, evidence, marketReach };
  };

  it('Yield/feed stress can generate modelled threats from existing stress result', () => {
    const { financial, stress, decision, evidence, marketReach } = createMockInputs(10000, 5000, 'PROCEED', [], 'MEDIUM', false, true, 2);
    const result = calculateThreatAnalysis(financial, stress, decision, evidence, marketReach, null);
    
    expect(result.threats.some(t => t.category === 'PRODUCTION')).toBe(true);
    expect(result.threats.some(t => t.category === 'INPUT_COST')).toBe(true);
  });

  it('No isolated impact claim is made if the current engine only uses a combined stress scenario', () => {
    const { financial, stress, decision, evidence, marketReach } = createMockInputs(10000, 5000, 'PROCEED', [], 'MEDIUM', false, true, 2);
    const result = calculateThreatAnalysis(financial, stress, decision, evidence, marketReach, null);
    
    const prod = result.threats.find(t => t.category === 'PRODUCTION')!;
    const input = result.threats.find(t => t.category === 'INPUT_COST')!;
    
    expect(prod.sourceDetail).toContain('combines lower milk yield (-20%) and higher feed cost (+15%)');
    expect(input.sourceDetail).toContain('combines lower milk yield (-20%) and higher feed cost (+15%)');
  });

  it('Negative stressed post-repayment cash can generate financing threat', () => {
    const { financial, stress, decision, evidence, marketReach } = createMockInputs(10000, -1000, 'MODIFY', ['STRESS_RESILIENCE_THIN'], 'MEDIUM', false, true, 2);
    const result = calculateThreatAnalysis(financial, stress, decision, evidence, marketReach, null);
    
    const threat = result.threats.find(t => t.category === 'FINANCING')!;
    expect(threat).toBeDefined();
    expect(threat.severity).toBe('HIGH');
  });

  it('Positive healthy stressed cash does not fabricate high financing risk', () => {
    const { financial, stress, decision, evidence, marketReach } = createMockInputs(10000, 8000, 'PROCEED', [], 'MEDIUM', false, true, 2);
    const result = calculateThreatAnalysis(financial, stress, decision, evidence, marketReach, null);
    
    const threat = result.threats.find(t => t.category === 'FINANCING');
    expect(threat).toBeUndefined();
  });

  it('Low local evidence can generate evidence-uncertainty threat/limitation', () => {
    const { financial, stress, decision, evidence, marketReach } = createMockInputs(10000, 8000, 'PROCEED', [], 'LOW', false, true, 2);
    const result = calculateThreatAnalysis(financial, stress, decision, evidence, marketReach, null);
    
    const threat = result.threats.find(t => t.category === 'EVIDENCE_UNCERTAINTY')!;
    expect(threat).toBeDefined();
    expect(threat.confidence).toBe('LOW');
  });

  it('Local evidence failure preserves financial/stress threats', () => {
    const { financial, stress, decision, evidence, marketReach } = createMockInputs(10000, -1000, 'MODIFY', ['STRESS_RESILIENCE_THIN'], 'MEDIUM', false, false, 2);
    const result = calculateThreatAnalysis(financial, stress, decision, evidence, marketReach, null);
    
    expect(result.threats.some(t => t.category === 'PRODUCTION')).toBe(true);
    expect(result.threats.some(t => t.category === 'FINANCING')).toBe(true);
  });

  it('Local evidence failure does not fabricate local threats', () => {
    const { financial, stress, decision, evidence, marketReach } = createMockInputs(10000, 8000, 'PROCEED', [], 'MEDIUM', false, false, 2);
    const result = calculateThreatAnalysis(financial, stress, decision, evidence, marketReach, null);
    
    expect(result.threats.some(t => t.category === 'INFRASTRUCTURE')).toBe(false);
  });

  it('No buyer-dependency threat without buyer-dependency data', () => {
    const { financial, stress, decision, evidence, marketReach } = createMockInputs(10000, 8000, 'PROCEED', [], 'MEDIUM', false, true, 2);
    const result = calculateThreatAnalysis(financial, stress, decision, evidence, marketReach, null);
    
    expect(result.threats.some(t => t.category === 'BUYER_DEPENDENCY')).toBe(false);
  });

  it('No seasonality threat without seasonality data', () => {
    const { financial, stress, decision, evidence, marketReach } = createMockInputs(10000, 8000, 'PROCEED', [], 'MEDIUM', false, true, 2);
    const result = calculateThreatAnalysis(financial, stress, decision, evidence, marketReach, null);
    
    expect(result.threats.some(t => t.category === 'SEASONALITY')).toBe(false);
  });

  it('No supply-chain bottleneck without supporting data', () => {
    const { financial, stress, decision, evidence, marketReach } = createMockInputs(10000, 8000, 'PROCEED', [], 'MEDIUM', false, true, 2);
    const result = calculateThreatAnalysis(financial, stress, decision, evidence, marketReach, null);
    
    expect(result.threats.some(t => t.category === 'SUPPLY_CHAIN')).toBe(false);
  });

  it('Infrastructure threat only appears under sufficiently supported evidence conditions', () => {
    // Sparse infra, good evidence -> threat
    const input1 = createMockInputs(10000, 8000, 'PROCEED', [], 'MEDIUM', false, true, 0);
    const res1 = calculateThreatAnalysis(input1.financial, input1.stress, input1.decision, input1.evidence, input1.marketReach, null);
    expect(res1.threats.some(t => t.category === 'INFRASTRUCTURE')).toBe(true);
    
    // Sparse infra, poor evidence -> no threat (too weak to make that assertion)
    const input2 = createMockInputs(10000, 8000, 'PROCEED', [], 'LOW', false, true, 0);
    const res2 = calculateThreatAnalysis(input2.financial, input2.stress, input2.decision, input2.evidence, input2.marketReach, null);
    expect(res2.threats.some(t => t.category === 'INFRASTRUCTURE')).toBe(false);
  });

  it('Every threat has required deterministic properties', () => {
    const { financial, stress, decision, evidence, marketReach } = createMockInputs(10000, -1000, 'MODIFY', ['STRESS_RESILIENCE_THIN'], 'LOW', false, true, 0);
    const result = calculateThreatAnalysis(financial, stress, decision, evidence, marketReach, null);
    
    expect(result.threats.length).toBeGreaterThan(0);
    
    result.threats.forEach(t => {
      expect(t.sourceType).toBeTruthy();
      expect(t.sourceDetail).toBeTruthy();
      expect(['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']).toContain(t.severity);
      expect(['HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT']).toContain(t.confidence);
      expect(t.notVerified.length).toBeGreaterThan(0);
      expect(t.mitigationAction).toBeTruthy();
    });
  });
  
  it('Threat Analysis cannot change PROCEED / MODIFY / HIGH_RISK', () => {
    // The ThreatAnalysisResult structure does not contain a decision status override.
    const { financial, stress, decision, evidence, marketReach } = createMockInputs(10000, -1000, 'PROCEED', [], 'LOW', false, true, 0);
    const result = calculateThreatAnalysis(financial, stress, decision, evidence, marketReach, null);
    expect((result as any).decision).toBeUndefined(); 
  });
});
