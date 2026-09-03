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

# Hyper-Local Evidence Engine (Phase 5A)
- **Status**: Standalone tested engine complete. NOT yet integrated into Step 4.
- **Architecture**:
  - `src/domain/evidence/types.ts`: Defines `EvidenceResult`, `RadiusEvidence`, categories (`DIRECT_DAIRY_SIGNAL`, `POTENTIAL_SALES_CHANNEL`, `SUPPORT_INFRASTRUCTURE`), availability (`AVAILABLE`, `INSUFFICIENT`, `PROVIDER_UNAVAILABLE`), and confidence (`HIGH`, `MEDIUM`, `LOW`, `INSUFFICIENT`).
  - `src/config/evidence.ts`: Centralizes radii (5km/10km), query thresholds, and keyword matching.
  - `src/lib/data/geocoding.ts`: Resolves location via Nominatim.
  - `src/lib/data/osm.ts`: Fetches and normalizes raw OSM candidates via Overpass (shop, amenity tags).
  - `src/lib/geo/distance.ts`: Validates item radius using Haversine algorithm.
  - `src/lib/classification/poi.ts`: Deterministically classifies POIs (NO LLM involved).
  - `src/lib/data/evidence.ts`: Main orchestrator `buildEvidenceResult` evaluating confidence and availability.
- **Key Invariants**:
  - "Missing evidence" is characterized as `INSUFFICIENT` or `PROVIDER_UNAVAILABLE`, never falsely interpreted as "no competition".
  - Overpass 5km and 10km calls run independently; one failure does not erase the other radius's successes.
- **Diagnostic Command**: `npm run diagnose:evidence -- "<Village, District, State>"`

# Canonical Demo Fixture
- Defined in src/fixtures/demo-dairy-assessment.ts
- Project Cost: ?4,05,000
- Funding Gap: ?3,05,000
- Annual Revenue: ?7,56,000
- Operating Surplus: ?4,54,250
- Repayment Burden: ?63,058
- Post-Repayment Cash: ?3,91,192
- Stress Post-Repayment Cash: ?1,98,929
- Decision: PROCEED

# Phase 6A: Gemini Explainable Advisory Engine
- **Role**: Explanation only. Never recalculates financials, decisions, or evidence.
- **Authoritative layers**: FinancialAssessment, StressAssessment, DecisionResult, EvidenceResult.
- **Supported languages**: en, hi, bn, mr, ta.
- **Security**: GEMINI_API_KEY server-side only. Literal keys are strictly prohibited in the codebase.
- **Architecture**: Authoritative Assessment -> AdvisoryInput -> Gemini -> Zod -> AdvisoryResult.
- **Config**: Model: gemini-3.6-flash, Prompt: advisory-v1, Schema: advisory-v1.
- **Provider Failure Behavior**: Returns 503/429/500 safe errors without taking down the Step 4 deterministic components.
- **Grounding Rules**: Enforces strict avoidance of 'loan approved', 'no competition', 'high demand'. Uses structured schema validation.
- **Status**: Backend advisory generation complete. NO Step 4 UI integration yet.

# Phase 6B: Step 4 AI Advisory Integration
- **Role**: Explanation only. Never recalculates financials, decisions, or evidence.
- **Architecture**: AIAdvisory component loads independently *after* deterministic components finish. Terminal evidence state triggers the advisory fetch.
- **Supported languages**: en, hi, bn, mr, ta.
- **Language Selector**: Controls only the AI explanation. Evidence and deterministic calculations are NOT re-run on language change.
- **Failure Isolation**: If Gemini fails (500/503/timeout), AIAdvisory shows a local error boundary with a retry button. The deterministic dashboard (AssessmentBrief) remains 100% functional.
- **Protection**: AbortController prevents stale language responses. Assessment fingerprinting prevents stale assessments.
- **Visual Authority**: Decision banner remains primary. AI Advisory is styled distinctly as a secondary, explanatory layer.
- **Security**: No Gemini SDK or GEMINI_API_KEY is exposed in the client React code. All AI calls route safely through /api/advisory.

# Phase 7: Voice Accessibility
- **Current provider**: Browser Speech APIs
- **Architecture**: Provider-agnostic STT/TTS
- **Supported language codes**: en / hi / bn / mr / ta
- **Locale mapping**: en-IN / hi-IN / bn-IN / mr-IN / ta-IN
- **Voice input**: Speech -> transcript -> deterministic parser -> candidate -> confirmation -> existing validated form
- **Voice output**: Validated AdvisoryResult -> TTS
- **Safety**: Critical values require confirmation. Voice cannot make financial decisions. Gemini does not parse voice numbers. Typing always remains available. No automatic microphone. No audio storage added. No open-ended voice assistant. BHASHINI-ready architecture but BHASHINI NOT currently integrated.

## POST-FREEZE HOTFIX
- **AI Advisory TTS Navigation Bug**: Clicking 'Listen to Advisory' or 'Retry Advisory' triggered a form submission returning the user to Step 1. This happened because the buttons inside the 'AIAdvisory' component (rendered within 'Step4AssessmentBrief') lacked the explicit `type="button"` attribute, causing them to default to `type="submit"` inside the AssessmentShell form. The fix applied `type="button"` to these buttons, maintaining Step 4 context and isolating the action.

## POST-FREEZE TTS AVAILABILITY HOTFIX
- **TTS Voices Loading & Support**: Previously, the browser TTS support check and speech execution didn't wait for asynchronous `voiceschanged` events. This caused immediate errors or fallback failures in Chrome for languages like Bengali (bn-IN), leading to a misleading "Audio playback is unavailable" message. Fixed by implementing a robust ensureVoices() cache that awaits `voiceschanged`. The UI now differentiates between actual lack of API support, runtime playback errors, and cases where the system lacks a native voice for the selected language (gracefully falling back to the browser's default voice while showing a warning).
## PHASE 9 FULL SYSTEM AUDIT
- **Root Cause of Step-4 Reset**: Step 4 was previously wrapped in a <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>. In handleNext(), if step >= 4, it automatically invoked onComplete(), which triggered a window.location.reload(). This meant ANY unexpected submit behavior bubbling up on Step 4 (e.g. from an Enter key press in a stray input, or external plugin interference) would fatally reset the entire assessment session.
- **Fix**: Decoupled Step 4 from the automatic handleNext progression. In AssessmentShell.tsx, handleNext now strictly aborts if step >= 4. A dedicated, explicit "Start New Assessment" button was added directly to AssessmentBrief.tsx which calls onReset to trigger the page reload intentionally.
