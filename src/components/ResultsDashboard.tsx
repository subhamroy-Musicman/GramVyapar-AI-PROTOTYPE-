"use client";

import { z } from "zod";
import { formSchema } from "./AssessmentForm";
import { 
  calculateEconomics, 
  calculateProjectCost, 
  formatINR, 
  getSchemeDetails 
} from "@/lib/calculations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle2, TrendingDown, TrendingUp, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface ResultsDashboardProps {
  data: z.infer<typeof formSchema>;
  onReset: () => void;
}

export function ResultsDashboard({ data, onReset }: ResultsDashboardProps) {
  // 1. Core Calculations
  const projectCost = calculateProjectCost(data.marginCapital);
  const scheme = getSchemeDetails(projectCost);
  
  const normalEconomics = calculateEconomics(data, 1.0, 1.0);
  const stressEconomics = calculateEconomics(data, 0.8, 1.15); // 20% yield drop, 15% feed cost increase

  // Decision Logic
  let decision: "PROCEED" | "MODIFY" | "HIGH RISK" = "HIGH RISK";
  if (normalEconomics.postRepaymentSurplus > 0) {
    if (stressEconomics.postRepaymentSurplus > 0) {
      decision = "PROCEED";
    } else {
      decision = "MODIFY";
    }
  }

  // Cost per litre for PMV
  const costPerLitreNormal = normalEconomics.totalOperatingCost / normalEconomics.annualMilkProduction;
  const marginPerLitre = data.milkPrice - costPerLitreNormal;
  
  let pricingPosition = "Moderate";
  if (marginPerLitre > 15) pricingPosition = "High Margin";
  else if (marginPerLitre < 5) pricingPosition = "Low Margin";

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. Final Decision */}
      <Card className={`border-l-8 ${decision === 'PROCEED' ? 'border-l-green-600' : decision === 'MODIFY' ? 'border-l-amber-500' : 'border-l-red-600'}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardDescription className="uppercase tracking-wider font-semibold text-muted-foreground">GramVyapar AI Recommendation</CardDescription>
              <CardTitle className="text-4xl mt-2 flex items-center gap-3">
                {decision}
                {decision === 'PROCEED' && <CheckCircle2 className="w-8 h-8 text-green-600" />}
                {decision === 'MODIFY' && <AlertTriangle className="w-8 h-8 text-amber-500" />}
                {decision === 'HIGH RISK' && <TrendingDown className="w-8 h-8 text-red-600" />}
              </CardTitle>
            </div>
            <button onClick={onReset} className="text-sm text-primary hover:underline font-medium">
              Start New Assessment
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">
            {decision === 'PROCEED' && `You are financially eligible for a ${formatINR(scheme.maxLoan)} loan. The proposed dairy plan shows strong resilience even under stress scenarios. Proceed with the application.`}
            {decision === 'MODIFY' && `You are financially eligible for a ${formatINR(scheme.maxLoan)} loan under the ${scheme.name}, but the proposed dairy plan becomes vulnerable when milk yield falls and feed costs rise. Consider reducing the initial investment or herd size.`}
            {decision === 'HIGH RISK' && `The current financial structure is unsustainable. Operating surplus does not cover the required loan repayments for the proposed scale.`}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Financial Eligibility */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Eligibility</CardTitle>
            <CardDescription>Based on ₹{data.marginCapital.toLocaleString()} margin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Calculated Project Cost</span>
              <span className="font-semibold">{formatINR(projectCost)}</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Applicable Scheme</span>
                <Badge variant={scheme.isEligible ? "default" : "destructive"}>{scheme.name}</Badge>
              </div>
              {scheme.isEligible && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Loan Amount</span>
                    <span className="font-semibold">{formatINR(Math.min(projectCost * 0.90, scheme.maxLoan))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span className="font-semibold">{scheme.interestRate}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tenure</span>
                    <span className="font-semibold">{scheme.tenureYears} Years</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 3. Eligibility vs Viability */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle>Eligibility vs Viability</CardTitle>
            <CardDescription>Balancing capacity with realistic deployment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Maximum Funding Capacity</span>
              <span className="text-2xl font-bold">{formatINR(scheme.maxLoan)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground flex items-center gap-2">
                Recommended Initial Deployment 
                <Badge variant="outline" className="text-xs">Prototype Recommendation</Badge>
              </span>
              <span className="text-2xl font-bold text-primary">
                {decision === 'PROCEED' 
                  ? formatINR(Math.min(projectCost * 0.90, scheme.maxLoan))
                  : formatINR(Math.min(projectCost * 0.90, scheme.maxLoan) * 0.75)} 
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Maximum borrowing eligibility is not always the same as optimal capital deployment.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 4. Business Economics */}
        <Card>
          <CardHeader>
            <CardTitle>Business Economics</CardTitle>
            <CardDescription>Normal Case Scenario (Annual)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Revenue</span>
              <span className="font-medium text-green-700">{formatINR(normalEconomics.annualMilkRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operating Cost</span>
              <span className="font-medium text-red-700">{formatINR(normalEconomics.totalOperatingCost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Operating Surplus</span>
              <span className="font-bold">{formatINR(normalEconomics.annualOperatingSurplus)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Repayment Burden</span>
              <span className="font-medium text-amber-700">- {formatINR(normalEconomics.annualRepaymentBurden)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-muted-foreground">Post-Repayment Cash</span>
              <span className={`font-bold ${normalEconomics.postRepaymentSurplus > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatINR(normalEconomics.postRepaymentSurplus)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-4">
              <Info className="w-3 h-3" />
              Includes prototype assumptions for vet, labour, and utilities.
            </div>
          </CardContent>
        </Card>

        {/* 5. Stress Test */}
        <Card className="border-amber-200">
          <CardHeader className="bg-amber-50/50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-amber-600" />
              Stress Test Scenario
            </CardTitle>
            <CardDescription>Yield -20% & Feed Cost +15%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stress Revenue</span>
              <span className="font-medium">{formatINR(stressEconomics.annualMilkRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stress Operating Cost</span>
              <span className="font-medium">{formatINR(stressEconomics.totalOperatingCost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Stress Surplus</span>
              <span className="font-medium">{formatINR(stressEconomics.annualOperatingSurplus)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Repayment Burden</span>
              <span className="font-medium">- {formatINR(stressEconomics.annualRepaymentBurden)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-muted-foreground">Stress Cash Flow</span>
              <span className={`font-bold ${stressEconomics.postRepaymentSurplus > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatINR(stressEconomics.postRepaymentSurplus)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6, 7, 8: Local Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 6. Market Reach */}
        <Card>
          <CardHeader>
            <CardTitle>Market Reach</CardTitle>
            <CardDescription>{data.village}, {data.district}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">5 km Immediate</h4>
              <p className="text-sm text-muted-foreground">High penetration potential. Daily fresh delivery.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">10 km Extended</h4>
              <p className="text-sm text-muted-foreground">Bulk supply routes.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Likely Channels</h4>
              <ul className="text-sm text-muted-foreground list-disc pl-4 mt-1 space-y-1">
                <li>Households</li>
                <li>Tea Shops</li>
                <li>Sweet Shops</li>
                <li>Milk Collection Centres</li>
                <li>Local Retailers</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* 7. Opportunity Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Opportunity Analysis</CardTitle>
            <CardDescription>Tailored for {data.animalCount} herd size</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">Direct household milk delivery in {data.village} for premium pricing.</span>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">Consistent supply to district collection centres in {data.district}.</span>
              </li>
              <li className="flex gap-2 items-start">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="text-sm">Value-added dairy products (curd/paneer) in Phase 2 scaling.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* 8. Competitor Mapping & PMV */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Competitor Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="mb-2">Density: Not yet verified</Badge>
              <p className="text-sm text-muted-foreground mb-2">
                Live maps and local enterprise datasets will be integrated in the next phase.
              </p>
              <p className="text-xs text-muted-foreground border-t pt-2">
                <strong>Guide:</strong> Low competition indicates opportunity; high competition indicates established demand but price pressure.
              </p>
            </CardContent>
          </Card>
          
          {/* 9. Product Market Value */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Product Market Value</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target Price</span>
                <span className="font-medium">₹{data.milkPrice}/L</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Cost</span>
                <span className="font-medium">₹{costPerLitreNormal.toFixed(1)}/L</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t">
                <span className="text-muted-foreground">Position</span>
                <Badge variant={pricingPosition === 'High Margin' ? 'default' : 'secondary'}>{pricingPosition}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 10. SWOT & 11. Threats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SWOT Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-800 mb-2">Strengths</h4>
                <ul className="text-sm text-green-900 space-y-1 list-disc pl-4">
                  <li>{data.marginCapital >= 100000 ? "Solid initial capital" : "Accessible scale"}</li>
                  <li>Local knowledge of {data.state}</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-bold text-red-800 mb-2">Weaknesses</h4>
                <ul className="text-sm text-red-900 space-y-1 list-disc pl-4">
                  <li>{data.experienceLevel === 'beginner' ? "Limited operational experience" : "Scale constraints"}</li>
                  <li>Input dependency</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-bold text-blue-800 mb-2">Opportunities</h4>
                <ul className="text-sm text-blue-900 space-y-1 list-disc pl-4">
                  <li>Growing local demand</li>
                  <li>Institutional financing</li>
                </ul>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-bold text-amber-800 mb-2">Threats</h4>
                <ul className="text-sm text-amber-900 space-y-1 list-disc pl-4">
                  <li>Climate volatility</li>
                  <li>Market price fluctuations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk & Threat Identification</CardTitle>
            <CardDescription>Ranked risks for your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Feed Cost Volatility</span>
              <Badge variant="destructive">High Risk</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Seasonal Milk Yield Variation</span>
              <Badge variant="destructive">High Risk</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Buyer Dependency</span>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">Medium Risk</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Veterinary Accessibility</span>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">Medium Risk</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Working Capital Pressure</span>
              <Badge variant="outline">Low Risk</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 12. Prototype Disclaimer */}
      <Alert className="bg-muted">
        <Info className="h-4 w-4" />
        <AlertTitle>Prototype Disclaimer</AlertTitle>
        <AlertDescription>
          Prototype assessment based on user inputs and regional assumptions. Live demographic, market, competitor and pricing datasets will be integrated in the next phase.
        </AlertDescription>
      </Alert>
    </div>
  );
}
