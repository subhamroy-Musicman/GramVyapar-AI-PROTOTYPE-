const fs = require('fs');
let c = fs.readFileSync('src/domain/financial-engine.test.ts', 'utf8');
c = c.replace(/const rep = getRepay\(100000\);/g, 'const rep = getRepay(200000); // 200k routes to TERM_LOAN_SCHEME');
c = c.replace(/expect\(rep\.capitalizedPrincipal\)\.toBe\(104000\);/g, 'expect(rep.capitalizedPrincipal).toBe(208000);');
c = c.replace(/const expectedPmt = \(104000 \* 0\.02 \* factor\) \/ \(factor - 1\);/g, 'const expectedPmt = (208000 * 0.02 * factor) / (factor - 1);');
c = c.replace(/expect\(rep\.capitalizedPrincipal\)\.toBe\(100000\);/g, 'expect(rep.capitalizedPrincipal).toBe(200000);');
c = c.replace(/expect\(rep\.paymentPerQuarter\)\.toBe\(100000 \/ 26\);/g, 'expect(rep.paymentPerQuarter).toBe(200000 / 26);');
c = c.replace(/expect\(rep\.totalRepayment\)\.toBe\(100000\);/g, 'expect(rep.totalRepayment).toBe(200000);');
c = c.replace(/dp\.animalPurchaseCost = 150000;/g, 'dp.animalPurchaseCost = 500000;'); // 11 * 500k = 5.5m > 5m
c = c.replace(/expect\(result\.project\.animalPurchaseTotal\)\.toBe\(1650000\);/g, 'expect(result.project.animalPurchaseTotal).toBe(5500000);');
c = c.replace(/expect\(result\.funding\.fundingGap\)\.toBeGreaterThan\(1000000\);/g, 'expect(result.funding.fundingGap).toBeGreaterThan(5000000);');
fs.writeFileSync('src/domain/financial-engine.test.ts', c);

let s = fs.readFileSync('src/domain/stress-and-decision.test.ts', 'utf8');
s = s.replace(/\x22TERM_LOAN\x22/g, '\x22TERM_LOAN_SCHEME\x22');
s = s.replace(/\x22OUTSIDE_PROTOTYPE_RANGE\x22/g, '\x22OUTSIDE_SUPPORTED_SCHEME_RANGE\x22');
s = s.replace(/dp\.animalPurchaseCost = 100000;/g, 'dp.animalPurchaseCost = 500000;'); // Force outside range for Case E
fs.writeFileSync('src/domain/stress-and-decision.test.ts', s);
