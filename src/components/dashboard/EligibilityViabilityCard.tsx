import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/calculations";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface EligibilityViabilityCardProps {
  t: (key: string) => string;
  projectCost: number;
  suggestedProjectCost: number;
  suggestedProjectScale: number;
  maxIndicativeLoan: number;
  suggestedLoan: number;
  decision: string;
}

export function EligibilityViabilityCard({
  t,
  projectCost,
  suggestedProjectCost,
  suggestedProjectScale,
  maxIndicativeLoan,
  suggestedLoan,
  decision
}: EligibilityViabilityCardProps) {
  return (
    <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg text-slate-800">{t("Eligibility vs Viability")}</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Maximum borrowing eligibility is not always the same as optimal capital deployment.</p>
      </CardHeader>
      <CardContent className="p-6 md:p-8 space-y-8">
        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-slate-600">Maximum Indicative Project Size</span>
            <span className="text-xl font-bold tabular-nums text-slate-800">{formatINR(projectCost)}</span>
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-slate-300 w-full" />
          </div>
          <p className="text-xs text-slate-400 mt-1 text-right">Max capacity based on margin</p>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-medium text-emerald-800 flex items-center gap-2">
              Prototype Suggested Project Size
              <Badge variant="outline" className="text-[10px] uppercase bg-emerald-50 text-emerald-700 border-emerald-200">Recommendation</Badge>
            </span>
            <span className="text-xl font-bold tabular-nums text-emerald-700">{formatINR(suggestedProjectCost)}</span>
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-600 transition-all" style={{ width: `${suggestedProjectScale * 100}%` }} />
          </div>
          <p className="text-xs text-emerald-600/70 mt-1 text-right">Scaled to survive stress heuristic</p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Corresponding Loan Amounts</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Max Indicative Loan</div>
              <div className="font-semibold tabular-nums text-slate-800">{formatINR(maxIndicativeLoan)}</div>
            </div>
            <div>
              <div className="text-xs text-emerald-700 mb-1">Suggested Indicative Loan</div>
              <div className="font-semibold tabular-nums text-emerald-700">{formatINR(suggestedLoan)}</div>
            </div>
          </div>
        </div>
        
        {decision === 'MODIFY' && (
          <Alert className="bg-amber-50 border-amber-200">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 text-sm ml-2">
              You may fit within the maximum project structure, but a smaller initial project may reduce downside exposure.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
