"use client";

import { useEffect, useState } from "react";
import { EvidenceResult, RadiusEvidence } from "@/domain/evidence/types";
import { calculateMarketReach, MarketReachResult } from "@/domain/evidence/market-reach";
import { calculateOpportunityAnalysis, OpportunityAnalysisResult } from "@/domain/evidence/opportunity-analysis";
import { Loader2 } from "lucide-react";

interface HyperLocalEvidenceProps {
  villageTown: string;
  district: string;
  state: string;
  onTerminalState?: (evidence: EvidenceResult | 'UNAVAILABLE') => void;
}

export function HyperLocalEvidence({ villageTown, district, state, onTerminalState }: HyperLocalEvidenceProps) {
  const [evidence, setEvidence] = useState<EvidenceResult & { geocodeStatus?: string } | null>(null);
  const [marketReach, setMarketReach] = useState<MarketReachResult | null>(null);
  const [opportunityAnalysis, setOpportunityAnalysis] = useState<OpportunityAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentRequest, setCurrentRequest] = useState('');

  const requestKey = `${villageTown}|${district}|${state}`;

  const fetchEvidence = async (isRetry = false) => {
    try {
      setLoading(true);
      if (!isRetry) {
        setEvidence(null);
        setMarketReach(null);
        setOpportunityAnalysis(null);
      }
      setError(false);
      setCurrentRequest(requestKey);

      const res = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ villageTown, district, state })
      });
      
      if (!res.ok) throw new Error("Failed to fetch evidence");
      const data = await res.json();
      
      if (requestKey === `${villageTown}|${district}|${state}`) {
        setEvidence(data);
        if (data && data.geocodeStatus === 'SUCCESS') {
          const reach = calculateMarketReach(data);
          setMarketReach(reach);
          setOpportunityAnalysis(calculateOpportunityAnalysis(data, reach));
        }
        setError(false);
        if (data.geocodeStatus === 'SUCCESS') {
          onTerminalState?.(data);
        } else {
          onTerminalState?.('UNAVAILABLE');
        }
      }
    } catch (err) {
      console.error(err);
      if (requestKey === `${villageTown}|${district}|${state}`) {
        setError(true);
        onTerminalState?.('UNAVAILABLE');
      }
    } finally {
      if (requestKey === `${villageTown}|${district}|${state}`) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEvidence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);

  if (loading && !evidence) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-4" />
        <p className="text-sm font-medium text-text-secondary">Resolving location & fetching mapped evidence...</p>
      </div>
    );
  }

  if (error || (evidence && evidence.geocodeStatus === 'PROVIDER_FAILURE')) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
        <h3 className="text-lg font-serif mb-2 text-text-primary">Hyper-Local Market Reach</h3>
        <p className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2">DATA UNAVAILABLE</p>
        <p className="text-sm text-text-secondary mb-4">Location service or evidence providers are temporarily unavailable.</p>
        <button 
          type="button" 
          onClick={() => fetchEvidence(true)}
          className="text-xs font-semibold bg-brand-50 text-brand-700 px-4 py-2 rounded-md hover:bg-brand-100 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
          Retry local evidence
        </button>
      </div>
    );
  }

  if (evidence && evidence.geocodeStatus === 'NOT_FOUND') {
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
        <h3 className="text-lg font-serif mb-2 text-text-primary">Hyper-Local Market Reach</h3>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">DATA UNAVAILABLE</p>
        <p className="text-sm text-text-secondary">We could not confidently resolve this location exactly. Mapped evidence is unavailable.</p>
      </div>
    );
  }

  if (!evidence || !evidence.location || !marketReach || !opportunityAnalysis) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
        <h3 className="text-lg font-serif mb-2 text-text-primary">Hyper-Local Market Reach</h3>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">DATA UNAVAILABLE</p>
        <p className="text-sm text-text-secondary">Local mapped evidence could not be retrieved because the assessment location could not be resolved.</p>
      </div>
    );
  }

  if (evidence.availability === 'PROVIDER_UNAVAILABLE') {
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
        <h3 className="text-lg font-serif mb-2 text-text-primary">Hyper-Local Market Reach</h3>
        <p className="text-xs text-text-secondary mb-4">Location: {evidence.location.resolvedDisplayName}</p>
        <p className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2">DATA UNAVAILABLE</p>
        <p className="text-sm text-text-secondary mb-4">Evidence providers could not be reached. Local area activity cannot be evaluated at this time.</p>
        <button 
          type="button" 
          onClick={() => fetchEvidence(true)}
          className="text-xs font-semibold bg-brand-50 text-brand-700 px-4 py-2 rounded-md hover:bg-brand-100 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null}
          Retry local evidence
        </button>
      </div>
    );
  }

  const { status, locationLabel, locationPrecision, radius5km, radius10km, distributionChannels, consumerBase, evidenceConfidence, limitations, validationActions } = marketReach;

  const isDistrictFallback = locationPrecision === 'DISTRICT';

  return (
    <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle min-w-0">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-serif text-text-primary mb-1">Hyper-Local Market Reach</h3>
          <p className="text-xs text-text-secondary mb-2 truncate">
            Location: {locationLabel}
          </p>
          <div className="inline-flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Precision:</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isDistrictFallback ? 'bg-amber-100 text-amber-800' : 'bg-brand-50 text-brand-700'}`}>
              {locationPrecision}
            </span>
          </div>
        </div>
        <div className={`text-[10px] font-bold px-2 py-1 rounded border tracking-wider uppercase shrink-0 ${
          status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          status === 'LIMITED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
          'bg-slate-50 text-slate-600 border-slate-200'
        }`}>
          {status}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Left Column */}
        <div className="space-y-6 min-w-0">
          
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-border-subtle pb-2 mb-3">Within 5 km</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Direct business signals</span>
                <span className="font-medium text-text-primary">{radius5km.directBusinessSignals}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Potential sales channels</span>
                <span className="font-medium text-text-primary">{radius5km.potentialSalesChannels}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Support infrastructure</span>
                <span className="font-medium text-text-primary">{radius5km.supportInfrastructure}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-border-subtle pb-2 mb-3">Within 10 km</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Direct business signals</span>
                <span className="font-medium text-text-primary">{radius10km.directBusinessSignals}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Potential sales channels</span>
                <span className="font-medium text-text-primary">{radius10km.potentialSalesChannels}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Support infrastructure</span>
                <span className="font-medium text-text-primary">{radius10km.supportInfrastructure}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-border-subtle pb-2 mb-3">Primary Mapped Channels</h4>
            {distributionChannels.length === 0 ? (
              <p className="text-sm text-text-secondary italic">No mapped distribution-channel evidence was found from the current provider.</p>
            ) : (
              <div className="space-y-4">
                {distributionChannels.map(ch => (
                  <div key={ch.id}>
                    <p className="text-sm font-medium text-text-primary mb-1">{ch.label}</p>
                    <div className="flex gap-4 text-xs text-text-secondary">
                      <span>5 km: {ch.count5km}</span>
                      <span>10 km: {ch.count10km}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 pt-1 min-w-0">
          
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-border-subtle pb-2 mb-3">Consumer Base</h4>
            {consumerBase.status === 'AVAILABLE' ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Estimated consumer base</span>
                  <span className="font-medium text-text-primary">{consumerBase.estimatedPopulation}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Source</span>
                  <span className="font-medium text-text-primary">{consumerBase.source}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Confidence</span>
                  <span className="font-medium text-text-primary uppercase">{consumerBase.confidence}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-text-secondary">{consumerBase.message}</p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-border-subtle pb-2 mb-3">Evidence Confidence</h4>
            <p className="text-sm font-bold text-text-primary uppercase">{evidenceConfidence}</p>
          </div>

          <div className="bg-surface-subtle p-4 rounded-lg border border-border-subtle">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-2">What This Data Does Not Prove</span>
            <ul className="text-xs text-text-secondary leading-relaxed list-disc pl-4 space-y-1">
              {limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>

          <div className="bg-brand-50 p-4 rounded-lg border border-brand-100">
            <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block mb-2">Validate Before Investing</span>
            <ul className="text-xs text-brand-800 leading-relaxed list-disc pl-4 space-y-1 font-medium">
              {validationActions.map((action, idx) => (
                <li key={idx}>{action}</li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* OPPORTUNITY ANALYSIS SECTION */}
      <div className="mt-8 border-t border-border-subtle pt-8">
        <h3 className="text-lg font-serif text-text-primary mb-6">Opportunity Analysis</h3>
        
        {opportunityAnalysis.status === 'INSUFFICIENT_DATA' ? (
          <div className="bg-surface-subtle p-6 rounded-xl border border-border-subtle">
            <p className="text-sm text-text-secondary font-medium mb-4">{opportunityAnalysis.summary}</p>
            <div className="bg-white p-4 rounded-lg border border-border-subtle">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">What to validate manually</span>
              <ul className="text-xs text-text-secondary leading-relaxed list-disc pl-4 space-y-1">
                {opportunityAnalysis.limitations.map((lim, idx) => (
                  <li key={idx}>{lim}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {opportunityAnalysis.opportunities.map(opp => (
              <div key={opp.id} className="bg-white p-5 rounded-xl border border-border-subtle shadow-sm min-w-0">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-bold text-text-primary">{opp.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                    opp.confidence === 'HIGH' ? 'bg-emerald-50 text-emerald-800' :
                    opp.confidence === 'MEDIUM' ? 'bg-blue-50 text-blue-800' :
                    'bg-amber-50 text-amber-800'
                  }`}>
                    {opp.confidence} CONFIDENCE
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Observation</span>
                    <p className="text-sm text-text-secondary">{opp.observation}</p>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block mb-1">Why It May Matter</span>
                    <p className="text-sm text-brand-900 font-medium">{opp.hypothesis}</p>
                  </div>

                  <div className="bg-surface-subtle p-3 rounded-lg border border-border-subtle">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Not Yet Verified</span>
                    <p className="text-xs text-text-secondary">
                      {opp.notVerified.join(" • ")}
                    </p>
                  </div>

                  <div className="bg-brand-50 p-3 rounded-lg border border-brand-100">
                    <span className="text-[10px] font-bold text-brand-700 uppercase tracking-wider block mb-1">Validate Before Investing</span>
                    <p className="text-xs text-brand-800 font-medium">{opp.validationAction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
