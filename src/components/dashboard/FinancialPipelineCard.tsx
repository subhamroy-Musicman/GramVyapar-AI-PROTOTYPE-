import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown } from "lucide-react";
import { formatINR } from "@/lib/calculations";

interface FinancialPipelineCardProps {
  marginCapital: number;
  projectCost: number;
  maxIndicativeLoan: number;
  scheme: {
    name: string;
    inRange: boolean;
    interestRate: number;
    tenureYears: number;
    moratoriumMonths: number;
  };
}

export function FinancialPipelineCard({
  marginCapital,
  projectCost,
  maxIndicativeLoan,
  scheme
}: FinancialPipelineCardProps) {
  return (
    <Card className="border border-slate-200 shadow-sm bg-white">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg text-slate-800">Financial Eligibility Pipeline</CardTitle>
        <p className="text-sm text-slate-500 mt-1">Rule-based calculation flow</p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
          
          <div className="flex flex-col items-center text-center w-full md:w-1/4">
            <span className="text-2xl font-bold tabular-nums text-slate-800">{formatINR(marginCapital)}</span>
            <span className="text-sm text-slate-500 mt-1">Available Margin</span>
            <Badge variant="outline" className="mt-2 text-[10px] bg-slate-50">User Input</Badge>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-300 md:-rotate-90 shrink-0" />

          <div className="flex flex-col items-center text-center w-full md:w-1/4">
            <span className="text-2xl font-bold tabular-nums text-slate-800">{formatINR(projectCost)}</span>
            <span className="text-sm text-slate-500 mt-1">Feasible Project Cost</span>
            <Badge variant="outline" className="mt-2 text-[10px] bg-slate-50">Calculated</Badge>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-300 md:-rotate-90 shrink-0" />

          <div className="flex flex-col items-center text-center w-full md:w-1/4">
            <span className="text-2xl font-bold tabular-nums text-emerald-700">{formatINR(maxIndicativeLoan)}</span>
            <span className="text-sm text-slate-500 mt-1">Maximum Loan</span>
            <Badge variant="outline" className="mt-2 text-[10px] bg-slate-50">Calculated</Badge>
          </div>

          <ArrowDown className="w-5 h-5 text-slate-300 md:-rotate-90 shrink-0" />

          <div className="flex flex-col items-center text-center w-full md:w-1/4 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800">{scheme.name}</span>
            <span className="text-xs text-slate-500 mt-1">
              {scheme.inRange ? `${scheme.interestRate}% · ${scheme.tenureYears} yrs · ${scheme.moratoriumMonths}mo moratorium` : 'Outside Range'}
            </span>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
