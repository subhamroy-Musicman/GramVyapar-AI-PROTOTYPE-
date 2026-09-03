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
  const [evidence, setEvidence] = useState<EvidenceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentRequest, setCurrentRequest] = useState('');

  useEffect(() => {
    const requestKey = `${villageTown}|${district}|${state}`;
    let mounted = true;
    
    async function fetchEvidence() {
      try {
        setLoading(true);
        setEvidence(null);
        setError(false);
        setCurrentRequest(requestKey);

        const res = await fetch("/api/evidence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ villageTown, district, state })
        });
        
        if (!res.ok) throw new Error("Failed to fetch evidence");
        const data = await res.json();
        
        if (mounted && requestKey === `${villageTown}|${district}|${state}`) {
          setEvidence(data);
          setError(false);
          onTerminalState?.(data);
        }
      } catch (err) {
        console.error(err);
        if (mounted && requestKey === `${villageTown}|${district}|${state}`) {
          setError(true);
          onTerminalState?.('UNAVAILABLE');
        }
      } finally {
        if (mounted && requestKey === `${villageTown}|${district}|${state}`) {
          setLoading(false);
        }
      }
    }
    
    if (villageTown && district && state) {
      fetchEvidence();
    }

    return () => {
      mounted = false;
    };
  }, [villageTown, district, state, onTerminalState]);

  if (loading) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600 mb-4" />
        <p className="text-sm font-medium text-text-secondary">Checking mapped local evidence...</p>
      </div>
    );
  }

  if (error || !evidence) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
        <h3 className="text-lg font-serif mb-2 text-text-primary">Hyper-Local Evidence</h3>
        <p className="text-sm font-bold text-red-600 uppercase tracking-wider mb-2">DATA UNAVAILABLE</p>
        <p className="text-sm text-text-secondary">Failed to load hyper-local evidence. The provider might be temporarily unavailable.</p>
      </div>
    );
  }

  // Geocoding failure
  if (!evidence.location) {
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
        <p className="text-sm text-text-secondary">Evidence providers could not be reached. Local area activity cannot be evaluated at this time.</p>
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

  return (
    <section className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border-subtle">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-serif text-text-primary mb-1">Hyper-Local Evidence</h3>
          <p className="text-xs text-text-secondary">
            Evidence for: {evidence.location.resolvedDisplayName}
          </p>
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
            <span className="text-sm font-semibold text-text-primary mb-2">Potential Sales-Channel Signals</span>
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
            <span className="text-sm font-semibold text-text-primary mb-2">Veterinary / Support Infrastructure</span>
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
            <span className="text-sm font-semibold text-text-secondary">Dairy-Specific Evidence</span>
            <span className="font-bold text-text-primary uppercase">{evidence.dairySpecificConfidence}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border-subtle">
            <span className="text-sm font-semibold text-text-secondary">Mapped Dairy Activity</span>
            <span className="font-bold text-text-primary uppercase">{evidence.competitiveSignal}</span>
          </div>
          
          <div className="bg-surface-subtle p-3 rounded-lg border border-border-subtle mt-4">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">Limitations</span>
            <p className="text-xs text-text-secondary leading-relaxed">
              Mapped entities are observable signals, not measured demand or verified direct competitors.
            </p>
            {(!evidence.radius5km?.providerAvailable || !evidence.radius10km?.providerAvailable) && (
              <p className="text-xs text-amber-700 leading-relaxed mt-2 italic">
                * Note: Some local evidence radii could not be fetched due to provider unavailability.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
