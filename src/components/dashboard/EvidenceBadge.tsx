import { Badge } from "@/components/ui/badge";
import { EvidenceItem } from "@/types/evidence";

export const EvidenceBadge = ({ item }: { item?: EvidenceItem | null }) => {
  if (!item) {
    return (
      <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-500 border-slate-200 uppercase font-semibold">
        Data Unavailable
      </Badge>
    );
  }
  const isLimited = item.label.includes("No relevant mapped POIs") || item.value?.zone10 === 0 || item.value?.zone10?.count === 0;
  return (
    <div className="flex flex-col items-end gap-0.5">
      <Badge variant="outline" className={`text-[10px] uppercase font-semibold shadow-sm ${isLimited ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
        {isLimited ? 'Limited Evidence' : 'Live Evidence'}
      </Badge>
      <span className="text-[9px] text-slate-400 capitalize">
        {item.source} • {item.confidence} Conf.
      </span>
    </div>
  );
};
