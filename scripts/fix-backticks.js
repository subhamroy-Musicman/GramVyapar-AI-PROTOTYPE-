const fs = require('fs');
let content = fs.readFileSync('src/components/ResultsDashboard.tsx', 'utf8');
content = content.replace(
  'className={\\`text-[10px] uppercase font-semibold shadow-sm \\${isLimited ? \\'bg-slate-50 text-slate-600 border-slate-200\\' : \\'bg-emerald-50 text-emerald-700 border-emerald-200\\'}\\`}',
  'className={`text-[10px] uppercase font-semibold shadow-sm ${isLimited ? \\'bg-slate-50 text-slate-600 border-slate-200\\' : \\'bg-emerald-50 text-emerald-700 border-emerald-200\\'}`}'
);
fs.writeFileSync('src/components/ResultsDashboard.tsx', content);
console.log('Fixed backticks manually');
