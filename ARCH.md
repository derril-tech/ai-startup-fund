# Architecture — AI STARTUP FUND (Shark Tank Crew)

## Topology
- **Frontend**: Next.js 14 (App Router, TS). UI: shadcn/Tailwind. Data: TanStack Query + Zustand (sliders/panel state). Realtime: WS + SSE fallback. Charts: Recharts (bands, tornado, cohorts).
- **API Gateway**: NestJS (REST; OpenAPI 3.1; Zod/AJV validation; RBAC; rate limits; Idempotency‑Key; Problem+JSON). Signed S3/R2 URLs.
- **Auth**: Auth.js (OAuth/passwordless) + short‑lived JWT; SAML/OIDC; SCIM for org provisioning.
- **Orchestrator**: FastAPI + CrewAI; agents: **Angel Investor, VC, Growth Analyst, Risk Assessor, Founder (roleplay)**.
- **Workers (Python)**: `pitch-ingest`, `metric-normalizer`, `valuation-engine`, `cap-table-engine`, `risk-engine`, `panel-simulator`, `term-sheet-drafter`, `exporter`.
- **Infra**: Postgres (+ pgvector), Redis (Upstash), NATS, Celery queues, S3/R2, OTel + Prometheus/Grafana + Sentry, Secrets via Vault/KMS.

## Data Model (high‑level)
- **Tenancy**: `orgs`, `users`, `memberships` (Owner/Admin/Investor/Analyst/Founder/Viewer).
- **Pitch**: `pitches`, `pitch_files`, `kpis`, `assumptions`.
- **Models**: `market_models`, `unit_economics`, `valuations` (method, inputs, low/base/high), `scenarios`.
- **Governance**: `risks`, `panel_transcripts`, `decisions`.
- **Deal**: `cap_table`, `term_sheets`.
- **Knowledge**: `comps` (sector/stage/geo bands; vector index).
- **Ops**: `comments`, `exports`, `audit_log`. RLS everywhere by org/pitch.

## API Surface (v1 highlights)
- **Auth/Org**: `POST /auth/login`, `POST /auth/refresh`, `GET /me`.
- **Pitches**: `POST /pitches`, `POST /pitches/:id/files`, `POST /pitches/:id/ingest`, `GET /pitches/:id`.
- **Metrics/Market**: `GET /pitches/:id/kpis`, `POST /pitches/:id/assumptions`, `POST /pitches/:id/market`, `GET /pitches/:id/unit-econ`.
- **Valuation**: `POST /pitches/:id/valuation/{scorecard|vc|comps|berkus|rfs}`, `GET /pitches/:id/valuations`, `POST /pitches/:id/scenario`.
- **Panel/Decision**: `POST /pitches/:id/panel/simulate`, `POST /pitches/:id/decision`, `GET /pitches/:id/decision`.
- **Deal**: `POST /pitches/:id/cap-table/simulate`, `POST /pitches/:id/term-sheet`.
- **Exports**: `POST /pitches/:id/export`, `GET /exports/:id`.
**Conventions:** Idempotency‑Key on generate/simulate/export; Problem+JSON; cursor pagination; strict RLS.

## Agent Tool Contracts (strict JSON)
- `Deck.parse(pdf|images)` → `{sections, traction, pipeline, notes}`
- `KPI.parse(csv|xlsx)` → `[{period, metric, value, meta}]`
- `Market.size(inputs)` → `{method:'topdown'|'bottomup', tam, sam, som, assumptions[]}`
- `Finance.calc(metrics, assumptions)` → `{ltv, cac, payback_months, gross_margin, burn_multiple, magic_number, rule_of_40}`
- `Valuation.scorecard(inputs)` → `{scores:{team,market,product,traction,competition,defensibility,gtm}, weightings, low/base/high, notes}`
- `Valuation.vc_method(exit_value, ownership, irr, prob, years)` → `{low, base, high, pv_formula}`
  - **PV formula:** `PV = (ExitValue × Ownership × Prob) / (1+IRR)^Years`
- `Valuation.comps(sector, stage, geo, metric)` → `{bands:{p10,p50,p90}, sample, applied:{low,base,high}}`
- `Valuation.berkus_rfs(inputs)` → `{low, base, high, notes}`
- `Scenario.run(params)` → `{outputs, sensitivities}`
- `Risk.register(pitch)` → `[{category, severity, likelihood, description, mitigation}]`
- `Panel.debate(context)` → `{transcript, votes:[{role, vote, conditions[]}], summary}`
- `TermSheet.render(type, params)` → `{docx_key, pdf_key}`
- `CapTable.simulate(pre_money, new_money, option_pool_target, existing_caps[])` → `{table[], pre, post}`

## Deterministic Heuristics
- **Scorecard default weights:** Team 25%, Market 25%, Product 15%, Traction 15%, Competition 10%, Defensibility 5%, GTM 5% (editable).
- **Comps selection order:** (sector, stage, geo) exact → nearest‑neighbor via vector on `comps.embedding`; apply p50 by default; p10/p90 as low/high.
- **Check size recommendation:**  
  1) Compute **PV** via VC method (base).  
  2) Target ownership `own_target` (e.g., 10% seed).  
  3) **Investment (check)** = `PV × own_target`.  
  4) **Post‑money** = `PV`; **Pre‑money** = `PV − Investment`.  
  5) Validate against stage norms & dilution caps → adjust and explain.
- **Option pool top‑up:** compute new pool % **post** to target `pool_target` ⇒ increase by `Δ = max(0, pool_target − pool_current_post)`; reflect in dilution table.

## Realtime Channels
- `pitch:{id}:ingest` — deck/KPI parse ticks  
- `pitch:{id}:models` — valuation & scenario progress  
- `pitch:{id}:panel` — debate chunks, votes, conditions  
- `pitch:{id}:decision` — decision updates  
- `export:{id}:status` — artifact completion  
Presence for reviewers; SSE fallback.

## Security & Compliance
RBAC (Owner/Admin/Investor/Analyst/Founder/Viewer); Postgres RLS; S3 signed URLs; KMS‑wrapped tokens; audit log for valuations, panel votes, decisions, exports; retention windows configurable. Prominent **“not investment advice”** notices.

## Deployment & SLOs
FE: Vercel; APIs/Workers: Render/Fly → GKE at scale (pools for parsing/models/exports).  
DB: Neon/Cloud SQL Postgres + pgvector; Redis cache; NATS bus; S3/R2 objects.  
**SLOs:** ingest preview < **5s P95**; first valuation < **3s P95**; full set < **30s P95**; panel summary < **10s P95**; export < **12s P95**; 5xx < **0.5%/1k**.
