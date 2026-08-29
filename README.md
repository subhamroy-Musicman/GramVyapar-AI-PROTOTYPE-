# GramVyapar AI Prototype

This is an internal hackathon prototype for a multilingual hyper-local business advisory and smart financial structuring tool targeted at rural micro-entrepreneurs.

## Purpose

The GramVyapar AI prototype demonstrates a seamless flow from gathering user financial capabilities and local demographic info to outputting a deterministic hyper-local feasibility report. It serves as a mock for a full production system.

## Implemented Features

1. **Clean Assessment Form**: Accepts basic inputs like geography, margin capital, proposed category, and dairy-specific details (herd size, yield, price, feed cost).
2. **Deterministic Financial Calculator**: Evaluates Project Cost and routes to either Micro Finance Scheme or Term Loan Scheme based on capital scale.
3. **Dairy Business Economics Engine**: Calculates potential revenue, total operating costs, surplus, and loan repayment capacity.
4. **Stress Testing**: Demonstrates financial resilience by modeling a scenario with -20% yield and +15% feed costs.
5. **Eligibility vs. Viability**: Compares theoretical max loan amount with a prototype recommendation for optimal capital deployment based on stress testing.
6. **Feasibility Dashboard**: Polished results view containing Final Decision, Market Reach, Opportunity Analysis, Competitor Mapping, Product Market Value (PMV), SWOT, and ranked Threats.

## Demo Assumptions

- Veterinary cost: ₹2000 per animal per year
- Labour cost: ₹6000 per animal per year
- Utility cost: ₹1000 per animal per year
- Transport cost: ₹5000 + (₹500 per animal per year)
- Other costs: ₹2000 per year

*All numbers are for prototype demonstration only.*

## Limitations

- **Not Production Ready**: Auth, database (Supabase), and robust API connectivity are omitted.
- **Rule-based & Deterministic**: The insights and logic are deterministic code rules, without actual LLM text generation to ensure speed and zero-hallucination predictability for the demo.
- **Dairy-Centric**: Only the "Dairy" category is fully wired to the business model; Retail and Textiles display "Limited Support" warnings.
- **Fake Local Context**: Real demographic, census, and market mappings are mocked via text hints. True integrations (Maps, APIs) are planned for phase 2.

## How to Run

1. `npm install`
2. `npm run dev`
3. Navigate to `http://localhost:3000`
4. Run tests with `npx vitest run`
