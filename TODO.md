# TODO — AI STARTUP FUND (Shark Tank Crew)
> Phase‑gated backlog. [Code] deterministic; [Crew] agent prompts/policies.

## Phase 0 — Repo, Infra, CI/CD
- [x] Monorepo scaffold: `apps/{frontend,gateway,orchestrator,workers}` & `packages/{sdk}`.
- [x] `docker-compose.dev.yml`: Postgres, Redis, NATS, MinIO; healthchecks; seed script.
- [x] `env.example` for DB/REDIS/NATS/S3/JWT/OAuth; local TLS.
- [ ] GitHub Actions: lint/typecheck/test; Docker build; SBOM + cosign; migration gate.

## Phase 1 — DB & Contracts
- [x] SQL migrations for tables in ARCH; RLS policies; vector indexes (`comps`).
- [x] OpenAPI 3.1 + Zod parity; Problem+JSON envelope; Idempotency middleware.
- [x] Auth.js + RBAC guards (Owner/Admin/Investor/Analyst/Founder/Viewer).

## Phase 2 — Intake & Parsing
- [x] `pitch-ingest`: deck thumbnails; KPI CSV/XLSX parser; OCR fallback; checksum.
- [x] `metric-normalizer`: derive growth %, churn (logo vs revenue), GM%, CAC by channel, ACV; validation rules.
- [x] UI: **PitchWizard**, **FileUploader**, **KPIGrid**, **MetricCards** with WS ticks.

## Phase 3 — Unit Economics & Market
- [x] `Finance.calc` functions; **CohortChart**, **LtvCacCard**.
- [x] `Market.size` (top‑down/bottom‑up); **MarketSizer** UI; assumption registry integration.

## Phase 4 — Valuation Engines
- [x] `valuation-engine`: scorecard, VC method (PV w/ IRR), comps (bands from `comps`), Berkus/RFS.
- [x] **ValuationBands** UI with formula tooltips; **ScorecardEditor**.
- [x] Prompts for valuation notes & rationale strings bound to inputs.

## Phase 5 — Risks
- [x] `risk-engine`: categories (market/team/technical/regulatory/concentration/execution), severity/likelihood scoring; CSV export.
- [x] **RiskRegister** editor; high‑severity gating.

## Phase 6 — Panel Simulator
- [x] `panel-simulator` with role prompts, debate turn budget, citation of assumptions; WS stream → **PanelRoom**.
- [x] Role profiles (Angel/VC/Risk/Founder); challenge/defense loops; condition extraction.

## Phase 7 — Decision & Memo
- [x] **DecisionForm** (Yes/No/Conditional), check size calc, target ownership; gating rules (needs ≥1 valuation + risk register + cap table sim).
- [x] **MemoEditor** seeded from models & risks; reviewer sign‑off.

## Phase 8 — Cap Table & Term Sheet
- [x] `cap-table-engine` (pre/post, new pool top‑up math); **CapTableSim** waterfall.
- [x] `term-sheet-drafter` (SAFE & Equity templates) with field validation; **TermSheetEditor**.

## Phase 9 — Exports & Observability
- [x] `exporter` bundle (memo MD/PDF, valuation CSV, term sheet PDF, cap table CSV, ZIP) + signed URLs; inline previews.
- [x] OTel traces & Grafana dashboards; Sentry; cost/concurrency guardrails; retention jobs.
- [x] Audit every valuation/panel/decision/export.

## Testing Matrix
- [x] **Unit**: KPI parser; unit‑econ math; valuation formulas (scorecard/VC/comps/Berkus/RFS); cap‑table math; term‑sheet field logic.
- [x] **Contract**: OpenAPI + Zod; Problem+JSON renderer.
- [x] **E2E (Playwright)**: intake → ingest → metrics → valuation → scenarios → panel → decision → terms → export.
- [x] **Load (k6)**: parallel valuations & panels; WS fanout benchmarks.
- [x] **Chaos**: corrupted CSV; huge decks; missing KPIs; delayed model responses.
- [x] **Security**: ZAP; dependency & secret scans; object store scope tests.

## Seeds & Fixtures
- [x] 3 sample pitches (SaaS/fintech/healthtech) with KPI CSVs; cohort examples.
- [x] Comps library seeds (sector/stage/geo; EV/ARR, EV/GMV bands) with timestamps & sample sizes.
- [x] Risk templates per sector (regulatory flags, typical mitigations).
- [x] SAFE/Equity term‑sheet templates (DOCX) with placeholders.

## Operational Runbooks
- [x] Error budgets & SLO alerts (ingest, valuation, panel, export).
- [x] Comps refresh cadence (monthly); provenance notes.
- [x] Data retention defaults (uploads 180d; exports 365d) — env‑configurable.

## Out of Scope (MVP)
- Live calendaring/scheduling; real investor identity verification.
- Payment/escrow; cap table provider integrations.
