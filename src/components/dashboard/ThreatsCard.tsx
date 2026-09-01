import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LiveEvidence } from "@/types/evidence";
import { EvidenceBadge } from "./EvidenceBadge";

interface ThreatsCardProps {
  evidence: LiveEvidence | null;
}

export function ThreatsCard({ evidence }: ThreatsCardProps) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg text-slate-800">Threat Identification</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Ranked risks for your profile</p>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {evidence?.weatherRisk && (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="font-medium text-sm text-slate-800 flex items-center gap-2">
                  Environmental Risk <EvidenceBadge item={evidence.weatherRisk} />
                </span>
                <span className="text-xs text-slate-500">{evidence.weatherRisk.label}</span>
              </div>
              <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 shrink-0">Variable</Badge>
            </div>
            <Separator className="bg-slate-100" />
          </>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-medium text-sm text-slate-800 block">Feed Cost Volatility</span>
            <span className="text-xs text-slate-500">Highly sensitive to market rates</span>
          </div>
          <Badge variant="destructive" className="bg-red-600 text-white hover:bg-red-700 shrink-0">High Risk</Badge>
        </div>
        <Separator className="bg-slate-100" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-medium text-sm text-slate-800 block">Seasonal Milk Yield Variation</span>
            <span className="text-xs text-slate-500">Summer drops affect cash flow</span>
          </div>
          <Badge variant="destructive" className="bg-red-600 text-white hover:bg-red-700 shrink-0">High Risk</Badge>
        </div>
        <Separator className="bg-slate-100" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-medium text-sm text-slate-800 block">Buyer Dependency</span>
            <span className="text-xs text-slate-500">Relying on few collection points</span>
          </div>
          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 shrink-0">Medium Risk</Badge>
        </div>
        <Separator className="bg-slate-100" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-medium text-sm text-slate-800 block">Veterinary Accessibility</span>
            <span className="text-xs text-slate-500">Emergency care availability</span>
          </div>
          <Badge variant="outline" className="text-amber-700 border-amber-300 bg-amber-50 shrink-0">Medium Risk</Badge>
        </div>
        <Separator className="bg-slate-100" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="font-medium text-sm text-slate-800 block">Working Capital Pressure</span>
            <span className="text-xs text-slate-500">Monthly operational buffer</span>
          </div>
          <Badge variant="outline" className="text-slate-600 border-slate-300 bg-slate-50 shrink-0">Low Risk</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
