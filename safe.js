const fs = require('fs');
let c = fs.readFileSync('src/domain/financial-engine.test.ts', 'utf8');
c = c.replace(/    it\("14\. fundingGap = 0 -> SELF_FUNDED", \(\) => \{\s+expect\(route\(0\)\.category\)\.toBe\("SELF_FUNDED"\);\s+\}\);[\s\S]*?it\("20\. fundingGap = 1000001 -> OUTSIDE_PROTOTYPE_RANGE", \(\) => \{\s+expect\(route\(1000001\)\.category\)\.toBe\("OUTSIDE_PROTOTYPE_RANGE"\);\s+\}\);/g,
    it("14. projectCost = 0 -> MICRO_FINANCE_SCHEME (edge case)", () => {
      expect(route(0).category).toBe("MICRO_FINANCE_SCHEME");
    });
    it("15. projectCost = 140000 -> MICRO_FINANCE_SCHEME", () => {
      expect(route(140000).category).toBe("MICRO_FINANCE_SCHEME");
      expect(route(140000).schemeMaximumLoan).toBe(125000);
    });
    it("16. projectCost = 140001 -> TERM_LOAN_SCHEME", () => {
      expect(route(140001).category).toBe("TERM_LOAN_SCHEME");
    });
    it("17. projectCost = 5000000 -> TERM_LOAN_SCHEME", () => {
      expect(route(5000000).category).toBe("TERM_LOAN_SCHEME");
      expect(route(5000000).schemeMaximumLoan).toBe(4500000);
    });
    it("18. projectCost = 5000001 -> OUTSIDE_SUPPORTED_SCHEME_RANGE", () => {
      expect(route(5000001).category).toBe("OUTSIDE_SUPPORTED_SCHEME_RANGE");
    }););
c = c.replace(/import \{ FINANCE_CONFIG \} from "\.\.\/config\/finance";/, 'import { SCHEMES, FINANCE_CONFIG } from "../config/finance";');
c = c.replace(/const originalRate = FINANCE_CONFIG\.annualInterestRate;/g, 'const originalRate = SCHEMES.MICRO_FINANCE_SCHEME.annualInterestRate;');
c = c.replace(/FINANCE_CONFIG\.annualInterestRate = 0;/g, 'SCHEMES.MICRO_FINANCE_SCHEME.annualInterestRate = 0;');
c = c.replace(/FINANCE_CONFIG\.annualInterestRate = originalRate;/g, 'SCHEMES.MICRO_FINANCE_SCHEME.annualInterestRate = originalRate;');
c = c.replace(/"SMALL_ENTERPRISE_FINANCE"/g, '"TERM_LOAN_SCHEME"');
c = c.replace(/"OUTSIDE_PROTOTYPE_RANGE"/g, '"OUTSIDE_SUPPORTED_SCHEME_RANGE"');
fs.writeFileSync('src/domain/financial-engine.test.ts', c);
