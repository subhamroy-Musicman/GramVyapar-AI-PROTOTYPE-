import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LiveEvidence } from "@/types/evidence";

interface SWOTAnalysisCardProps {
  marginCapital: number;
  state: string;
  experienceLevel: string;
  evidence: LiveEvidence | null;
}

export function SWOTAnalysisCard({
  marginCapital,
  state,
  experienceLevel,
  evidence
}: SWOTAnalysisCardProps) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg text-slate-800">SWOT Analysis</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-white p-4">
            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Strengths</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• {marginCapital >= 100000 ? "Solid initial capital" : "Accessible scale"}</li>
              <li>• Local knowledge of {state}</li>
            </ul>
          </div>
          <div className="bg-white p-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Weaknesses</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• {experienceLevel === 'beginner' ? "Limited operational experience" : "Scale constraints"}</li>
              <li>• Input dependency</li>
            </ul>
          </div>
          <div className="bg-white p-4">
            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Opportunities</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• {evidence?.marketReach ? "Growing local demand identified" : "Potential local dairy demand — requires validation"}</li>
              <li>• Fits indicative financing routing</li>
            </ul>
          </div>
          <div className="bg-white p-4">
            <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2">Threats</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Climate volatility</li>
              <li>• Market price fluctuations</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
