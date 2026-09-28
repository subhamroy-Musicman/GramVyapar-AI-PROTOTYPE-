const fs = require('fs');
let s = fs.readFileSync('src/domain/stress-and-decision.test.ts', 'utf8');
s = s.replace(/dp.animalPurchaseCost = 1500000; /g, 'dp.animalPurchaseCost = 1500000; dp.milkYieldPerDay = 2000;'); 
fs.writeFileSync('src/domain/stress-and-decision.test.ts', s);
