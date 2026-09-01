/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingDown } from "lucide-react";
import { formatINR } from "@/lib/calculations";

interface BusinessEconomicsCardProps {
  normalEconomics: any;
  stressEconomics: any;
}

export function BusinessEconomicsCard({
  normalEconomics,
  stressEconomics
}: BusinessEconomicsCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Normal Case Economics */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-800">Business Economics</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Normal Case Scenario (Annual)</p>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Annual Revenue</span>
            <span className="font-medium tabular-nums text-slate-800">{formatINR(normalEconomics.annualMilkRevenue)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Annual Operating Cost</span>
            <span className="font-medium tabular-nums text-slate-800">{formatINR(normalEconomics.totalOperatingCost)}</span>
          </div>
          <Separator className="bg-slate-200" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-800">Operating Surplus</span>
            <span className="font-semibold tabular-nums text-slate-800">{formatINR(normalEconomics.annualOperatingSurplus)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Approx. Repayment Burden</span>
            <span className="font-medium tabular-nums text-slate-500">- {formatINR(normalEconomics.annualRepaymentBurden)}</span>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 mt-4 border border-emerald-100 flex justify-between items-center">
            <span className="font-semibold text-emerald-900">Post-Repayment Cash</span>
            <span className={`text-xl font-bold tabular-nums ${normalEconomics.postRepaymentSurplus > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatINR(normalEconomics.postRepaymentSurplus)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stress Case Economics */}
      <Card className="border border-amber-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-amber-50 border-b border-amber-100 pb-4">
          <CardTitle className="text-lg text-amber-900 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" /> Stress Test
          </CardTitle>
          <p className="text-sm text-amber-700 mt-1">Milk Yield -20% | Feed Cost +15%</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            <div className="p-6 bg-white space-y-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Normal Case</div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Revenue</div>
                <div className="font-medium tabular-nums text-slate-800">{formatINR(normalEconomics.annualMilkRevenue)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Operating Cost</div>
                <div className="font-medium tabular-nums text-slate-800">{formatINR(normalEconomics.totalOperatingCost)}</div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-medium text-slate-700 mb-1">Post-Repayment</div>
                <div className={`font-bold tabular-nums ${normalEconomics.postRepaymentSurplus > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatINR(normalEconomics.postRepaymentSurplus)}
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-amber-50/30 space-y-4 relative">
              <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-4">Stress Case</div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Revenue</div>
                <div className="font-medium tabular-nums text-slate-800">{formatINR(stressEconomics.annualMilkRevenue)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Operating Cost</div>
                <div className="font-medium tabular-nums text-slate-800">{formatINR(stressEconomics.totalOperatingCost)}</div>
              </div>
              <div className="pt-2 border-t border-amber-100">
                <div className="text-xs font-medium text-slate-700 mb-1">Post-Repayment</div>
                <div className={`font-bold tabular-nums ${stressEconomics.postRepaymentSurplus > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatINR(stressEconomics.postRepaymentSurplus)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

