import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, AlertCircle, MapPin, Building2, Pencil } from "lucide-react";
import { formatINR } from "@/lib/calculations";

interface ExecutiveDecisionCardProps {
  decision: 'PROCEED' | 'MODIFY' | 'HIGH RISK';
  maxIndicativeLoan: number;
  schemeName: string;
  village: string;
  district: string;
  animalCount: number;
  onReset: () => void;
}

export function ExecutiveDecisionCard({
  decision,
  maxIndicativeLoan,
  schemeName,
  village,
  district,
  animalCount,
  onReset
}: ExecutiveDecisionCardProps) {
  return (
    <Card className={`overflow-hidden border border-slate-200 shadow-sm ${
      decision === 'PROCEED' ? 'border-t-4 border-t-emerald-600' : 
      decision === 'MODIFY' ? 'border-t-4 border-t-amber-500' : 
      'border-t-4 border-t-red-600'
    }`}>
      <CardContent className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-slate-500 font-normal uppercase tracking-wider text-xs">
                GramVyapar Executive Decision
              </Badge>
            </div>
            <h2 className="text-3xl font-bold flex items-center gap-3">
              {decision === 'PROCEED' && <CheckCircle2 className="w-8 h-8 text-emerald-600" />}
              {decision === 'MODIFY' && <AlertTriangle className="w-8 h-8 text-amber-500" />}
              {decision === 'HIGH RISK' && <AlertCircle className="w-8 h-8 text-red-600" />}
              <span className={
                decision === 'PROCEED' ? 'text-emerald-800' : 
                decision === 'MODIFY' ? 'text-amber-800' : 
                'text-red-800'
              }>{decision}</span>
            </h2>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed max-w-2xl">
              {decision === 'PROCEED' && `Your requirement fits the indicative prototype routing for a ${formatINR(maxIndicativeLoan)} loan. The proposed dairy plan shows strong resilience even under stress scenarios. Proceed with the application.`}
              {decision === 'MODIFY' && `Your requirement fits the indicative prototype routing for a ${formatINR(maxIndicativeLoan)} loan under the ${schemeName}, but the proposed dairy plan becomes vulnerable when milk yield falls and feed costs rise. Consider reducing the initial investment or herd size.`}
              {decision === 'HIGH RISK' && `The current financial structure is unsustainable. Operating surplus does not cover the required loan repayments for the proposed scale.`}
            </p>
            
            <div className="flex items-center gap-4 mt-6 text-sm text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {village}, {district}</span>
              <span className="flex items-center gap-1"><Building2 className="w-4 h-4" /> Dairy Farming ({animalCount} Animals)</span>
            </div>
          </div>
          
          <div className="hidden md:flex flex-col gap-2">
            <Button variant="outline" onClick={onReset} className="border-slate-300 text-slate-700 hover:bg-slate-50">
              <Pencil className="w-4 h-4 mr-2" /> Adjust Assessment
            </Button>
            <Button variant="ghost" onClick={onReset} className="text-slate-500">
              Start New
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
