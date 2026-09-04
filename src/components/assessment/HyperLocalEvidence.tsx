"use client";

import { useEffect, useState } from "react";
import { EvidenceResult, RadiusEvidence } from "@/domain/evidence/types";
import { Loader2 } from "lucide-react";

interface HyperLocalEvidenceProps {
  villageTown: string;
  district: string;
  state: string;
  onTerminalState?: (evidence: EvidenceResult | 'UNAVAILABLE') => void;
}

export function HyperLocalEvidence({ villageTown, district, state, onTerminalState }: HyperLocalEvidenceProps) {
  const [evidence, setEvidence] = useState<EvidenceResult & { geocodeStatus?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentRequest, setCurrentRequest] = useState('');

  const requestKey = `${villageTown}|${district}|${state}`;

  const fetchEvidence = async (isRetry = false) => {
    try {
      setLoading(true);
      if (!isRetry) {
        setEvidence(null);
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
        <h3 className="text-lg font-serif mb-2 text-text-primary">Hyper-Local Evidence</h3>
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
        <h3 className="text-lg font-serif mb-2 text-text-primary">Hyper-Local Evidence</h3>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">DATA UNAVAILABLE</p>
        <p className="text-sm text-text-secondary">We could not confidently resolve this location exactly. Mapped evidence is unavailable.</p>
      </div>
    );
  }

  // Fallback for null location when it should be SUCCESS (just in case)
  if (!evidence || !evidence.location) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
        <h3 className="text-lg font-serif mb-2 text-text-primary">Hyper-Local Evidence</h3>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">DATA UNAVAILABLE</p>
        <p className="text-sm text-text-secondary">Local mapped evidence could not be retrieved because the assessment location could not be resolved.</p>
      </div>
    );
  }

  // Total mapped evidence failure
  if (evidence.availability === 'PROVIDER_UNAVAILABLE') {
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
        <h3 className="text-lg font-serif mb-2 text-text-primary">Hyper-Local Evidence</h3>
        <p className="text-xs text-text-secondary mb-4">Evidence for: {evidence.location.resolvedDisplayName}</p>
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

  let topLevelStatus = 'AVAILABLE';
  if (!evidence.radius5km?.providerAvailable || !evidence.radius10km?.providerAvailable || evidence.availability === 'INSUFFICIENT') {
    topLevelStatus = 'LIMITED';
  }

  const formatCount = (radius: RadiusEvidence | null, key: 'directDairySignals' | 'potentialSalesChannels' | 'supportInfrastructure') => {
    if (!radius?.providerAvailable) return 'unavailable';
    return `${radius[key].length} mapped`;
  };

  const isDistrictFallback = evidence.location.resolutionLevel === 'DISTRICT';

  return (
    <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-serif text-text-primary mb-1">Hyper-Local Evidence</h3>
          <p className="text-xs text-text-secondary mb-2">
            Evidence for: {evidence.location.resolvedDisplayName}
          </p>
          <div className="inline-flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location Precision:</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${isDistrictFallback ? 'bg-amber-100 text-amber-800' : 'bg-brand-50 text-brand-700'}`}>
              {isDistrictFallback ? 'DISTRICT-LEVEL FALLBACK' : evidence.location.resolutionLevel}
            </span>
          </div>
          {isDistrictFallback && (
            <p className="text-[11px] text-amber-700 mt-1 italic">
              Exact locality could not be resolved. Using district-level location fallback.
            </p>
          )}
        </div>
        <div className={`text-[10px] font-bold px-2 py-1 rounded border tracking-wider uppercase ${
          topLevelStatus === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          topLevelStatus === 'LIMITED' ? 'bg-amber-50 text-amber-800 border-amber-200' :
          'bg-slate-50 text-slate-600 border-slate-200'
        }`}>
          {topLevelStatus}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="flex flex-col border-b border-border-subtle py-2">
            <span className="text-sm font-semibold text-text-primary mb-2">Mapped Dairy Activity</span>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">Within 5 km</span>
              <span className={`font-medium ${!evidence.radius5km?.providerAvailable ? 'text-slate-400 italic' : 'text-text-primary'}`}>
                {formatCount(evidence.radius5km, 'directDairySignals')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Within 10 km</span>
              <span className={`font-medium ${!evidence.radius10km?.providerAvailable ? 'text-slate-400 italic' : 'text-text-primary'}`}>
                {formatCount(evidence.radius10km, 'directDairySignals')}
              </span>
            </div>
          </div>

          <div className="flex flex-col border-b border-border-subtle py-2">
            <span className="text-sm font-semibold text-text-primary mb-2">Potential Sales Channels</span>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">Within 5 km</span>
              <span className={`font-medium ${!evidence.radius5km?.providerAvailable ? 'text-slate-400 italic' : 'text-text-primary'}`}>
                {formatCount(evidence.radius5km, 'potentialSalesChannels')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Within 10 km</span>
              <span className={`font-medium ${!evidence.radius10km?.providerAvailable ? 'text-slate-400 italic' : 'text-text-primary'}`}>
                {formatCount(evidence.radius10km, 'potentialSalesChannels')}
              </span>
            </div>
          </div>

          <div className="flex flex-col border-b border-border-subtle py-2">
            <span className="text-sm font-semibold text-text-primary mb-2">Support Infrastructure</span>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-text-secondary">Within 5 km</span>
              <span className={`font-medium ${!evidence.radius5km?.providerAvailable ? 'text-slate-400 italic' : 'text-text-primary'}`}>
                {formatCount(evidence.radius5km, 'supportInfrastructure')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Within 10 km</span>
              <span className={`font-medium ${!evidence.radius10km?.providerAvailable ? 'text-slate-400 italic' : 'text-text-primary'}`}>
                {formatCount(evidence.radius10km, 'supportInfrastructure')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4 pt-1">
          <div className="flex justify-between items-center py-2 border-b border-border-subtle">
            <span className="text-sm font-semibold text-text-secondary">Evidence Status</span>
            <span className="font-bold text-text-primary uppercase">{topLevelStatus}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border-subtle">
            <span className="text-sm font-semibold text-text-secondary">Dairy-Specific Evidence</span>
            <span className="font-bold text-text-primary uppercase">{evidence.dairySpecificConfidence}</span>
          </div>
          
          <div className="bg-surface-subtle p-3 rounded-lg border border-border-subtle mt-4">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Limitations</span>
            <p className="text-xs text-text-secondary leading-relaxed">
              Mapped entities are observable signals, not measured demand or verified direct competitors.
            </p>
            {(!evidence.radius5km?.providerAvailable || !evidence.radius10km?.providerAvailable) && (
              <p className="text-xs text-amber-700 leading-relaxed mt-2 italic">
                * Some local evidence radii could not be fetched due to provider unavailability.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
