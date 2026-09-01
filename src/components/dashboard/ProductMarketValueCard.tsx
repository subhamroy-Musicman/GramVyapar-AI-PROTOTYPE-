import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProductMarketValueCardProps {
  milkPrice: number;
  costPerLitreNormal: number;
  pricingPosition: string;
}

export function ProductMarketValueCard({
  milkPrice,
  costPerLitreNormal,
  pricingPosition
}: ProductMarketValueCardProps) {
  return (
    <Card className="border border-slate-200 shadow-sm">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-base text-slate-800">Product Market Value</CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Target Price <Badge variant="outline" className="ml-2 text-[10px]">Input</Badge></span>
          <span className="font-medium tabular-nums">₹{milkPrice}/L</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-600">Est. Operating Cost</span>
          <span className="font-medium tabular-nums">₹{costPerLitreNormal.toFixed(1)}/L</span>
        </div>
        <Separator className="bg-slate-100" />
        <div className="flex justify-between items-center text-sm pt-1">
          <span className="font-medium text-slate-800">Positioning</span>
          <Badge variant={pricingPosition === 'High Margin' ? 'default' : 'secondary'} className={pricingPosition === 'High Margin' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-100 text-slate-700'}>
            {pricingPosition}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
