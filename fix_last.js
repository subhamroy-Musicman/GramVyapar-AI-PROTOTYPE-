const fs = require('fs');

let c = fs.readFileSync('src/domain/financial-engine.test.ts', 'utf8');
c = c.replace(/SCHEMES.MICRO_FINANCE_SCHEME.annualInterestRate = 0;/g, 'SCHEMES.TERM_LOAN_SCHEME.annualInterestRate = 0;');
c = c.replace(/SCHEMES.MICRO_FINANCE_SCHEME.annualInterestRate = originalRate;/g, 'SCHEMES.TERM_LOAN_SCHEME.annualInterestRate = originalRate;');
c = c.replace(/const originalRate = SCHEMES.MICRO_FINANCE_SCHEME.annualInterestRate;/g, 'const originalRate = SCHEMES.TERM_LOAN_SCHEME.annualInterestRate;');
fs.writeFileSync('src/domain/financial-engine.test.ts', c);

let s = fs.readFileSync('src/domain/stress-and-decision.test.ts', 'utf8');
s = s.replace(/dp.animalPurchaseCost = 500000;/g, 'dp.animalPurchaseCost = 5000000;'); // 5m * 5 = 25m > 5m
fs.writeFileSync('src/domain/stress-and-decision.test.ts', s);
