# Project Plan — AI STARTUP FUND (Shark Tank Crew)

> Scope: Ship an MVP that runs **pitch intake → metrics normalization → market sizing & unit economics → multi‑method valuation → risk register → panel simulation & vote → decision + term sheet + cap table → export bundle**, with transparent assumptions and auditability by default.

## Product Goal
Provide accelerators/angels/micro‑VCs and founders a fast, consistent, and explainable “Shark Tank” evaluation. Every output traces back to explicit inputs and assumptions; all math is reproducible.

## Safety & Policy Stance
- **Not investment advice / not a broker‑dealer.** Outputs are simulations and require human review. Clear disclaimers in UI & exports.
- **Assumption registry first.** Each conclusion (valuation, risk, decision) cites the assumptions used.
- **PII & deck security.** No sensitive data in logs; signed URLs; tenant isolation.

## 80/20 Build Strategy
- **80% deterministic/code:** parsers, KPI math (LTV/CAC/payback/burn multiple), market sizing calculators, valuation engines (scorecard/VC/comps/Berkus/RFS), cap table & term‑sheet renderers, OpenAPI, RLS, audit.
- **20% generative/agents:** panel debate simulation, memo prose, risk narrative, Q&A transcript—constrained by strict JSON tool contracts.

## Immediate Next 3 Tasks
1) **Infra & repo:** monorepo scaffold, `docker-compose.dev` (Postgres + Redis + NATS + MinIO), `.env.example`, GitHub Actions (lint/test/build, SBOM + signing).
2) **Contracts & gateway:** NestJS API (Auth/RBAC, OpenAPI 3.1, Idempotency‑Key, Problem+JSON), signed upload URLs, WS channels.
3) **Model core:** KPI parser + unit‑econ math + scorecard/VC/comps valuation engines; store assumption registry; render valuation bands.

## Phases
- **P0** Infra/CI & typed contracts  
- **P1** DB schema + migrations + RLS  
- **P2** Pitch ingest (deck/KPI) + parsers  
- **P3** Unit economics + market sizing  
- **P4** Valuation engines (scorecard, VC, comps, Berkus/RFS)  
- **P5** Risk engine + register UI  
- **P6** Panel simulator + votes/conditions  
- **P7** Decision page + memo seeding  
- **P8** Cap table sim + term sheet drafts (SAFE/Equity)  
- **P9** Exports bundle + observability/tests/hardening

## Definition of Done (MVP)
- **Intake:** pitch wizard + deck/KPI uploads; ingest progress via WS; KPI grid normalized (MRR/ARR, growth %, churn, GM%, CAC, ACV).
- **Economics:** LTV/CAC (two methods), payback months, burn multiple, magic number, rule of 40 (if applicable).
- **Valuation:** scorecard + VC method + comps (+ Berkus/RFS for pre‑rev) saved with **low/base/high** bands and formulas.
- **Risk:** register with category, severity, likelihood, mitigation; high‑severity filter.
- **Panel:** simulated transcript (Angel/VC/Risk/Founder), votes (Yes/No/Conditional), conditions to close.
- **Decision:** recommended check size, instrument (SAFE/Equity), target ownership, pre/post money.
- **Terms & Cap Table:** SAFE/Equity draft (DOCX/PDF) + dilution table (pre/post, new pool).
- **Exports:** memo (Markdown/PDF), valuation CSV, term sheet PDF, cap table CSV, full ZIP.
- **SLOs:** ingest preview < **5s P95**; first valuation < **3s P95**; full set < **30s P95**; panel summary < **10s P95**; export < **12s P95**.

## Non‑Goals (MVP)
- Fund admin, wire/escrow, live signature flows.
- External CRM write‑back (read/export links only).
- Multi‑currency comps beyond display (USD normalized first).

## Key Risks & Mitigations
- **Garbage‑in KPIs:** show “data sufficiency” badge; require minimum fields before valuation; flag inconsistent metrics.
- **Comps drift:** maintain internal comps library with timestamped bands; show sample size & date.
- **Over‑automation bias:** force explicit reviewer sign‑off before “decided”; memo requires rationale text.

## KPIs (first 90 days)
- **Time‑to‑decision** (intake→decision) < **1 hour** median (with KPIs uploaded).
- **Assumption coverage** ≥ **90%** (required inputs filled or defaulted).
- **Panel clarity:** conditional‑yes decisions include ≥ **3** explicit conditions on average.
- **User CSAT:** ≥ **80%** “useful for next steps.”
