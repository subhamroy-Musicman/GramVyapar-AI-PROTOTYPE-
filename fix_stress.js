const fs = require('fs');
let s = fs.readFileSync('src/domain/stress-and-decision.test.ts', 'utf8');
s = s.replace(/dp.animalPurchaseCost = 150000; /g, 'dp.animalPurchaseCost = 1500000; '); // 11 * 1.5M = 16.5M > 5M
fs.writeFileSync('src/domain/stress-and-decision.test.ts', s);
