# Project Purpose
GramVyapar AI is a hyper-local business advisory and financial structuring assistant designed for rural micro-entrepreneurs. 
The MVP focuses on the **Dairy Farming** vertical for a hackathon prototype, providing users with actionable insights regarding business viability, financing needs, and resilience against stress scenarios.

# Core Product Principle
"Eligibility ≠ Viability"
"AI explains. Deterministic logic decides."

# High-Level Architecture
- **Frontend**: Next.js App Router, React 19, Tailwind CSS, Shadcn UI.
- **Domain Layer**: Pure TypeScript functions containing deterministic business logic, decoupled from React.
- **Server/API Layer**: Next.js API Routes / Server Actions for AI, Evidence, and Geocoding.
- **AI Advisory**: Gemini-powered explanation layer.
- **External Providers**: Nominatim (Geocoding), OpenStreetMap/Overpass (POI Evidence), Open-Meteo (Weather), Gemini (LLM).

# Folder Responsibilities
- `src/app`: Next.js pages and API routes.
- `src/components`: React components divided by feature (e.g. layout, assessment, shared).
- `src/domain`: Framework-agnostic business logic (dairy economics, finance, stress, decision).
- `src/lib`: Integrations (AI, OSM, i18n) and utilities.
- `src/config`: System assumptions (finance rules, stress scenarios).
- `src/types`: Shared TypeScript definitions.
- `scripts`: Developer utilities.

# Technology Stack
- Next.js 16.3.3
- React 19.2.8
- Tailwind CSS v4
- Shadcn UI (Base UI)
- Zod (Validation)
- Vitest (Testing)
- Google GenAI SDK

# Dependency Graph
- UI Components depend on Domain results.
- Domain logic depends on nothing but standard TypeScript/JavaScript math and logic.
- API layer depends on external providers and returns structured JSON to the client.

# Execution Flow
1. User enters data in `AssessmentShell`.
2. Zod validates the input.
3. Deterministic Domain functions calculate Project Cost, Economics, and Financing.
4. Stress Engine evaluates adverse scenarios.
5. Decision Engine evaluates outcomes to PROCEED, MODIFY, or mark as HIGH_RISK.
6. Frontend concurrently calls Server Actions/APIs for Hyper-local evidence (OSM) and AI explanation (Gemini).
7. Results are displayed on the `ResultsDashboard`.

# Assessment Lifecycle
Entrepreneur Input → Validation → Dairy Economics → Financial Structuring → Hyper-Local Evidence → Stress Test → Decision Engine → AI Explanation → Multilingual/Voice Output

# API Contracts
- `POST /api/advisory`
  - Input: Business context, calculated decision, financial results, stress test results, local evidence, language.
  - Output: AI-generated advisory structured object (summary, whyThisDecision, recommendedActions, etc.).
- External APIs (OSM/Overpass, Nominatim, Open-Meteo) are abstracted behind server functions.

# Key Algorithms & Business Logic
- **Economics**: Revenue = Animals × Yield × Lactation Days × Price. Cost = Feed + Vet + Labour + Utilities + Insurance + Transport.
- **Funding Gap**: Project Cost - Own Contribution.
- **Decision Engine**: 
  - PROCEED: Healthy base and stress case.
  - MODIFY: Healthy base, weak stress case.
  - HIGH_RISK: Unsustainable base.

# Configuration
Configurations should live in `src/config/*.ts` files to prevent magic constants in code.
- `finance.ts`: Loan schemes, interest rates, tenures.
- `stress.ts`: Yield drops, cost increases.
- `evidence.ts`: Radius logic.

# Environment Variables
- `GEMINI_API_KEY`: Required for AI advisory. Server-only.

# Coding Standards
- Strict TypeScript enabled.
- React components must be < 200-250 lines.
- No business logic inside React (`ResultsDashboard` must delegate to `domain`).
- Use pure functions for calculations.

# Naming Conventions
- Components: PascalCase
- Functions/Vars: camelCase
- Types/Interfaces: PascalCase
- Folders: kebab-case

# Error Handling
- Use Zod at input boundaries.
- External API calls use try/catch with fallback "Unavailable" states, preserving the deterministic calculation pipeline.

# Security Practices
- API Keys stored in `.env.local` and accessed server-side only.
- Validation of all user inputs before processing.

# Performance Considerations
- Parallelize external API calls (OSM, Weather) after location is resolved.
- Client-side caching of heavy computations only when necessary.

# Testing Strategy
- Unit tests for domain logic (Vitest).
- Fixtures mapping healthy, modify, and high-risk scenarios.

# CI / Quality Gate
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

# Known Limitations
- Current MVP supports **Dairy Farming only**.
- Geocoding and OSM results can be slow or inaccurate in rural areas.
- Voice provider is limited to browser Web Speech API for prototype.

# Financial Domain Engine
- **Ownership**: src/domain/finance/* and src/domain/dairy/*. Pure TypeScript functions.
- **Gemini Authority**: Gemini has NO authority over financial calculations.
- **Formulas**:
  - nnualMilkProduction = animalCount * milkYieldPerDay * lactationDays
  - nnualMilkRevenue = annualMilkProduction * milkPrice
  - nnualOperatingExpenses = feed (365 days) + vet (annual) + labour (* 12) + utilities (* 12) + insurance + transport (* 12) + other
  - operatingSurplus = annualMilkRevenue - annualOperatingExpenses
  - projectCost = animalPurchaseTotal + shedCost + equipmentCost + workingCapital + otherSetupCost
  - effectiveOwnContribution = min(availableCapital, projectCost)
  - undingGap = max(0, projectCost - effectiveOwnContribution)
- **Financing Routing thresholds**:
  - <= 150000: MICRO_LOAN
  - <= 500000: SMALL_ENTERPRISE_FINANCE
  - <= 1000000: TERM_LOAN
  - > 1000000: OUTSIDE_PROTOTYPE_RANGE
- **Moratorium Interpretation**: 6 months. Principal is capitalized using interest accrued during this period: P * (1 + annualRate * 0.5). Tenures are reduced by 6 months for the active repayment phase.
- **Quarterly Repayment**: Amortizing formula using periodsPerYear = 4. PMT = (P * r * (1+r)^n) / ((1+r)^n - 1) where r is quarterly rate.
- **Existing Debt**: existingDebt input is multiplied by 12 and subtracted from post-loan cash flow to get 
etCashAfterExistingDebt.

# Stress & Decision Engine
- **Stress Config**: PRIMARY_DOWNSIDE configures -20% milk yield and +15% feed cost.
- **Stress Architecture**: calculateStressAssessment clones base inputs, safely mutates metrics, and recursively calls calculateFinancialAssessment to perfectly reuse pure pipeline.
- **Invariants**: Stressed loan repayment equals base loan repayment since loan terms do not change during operating stress.
- **Eligibility != Viability**: Decision engine treats business economics as primary. A project routed to standard financing can still trigger HIGH_RISK if post-repayment cash is negative. A strong project with financing gap > 10L will route to OUTSIDE_PROTOTYPE_RANGE but trigger MODIFY rather than crash or block.
- **Decision Config**: minimumStressCashBuffer = 10000. Used to evaluate STRESS_RESILIENCE_THIN.
- **Gemini Cannot Override**: The structured result outputs status, easonCodes, warnings, and keyFactors which Gemini will merely explain, not invent.

# Claim Safety
- Financing routing is strictly **indicative/prototype only**. It is NOT official loan eligibility, guarantee, or approval.

# Decision Engine
- **DecisionStatus meanings**: PROCEED (safe), MODIFY (base safe but stress weak or outside range), HIGH_RISK (base unsafe).
- **Rule order**: HIGH_RISK -> MODIFY -> PROCEED.
- **Reason Codes**: BASE_OPERATING_SURPLUS_NEGATIVE, BASE_POST_REPAYMENT_CASH_NEGATIVE, EXISTING_DEBT_PRESSURE, STRESS_POST_REPAYMENT_CASH_NEGATIVE, STRESS_EXISTING_DEBT_PRESSURE, STRESS_RESILIENCE_THIN, FINANCING_OUTSIDE_PROTOTYPE_RANGE, STRONG_BASE_ECONOMICS, STRESS_CASE_REMAINS_POSITIVE.
- **Outside-prototype**: FINANCING_OUTSIDE_PROTOTYPE_RANGE returns MODIFY if economics are strong.
- **Gemini Cannot Override**: Gemini cannot override the deterministic status.

# Presentation Layer (Step 3 & 4)
- Replaced developer inspector with production-grade step 3 (Analysis Preview) and step 4 (Assessment Brief) using existing deterministic engines.
- Maintained existing styling, removed generic dashboard components.
- Ensured Eligibility ? Viability is explicitly highlighted.
