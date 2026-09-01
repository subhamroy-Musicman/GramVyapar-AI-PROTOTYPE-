# GramVyapar AI

**Decision support for rural micro-entrepreneurs before they take on business debt.**

GramVyapar AI is a prototype for evaluating whether a proposed rural micro-enterprise is financially viable, how much external funding it requires, and how the business behaves when operating conditions worsen.

The current MVP focuses on **dairy farming**.

> **Eligibility ≠ Viability**  
> Being able to borrow does not mean the business can safely sustain the debt.

---

## Why this project exists

A rural entrepreneur planning a small business may be able to find loan schemes, calculators, or general business information. The harder questions are usually left unanswered:

- How much will the business actually cost?
- How much should I contribute myself?
- How much financing do I need?
- Will the business generate enough cash after repayment?
- What happens if revenue falls or costs increase?
- Does the surrounding area provide useful signals for this type of business?

GramVyapar AI is being built around those questions.

The system separates **financial computation**, **risk evaluation**, **local evidence**, and **AI explanation** instead of asking a language model to make the entire decision.

---

## Current MVP

The current dairy assessment has four working stages.

### 01 — Entrepreneur Profile

Collects the context needed for the assessment:

- location
- occupation
- farming/livestock experience
- available capital
- existing financial commitments
- business intent

### 02 — Dairy Plan

Captures the proposed unit:

- number and type of animals
- purchase cost per animal
- expected milk yield
- milk selling price
- lactation days
- feed cost
- veterinary expenses
- labour
- utilities
- insurance
- transport
- shed/infrastructure
- equipment
- working capital
- other operating/setup costs

### 03 — Financial & Risk Analysis

Validated inputs are passed through the domain engines:

```text
Dairy Economics
      ↓
Project Cost
      ↓
Funding Gap
      ↓
Financing Route
      ↓
Repayment Model
      ↓
Stress Test
      ↓
Viability Decision
```

### 04 — Assessment Brief

The final screen presents:

- `PROCEED`, `MODIFY`, or `HIGH RISK`
- project cost
- own contribution
- funding requirement
- indicative financing route
- annual revenue and operating cost
- operating surplus
- repayment burden
- post-repayment cash
- downside stress results
- decision reasons and warnings

---

## MVP Preview

> Add final screenshots here before submission.

### Entrepreneur Profile

<!--
![Entrepreneur Profile](docs/screenshots/step-1-profile.png)
-->

### Dairy Plan

<!--
![Dairy Plan](docs/screenshots/step-2-dairy-plan.png)
-->

### Financial & Risk Analysis

<!--
![Financial Analysis](docs/screenshots/step-3-analysis.png)
-->

### Assessment Brief

<!--
![Assessment Brief](docs/screenshots/step-4-assessment.png)
-->

The Assessment Brief is the main output of the prototype: it connects financing with business viability instead of treating the financing amount as the final answer.

---

## How the assessment works

### Dairy economics

Annual milk production:

```text
animals × litres per animal per day × lactation days
```

Annual milk revenue:

```text
annual milk production × milk price per litre
```

Annual feed cost:

```text
animals × feed cost per animal per day × 365
```

Annual operating expenses include feed, veterinary expenses, labour, utilities, insurance, transport, and other operating costs.

```text
Operating Surplus
= Annual Revenue - Annual Operating Expenses
```

### Project cost

```text
Animal Purchase
+ Shed / Infrastructure
+ Equipment
+ Working Capital
+ Other Setup Costs
= Total Project Cost
```

Own contribution is capped at the project cost:

```text
Effective Own Contribution
= min(Available Capital, Project Cost)
```

The remaining requirement becomes:

```text
Funding Gap
= max(0, Project Cost - Own Contribution)
```

---

## Indicative financing routes

The MVP currently uses the following configurable prototype bands:

| Funding requirement | Route |
|---|---|
| ₹0 | Self Funded |
| Up to ₹1.5 lakh | Micro Loan |
| ₹1.5–5 lakh | Small Enterprise Finance |
| ₹5–10 lakh | Term Loan |
| Above ₹10 lakh | Outside Prototype Range |

These are **prototype routing assumptions**, not official scheme eligibility or loan approval rules.

The assumptions are kept in configuration rather than embedded inside UI components.

---

## Repayment model

The current prototype uses:

| Parameter | Assumption |
|---|---:|
| Interest | 8% p.a. |
| Tenure | 7 years |
| Moratorium | 6 months |
| Repayment | Quarterly |

For the current model, interest accrued during the moratorium is capitalized and the resulting principal is amortized over the remaining repayment period.

The engine calculates:

- quarterly repayment
- annual repayment burden
- total repayment
- total interest
- post-new-loan cash
- net cash after existing debt

These assumptions can be changed independently of the UI.

---

## Stress testing

A plan that works only under its best assumptions is not necessarily viable.

The current downside scenario is:

```text
Milk yield   -20%
Feed cost    +15%
```

The stress engine modifies the relevant assumptions and sends the stressed inputs back through the **same financial engine**.

It does not maintain a second copy of the financial formulas.

This allows the assessment to compare the base and stress cases for:

| Metric | Base | Stress |
|---|---|---|
| Revenue | Calculated | Recalculated |
| Operating cost | Calculated | Recalculated |
| Operating surplus | Calculated | Recalculated |
| Repayment burden | Calculated | Same loan terms |
| Post-repayment cash | Calculated | Recalculated |

The scenario is deliberately explicit so the user can see what was tested.

---

## Viability decision

The decision engine is deterministic.

It evaluates the financial and stress-test results in a fixed order and returns one of three states.

### `PROCEED`

The baseline economics are positive and the plan remains sufficiently resilient under the defined stress scenario.

### `MODIFY`

The business may work, but the current scale, financing requirement, debt load, or downside resilience needs attention.

### `HIGH RISK`

The baseline business or repayment position already shows significant financial pressure.

This separation matters because a business can fall within an indicative financing range while still failing the viability assessment.

```text
Eligible to borrow
        ≠
Able to sustain the borrowing
```

---

## Engineering approach

The application follows one rule throughout the financial pipeline:

> **AI explains. Deterministic logic decides.**

The UI does not calculate financial outcomes.

The stress layer does not duplicate the financial engine.

The decision layer does not depend on an LLM.

Instead:

```text
User Input
    │
    ▼
Zod Validation
    │
    ▼
Financial Engine
    │
    ▼
Stress Engine
    │
    ▼
Decision Engine
    │
    ▼
Assessment Result
```

The planned evidence and AI layers sit around this deterministic core rather than replacing it.

---

## Architecture

```text
┌──────────────────────────────┐
│      Entrepreneur Input      │
│       Text / Form UI         │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Input Validation       │
│             Zod              │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     Dairy Economics Engine   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Financial Structuring      │
│ Cost • Funding • Repayment   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│        Stress Engine         │
│ Yield -20% • Feed +15%       │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Decision Engine        │
│ PROCEED • MODIFY • HIGH RISK │
└──────────────┬───────────────┘
               │
        ┌──────┴───────┐
        │              │
        ▼              ▼
 Hyper-Local       Assessment
 Evidence          Brief / UI
        │
        └──────┬───────┘
               ▼
        AI Explanation
        & Multilingual
           Advisory
```

The bottom two layers are being integrated after the deterministic core.

---

## Hyper-local evidence

**Status: next development phase**

The location layer is intended to turn the entrepreneur's village/town into a set of traceable local signals.

Planned pipeline:

```text
Location
   ↓
Geocoding
   ↓
Coordinates
   ↓
5 km / 10 km Queries
   ↓
POI Classification
   ↓
Evidence Result
```

Initial data sources:

- OpenStreetMap / Nominatim
- OpenStreetMap / Overpass
- Open-Meteo

The evidence model is designed around three states:

```text
AVAILABLE
INSUFFICIENT
PROVIDER_UNAVAILABLE
```

This distinction is intentional.

For example, an OpenStreetMap query returning no dairy POIs does **not** prove that the area has no competitors. It only means the selected source did not provide sufficient mapped evidence.

Likewise, mapped marketplaces and shops are local activity signals, not direct measurements of consumer demand.

---

## AI advisory

**Status: planned after the evidence pipeline is stable**

The generative layer will receive structured outputs from the deterministic engines.

Its responsibilities are expected to include:

- explaining the assessment
- simplifying financial terminology
- explaining risks
- generating actionable next steps
- multilingual output
- follow-up Q&A

It will not be responsible for deciding financial viability.

```text
Financial Result
+ Stress Result
+ Decision Result
+ Local Evidence
        ↓
Structured Context
        ↓
LLM
        ↓
Human-readable Advisory
```

This keeps financial arithmetic reproducible even when the AI provider is unavailable.

---

## Multilingual and voice access

The product is being designed for eventual support of:

- English
- Hindi
- Bengali
- Marathi
- Tamil

The intended voice flow is:

```text
Speech
   ↓
Speech-to-Text
   ↓
Structured Input
   ↓
Validation
   ↓
Deterministic Assessment
   ↓
Localized Explanation
   ↓
Text-to-Speech
```

Financial values captured through speech must be shown back to the user for confirmation before calculation.

Voice is treated as an interface layer, not part of the financial decision engine.

---

## Tech stack

| Layer | Technology |
|---|---|
| Application | Next.js |
| UI | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Validation | Zod |
| Testing | Vitest |
| Geocoding | Nominatim *(integration phase)* |
| Local evidence | OpenStreetMap / Overpass *(integration phase)* |
| Environmental context | Open-Meteo *(integration phase)* |
| AI advisory | Gemini API *(planned integration)* |
| Deployment | Vercel |
| Version control | Git + GitHub |

No separate backend service is required for the current MVP. Server-side functionality can be handled through Next.js while the product remains at prototype scale.

---

## Project structure

The financial core is organized by domain rather than being placed inside page components.

```text
src/
├── app/
│
├── components/
│   ├── assessment/
│   ├── analysis/
│   └── dashboard/
│
├── config/
│   ├── finance.ts
│   └── stress.ts
│
├── domain/
│   ├── dairy/
│   │   ├── types.ts
│   │   └── economics.ts
│   │
│   ├── finance/
│   │   ├── types.ts
│   │   ├── project-cost.ts
│   │   ├── funding.ts
│   │   ├── financing.ts
│   │   ├── repayment.ts
│   │   └── financial-assessment.ts
│   │
│   ├── stress/
│   │   ├── types.ts
│   │   └── stress-engine.ts
│   │
│   └── decision/
│       ├── types.ts
│       └── decision-engine.ts
│
└── lib/
    ├── presentation/
    └── utils/
```

As new capabilities are added, external-data and AI integrations will remain separate from the financial domain.

---

## Design decisions

A few decisions are deliberate.

**Financial logic stays outside React components.**  
Components render results; they do not decide them.

**Stress testing reuses the financial engine.**  
There is one source of truth for financial formulas.

**Assumptions are centralized.**  
Interest rates, financing thresholds and stress scenarios are configuration, not scattered constants.

**Domain outputs must remain finite.**  
Tests protect the financial boundary from `NaN` and `Infinity`.

**The decision is deterministic.**  
Identical validated inputs should produce identical decisions.

**Missing evidence remains missing evidence.**  
The system should prefer `DATA UNAVAILABLE` over an unsupported local claim.

**External services should fail independently.**  
An AI, voice, weather, or mapping provider going down should not change the arithmetic of the financial assessment.

---

## Tests

The current automated test suite covers the core financial and decision pipeline, including:

- dairy economics
- project-cost calculation
- own contribution and funding gap
- financing boundaries
- quarterly repayment
- moratorium handling
- zero-interest handling
- outside-prototype financing
- finite-number guarantees
- stress transformations
- input immutability during stress testing
- unchanged repayment terms during the defined stress case
- deterministic decisions
- `PROCEED`
- `MODIFY`
- `HIGH RISK`
- existing-debt pressure
- stress-case failure
- eligible-but-not-viable cases

Run the development checks with:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

---

## Running locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

No external AI key is required to run the deterministic financial MVP.

When external providers are introduced, their credentials should be stored in local environment variables and never committed to the repository.

---

## Development status

| Capability | Status |
|---|---|
| Entrepreneur Profile | ✅ Working |
| Dairy Plan | ✅ Working |
| Input Validation | ✅ Working |
| Dairy Economics | ✅ Working |
| Project Cost & Funding | ✅ Working |
| Financing Routing | ✅ Working |
| Repayment Engine | ✅ Working |
| Stress Testing | ✅ Working |
| Deterministic Decision Engine | ✅ Working |
| Financial & Risk Analysis UI | ✅ Working |
| Assessment Brief | ✅ Working |
| Hyper-Local Evidence | 🚧 Next |
| AI Advisory | ⏳ Planned |
| Multilingual Advisory | ⏳ Planned |
| Voice Interface | ⏳ Planned |

This table reflects the repository's current implementation state rather than the intended final architecture.

---

## Roadmap

### Completed — deterministic assessment

```text
Entrepreneur Profile
        ↓
Dairy Plan
        ↓
Financial Engine
        ↓
Stress Engine
        ↓
Decision Engine
        ↓
Assessment Brief
```

### Next — hyper-local evidence

```text
Location
   ↓
Geocoding
   ↓
OSM / Overpass
   ↓
Local Signal Classification
   ↓
Evidence Confidence
```

### After that

```text
Structured Assessment
+ Local Evidence
        ↓
AI Explanation
        ↓
Multilingual / Voice Access
```

The dairy vertical will remain the focus until this complete path is stable.

---

## Scope

GramVyapar AI is currently a **decision-support prototype**, not a lending platform.

It does not provide:

- loan approval
- guaranteed scheme eligibility
- regulated financial advice
- guaranteed business outcomes
- verified market-demand forecasts

Results depend on entrepreneur-provided inputs, prototype financing assumptions, and the quality of any external evidence available.

The system is intended to make those assumptions visible rather than hide them.

---

## Future work

Once the dairy assessment is stable end-to-end, the same architecture can be extended to other rural micro-enterprise categories.

Potential additions include:

- verified government scheme information
- official market-price datasets
- stronger rural demographic and business datasets
- saved assessments
- entrepreneur accounts
- comparison between alternative business scales
- additional stress scenarios
- additional enterprise categories

These are future directions, not current MVP capabilities.

---

## The idea in one line

**GramVyapar AI helps a rural entrepreneur decide not only whether financing is available, but whether the proposed business can realistically sustain that financing before the debt is taken.**

---

## License

This repository currently contains a prototype developed for hackathon and academic evaluation.

Built by Team HackBlitz for SIH 2026
