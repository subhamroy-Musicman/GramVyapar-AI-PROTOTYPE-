const fs = require('fs');
let content = fs.readFileSync('src/components/ResultsDashboard.tsx', 'utf8');

// The first two steps (imports and state) were already done cleanly via regex!
// Wait, no! The script earlier failed to run `replace_file_content` effectively, wait, I used `replace_file_content` and it passed.
// I will just do the F, G, I cards.
const fStart = content.indexOf('{/* F. Market Reach */}');
const gStart = content.indexOf('{/* G. Opportunity Analysis */}');
if (fStart === -1 || gStart === -1) throw new Error("F or G missing");

const marketReachCard = `        {/* F. Market Reach */}
        <Card className="border border-slate-200 shadow-sm flex flex-col h-full">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base text-slate-800">Market Reach</CardTitle>
              <p className="text-xs text-slate-500 mt-1">{data.village}, {data.district}</p>
            </div>
            <EvidenceBadge item={evidence?.marketReach} />
          </CardHeader>
          <CardContent className="p-5 flex-1">
            {evidenceLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
            ) : evidence?.marketReach ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">5 KM</h4>
                    <p className="text-2xl font-black text-slate-800">{evidence.marketReach.value.zone5.count}</p>
                    <p className="text-xs font-medium text-slate-500">Signal: {evidence.marketReach.value.zone5.signal}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">10 KM</h4>
                    <p className="text-2xl font-black text-slate-800">{evidence.marketReach.value.zone10.count}</p>
                    <p className="text-xs font-medium text-slate-500">Signal: {evidence.marketReach.value.zone10.signal}</p>
                  </div>
                </div>
                <Separator className="bg-slate-100" />
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-3">Likely Channels</h4>
                  <div className="flex flex-wrap gap-2">
                    {evidence.marketReach.value.channels.length > 0 ? evidence.marketReach.value.channels.map((channel) => (
                      <Badge key={channel} variant="secondary" className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium">{channel}</Badge>
                    )) : (
                      <span className="text-sm text-slate-400">Insufficient mapped channels</span>
                    )}
                  </div>
                </div>
                {evidence.marketReach.value.samples && evidence.marketReach.value.samples.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">View Evidence</p>
                    <ul className="text-xs text-slate-500 space-y-1.5">
                      {evidence.marketReach.value.samples.map((s, idx) => (
                        <li key={idx} className="flex justify-between border-b border-slate-50 pb-1 last:border-0"><span className="font-medium text-slate-700 truncate pr-2">{s.name}</span> <span>{s.distanceKm.toFixed(1)} km</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-slate-400 italic mt-2">Mapped activity is used as a local market proxy in this prototype.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-800">5 km Immediate</h4>
                  <p className="text-sm text-slate-500">High penetration potential. Daily fresh delivery.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-800">10 km Extended</h4>
                  <p className="text-sm text-slate-500">Bulk supply routes.</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-800 mb-1">Likely Channels</h4>
                  <ul className="text-sm text-slate-500 list-disc pl-4 mt-1 space-y-1">
                    <li>Households</li>
                    <li>Tea Shops</li>
                    <li>Sweet Shops</li>
                    <li>Milk Collection Centres</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

`;
content = content.substring(0, fStart) + marketReachCard + content.substring(gStart);


// Opportunity
const gNewStart = content.indexOf('{/* G. Opportunity Analysis */}');
const hStart = content.indexOf('{/* H. Product Market Value */}');
if (gNewStart === -1 || hStart === -1) throw new Error("G or H missing");

const oppCard = `        {/* G. Opportunity Analysis */}
        <Card className="border border-slate-200 shadow-sm flex flex-col h-full">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base text-slate-800">Opportunity Analysis</CardTitle>
              <CardDescription className="mt-1">Tailored for {data.animalCount} herd size</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200 uppercase font-semibold">Prototype</Badge>
          </CardHeader>
          <CardContent className="p-5 flex-1">
            <ul className="space-y-4">
              <li className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600"><strong className="text-slate-800">Direct Delivery:</strong> Explore direct household delivery as a potential higher-margin channel; local willingness-to-pay is not yet independently verified.</span>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600"><strong className="text-slate-800">Bulk Supply Routes:</strong> Explore collection/cooperative channels where mapped or locally verified.</span>
              </li>
              <li className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-600"><strong className="text-slate-800">Value-Added Products:</strong> Future Phase 2 scaling via curd and paneer manufacturing.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

`;
content = content.substring(0, gNewStart) + oppCard + content.substring(hStart);

// Competitor (which is I)
const iStart = content.indexOf('{/* I. Competitor Mapping */}');
const jStart = content.indexOf('{/* J & K: SWOT & Threats */}');
if (iStart === -1 || jStart === -1) throw new Error("I or J missing");

const compCard = `        {/* I. Competitor Mapping */}
        <Card className="border border-slate-200 shadow-sm flex flex-col h-full">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4 flex flex-row items-start justify-between">
            <CardTitle className="text-base text-slate-800">Competitor Mapping</CardTitle>
            <EvidenceBadge item={evidence?.competitorSignal} />
          </CardHeader>
          <CardContent className="p-5 flex-1 space-y-5">
            {evidenceLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...</div>
            ) : evidence?.competitorSignal ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">5 KM</h4>
                    <p className="text-2xl font-black text-slate-800">{evidence.competitorSignal.value.zone5}</p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase">Mapped Dairy POIs</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">10 KM</h4>
                    <p className="text-2xl font-black text-slate-800">{evidence.competitorSignal.value.zone10}</p>
                    <p className="text-[10px] font-medium text-slate-500 uppercase">Mapped Dairy POIs</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">{evidence.competitorSignal.value.signal}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {evidence.competitorSignal.value.guidance}
                  </p>
                </div>
                {evidence.competitorSignal.value.samples && evidence.competitorSignal.value.samples.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-4">View Evidence</p>
                    <ul className="text-xs text-slate-500 space-y-1.5">
                      {evidence.competitorSignal.value.samples.map((s, idx) => (
                        <li key={idx} className="flex justify-between border-b border-slate-50 pb-1 last:border-0"><span className="font-medium text-slate-700 truncate pr-2">{s.name}</span> <span>{s.distanceKm.toFixed(1)} km</span></li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-[11px] text-slate-400 italic">
                  {evidence.competitorSignal.caveat}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Live density maps and local enterprise datasets are currently unavailable.
                </p>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mb-1">Guidance</h4> 
                  <p className="text-sm text-slate-500">Low competition indicates opportunity; high competition indicates established demand but potential price pressure.</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

`;
content = content.substring(0, iStart) + compCard + content.substring(jStart);

fs.writeFileSync('src/components/ResultsDashboard.tsx', content);
console.log('Cards successfully injected!');
