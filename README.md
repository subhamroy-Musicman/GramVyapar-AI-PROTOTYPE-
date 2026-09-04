# GramVyapar AI

Hyper-local business advisory and financial structuring for rural micro-entrepreneurs.

<p align="center">
  <img src="./public/gramvyapar-logo.jpg" width="180" alt="GramVyapar AI Logo" />
</p>

GramVyapar AI helps a rural entrepreneur evaluate whether a proposed business is locally viable, understand the capital required, structure the likely financing requirement, evaluate repayment burden, and test the plan against adverse conditions before taking on debt.

Core principle:
**Eligibility ≠ Viability**

And:
**AI explains. Deterministic logic decides.**

---

## The Problem

Rural micro-entrepreneurs often have access to financing information but lack a structured way to determine:
- whether the proposed business makes sense locally
- how much they should invest
- how much they need to borrow
- whether cash flow can sustain repayments
- how the business behaves under adverse conditions
- how reliable the available local evidence actually is

---

## The Solution

GramVyapar AI is an evidence-first decision-support system. The workflow is divided into four steps:
1. **Entrepreneur Profile**
2. **Dairy Plan**
3. **Financial & Risk Analysis**
4. **Assessment Brief**

Behind the scenes, the architecture processes inputs through:
**Financial Engine → Stress Engine → Decision Engine → Hyper-Local Evidence → AI Explainable Advisory → Multilingual Voice**

---

## Implemented Features

### 1. Deterministic Financial Structuring
The application calculates:
- annual milk production
- annual milk revenue
- operating expenses
- operating surplus
- project cost
- own contribution
- funding gap
- indicative financing route
- repayment calculation
- post-repayment cash flow
- existing-debt consideration

**Financial calculations are deterministic TypeScript logic. The LLM does NOT calculate financial viability.**

### 2. Financing Routing
The system determines indicative financing routes (prototype financing categories) based on the calculated funding gap:
- ₹0 funding gap → `SELF_FUNDED`
- Up to ₹1.5 lakh → `MICRO_LOAN`
- Above ₹1.5 lakh and up to ₹5 lakh → `SMALL_ENTERPRISE_FINANCE`
- Above ₹5 lakh and up to ₹10 lakh → `TERM_LOAN`
- Above ₹10 lakh → `OUTSIDE_PROTOTYPE_RANGE`

*(Note: These are prototype financing categories, not official scheme eligibility.)*

### 3. Repayment Assumptions
The engine uses configured prototype assumptions:
- 8% annual interest
- 7-year total horizon
- 6-month moratorium
- quarterly repayment
- moratorium interest capitalization
- remaining repayment period handled deterministically

### 4. Stress Testing
The system re-evaluates the business under an adverse scenario while keeping financing terms unchanged:
- milk yield: -20%
- feed cost: +15%

### 5. Decision Engine
The deterministic decision engine outputs one of three decisions:
- `PROCEED`
- `MODIFY`
- `HIGH_RISK`

The decision is based on operating surplus, post-repayment cash, existing debt impact, stress-test survivability, prototype financing range, and configured safety/buffer rules. Gemini does not decide the recommendation.

### 6. Hyper-Local Evidence
Location inputs are verified via server-side geocoding against 5km and 10km radii for dairy-related mapped signals, sales channels, and support infrastructure.

Sources currently implemented:
- OpenStreetMap / Nominatim
- OpenStreetMap / Overpass
- Open-Meteo

*Note: OpenStreetMap signals represent observable mapped local activity. They do not directly measure consumer demand. A zero mapped result does not mean zero competition or zero demand.*

**Location Fallback:**
Location resolution supports progressive fallback: `locality + district + state → locality + state → district + state → state`. The UI exposes location precision rather than pretending district-level evidence is village-level evidence.

**Evidence Failure Handling:**
Missing evidence is surfaced transparently (`AVAILABLE`, `LIMITED`, `DATA UNAVAILABLE`) and never converted into a positive business conclusion.

### 7. AI Explainable Advisory
Gemini receives the STRUCTURED results produced by the deterministic engines and evidence services.

Gemini is used for:
- explanation
- contextual advisory
- risk communication
- actionable recommendations
- multilingual output

Gemini is NOT the authority for financial arithmetic, repayment calculation, financing routing, stress calculations, or the deterministic decision status.

### 8. Multilingual Support
Supported advisory languages:
- English (`en`)
- Hindi (`hi`)
- Bengali (`bn`)
- Marathi (`mr`)
- Tamil (`ta`)

Dynamic advisory content is generated in the selected language.

### 9. Voice Architecture
**Speech-to-Text (STT):**
Browser Web Speech API / browser speech-recognition layer for supported voice input. Critical financial values require explicit confirmation before form mutation. Voice recognition never silently changes a critical financial value.

**Text-to-Speech (TTS):**
- **Primary:** Gemini server-side TTS
- **Fallback:** Browser SpeechSynthesis
- **Final Fallback:** Text

Supported locales: `en-IN`, `hi-IN`, `bn-IN`, `mr-IN`, `ta-IN`.
*(Note: TTS model/provider availability and quota may vary. Voice availability is not guaranteed.)*

### 10. Failure Resilience
Independent subsystems fail safely:
- If Gemini Advisory fails, deterministic financial/decision results remain available.
- If TTS fails, browser speech or text remains available.
- If the evidence provider fails, financial analysis still works and evidence is marked unavailable.
- If weather fails, market evidence is not overwritten.

---

## Tech Stack
- **Frontend / Full Stack**: Next.js, React, TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Validation**: Zod
- **AI**: Google Gemini API
- **Voice**: Gemini TTS, Browser Web Speech APIs
- **Location / Evidence**: OpenStreetMap, Nominatim, Overpass, Open-Meteo
- **Testing**: Vitest
- **Deployment**: Vercel
- **Version Control**: Git / GitHub

---

## Architecture

```text
User
 │
 ▼
Next.js Application
 │
 ├── Entrepreneur / Dairy Inputs
 │
 ▼
Deterministic Financial Engine
 │
 ▼
Stress Engine
 │
 ▼
Decision Engine
 │
 ├─────────────────────────────┐
 │                             │
 ▼                             ▼
Hyper-Local Evidence       Structured Result
 │                             │
 └──────────────┬──────────────┘
                ▼
         Gemini Advisory
                │
                ▼
       Multilingual Output
                │
        ┌───────┴─────────┐
        ▼                 ▼
    Gemini TTS       Browser TTS
        │                 │
        └───────┬─────────┘
                ▼
              User
```

---

## Project Structure

```text
src/
  app/
  components/
  config/
  domain/
    dairy/
    finance/
    stress/
    decision/
    voice/
  lib/
    advisory/
    data/
    geo/
    voice/
```

---

## Local Development

1. Clone the repository and install dependencies:
```bash
git clone <repository>
cd <project>
npm install
```

2. Create a `.env.local` file in the root directory and add your key:
```env
GEMINI_API_KEY=your_key_here
```

3. Start the development server:
```bash
npm run dev
```

### Security Note
`GEMINI_API_KEY` is server-side only. It must never use `NEXT_PUBLIC_GEMINI_API_KEY`. Never expose real API keys in examples, screenshots, logs, commits, or README.

---

## Testing

The application includes an extensive deterministic test suite for financial logic, validation, stress boundaries, evidence, and advisory pipelines.

```bash
npm run test
npm run typecheck
npm run build
```
*(Currently 74 tests passing on the release candidate.)*

---

## Current MVP Scope

Current business vertical: **Dairy**

The architecture is designed to support future business categories, but the current implemented and validated MVP focuses on dairy.

---

## Disclaimer

GramVyapar AI is a hackathon decision-support prototype. Its financing categories and repayment assumptions are indicative prototype logic and should not be treated as official loan approval, professional financial advice, or guaranteed business outcomes.

---

Made by Team HackBlitz for SIH 2026
