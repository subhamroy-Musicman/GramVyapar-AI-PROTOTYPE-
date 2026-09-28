import { describe, it, expect } from 'vitest';
import { calculateOpportunityAnalysis } from './opportunity-analysis';
import { MarketReachResult } from './market-reach';
import { EvidenceResult } from './types';

describe('Opportunity Analysis', () => {
  const baseEvidence = {
    availability: 'AVAILABLE',
    location: { resolutionLevel: 'LOCALITY' }
  } as unknown as EvidenceResult;

  const createMarketReach = (sales: number, direct: number, support: number, fallback = false): MarketReachResult => ({
    status: 'AVAILABLE',
    locationPrecision: fallback ? 'DISTRICT' : 'LOCALITY',
    radius10km: {
      potentialSalesChannels: sales,
      directBusinessSignals: direct,
      supportInfrastructure: support,
      totalMappedSignals: sales + direct + support
    }
  } as unknown as MarketReachResult);

  it('generates sales-channel hypothesis from mapped channel evidence without high demand claims', () => {
    const market = createMarketReach(5, 3, 0);
    const result = calculateOpportunityAnalysis(baseEvidence, market);
    const salesHypothesis = result.opportunities.find(o => o.id === 'SALES_CHANNEL_ACCESS');
    
    expect(salesHypothesis).toBeDefined();
    expect(salesHypothesis?.observation).toContain('Mapped potential sales channels');
    expect(salesHypothesis?.hypothesis).not.toContain('high demand');
    expect(salesHypothesis?.validationAction).toContain('Speak with nearby mapped retailers');
    expect(salesHypothesis?.notVerified).toContain('actual purchase volume');
  });

  it('generates dairy ecosystem observation, not market saturation', () => {
    const market = createMarketReach(0, 4, 0);
    const result = calculateOpportunityAnalysis(baseEvidence, market);
    const dairyHypothesis = result.opportunities.find(o => o.id === 'DAIRY_ECOSYSTEM_PRESENCE');
    
    expect(dairyHypothesis).toBeDefined();
    expect(dairyHypothesis?.observation).toContain('Mapped dairy-related businesses');
    expect(dairyHypothesis?.hypothesis).toContain('ecosystem');
    expect(dairyHypothesis?.hypothesis).not.toContain('saturated');
  });

  it('generates potential sourcing gap hypothesis (sparse direct signals + sales channels)', () => {
    const market = createMarketReach(5, 1, 0);
    const result = calculateOpportunityAnalysis(baseEvidence, market);
    const gapHypothesis = result.opportunities.find(o => o.id === 'SPARSE_MAPPED_COMPETITION');
    
    expect(gapHypothesis).toBeDefined();
    expect(gapHypothesis?.title).toBe('Potential Sourcing Gap');
    expect(gapHypothesis?.hypothesis).toContain('unmet sourcing needs');
    expect(gapHypothesis?.notVerified).toContain('unmapped dairy businesses');
  });

  it('zero direct signals does not produce "no competition"', () => {
    const market = createMarketReach(5, 0, 0);
    const result = calculateOpportunityAnalysis(baseEvidence, market);
    
    const allText = JSON.stringify(result).toLowerCase();
    expect(allText).not.toContain('no competition');
  });

  it('zero evidence returns INSUFFICIENT_DATA and no opportunities', () => {
    const market = createMarketReach(0, 0, 0);
    const result = calculateOpportunityAnalysis(baseEvidence, market);
    
    expect(result.status).toBe('INSUFFICIENT_DATA');
    expect(result.opportunities.length).toBe(0);
  });

  it('provider failure (DATA_UNAVAILABLE in marketReach) returns safe insufficient result', () => {
    const market = { ...createMarketReach(5, 5, 5), status: 'DATA_UNAVAILABLE' } as any;
    const result = calculateOpportunityAnalysis(baseEvidence, market);
    
    expect(result.status).toBe('INSUFFICIENT_DATA');
    expect(result.opportunities.length).toBe(0);
  });

  it('every generated opportunity contains a validation action and notVerified array', () => {
    const market = createMarketReach(5, 5, 5);
    const result = calculateOpportunityAnalysis(baseEvidence, market);
    
    expect(result.opportunities.length).toBeGreaterThan(0);
    result.opportunities.forEach(opp => {
      expect(opp.validationAction).toBeDefined();
      expect(typeof opp.validationAction).toBe('string');
      expect(opp.notVerified.length).toBeGreaterThan(0);
    });
  });

  it('confidence is strictly categorical and constrained', () => {
    const market = createMarketReach(20, 20, 20);
    const result = calculateOpportunityAnalysis(baseEvidence, market);
    
    expect(['HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT']).toContain(result.overallConfidence);
    result.opportunities.forEach(opp => {
      expect(['HIGH', 'MEDIUM', 'LOW', 'INSUFFICIENT']).toContain(opp.confidence);
    });
  });
});
