AI STARTUP FUND (SHARK TANK CREW) —
END‑TO‑END PRODUCT BLUEPRINT
(React 18 + Next.js 14 App Router; CrewAI multi
‑agent orchestration; TypeScript
‑first
contracts.)

1) Product Description & Presentation
One‑liner
A multi‑agent “Shark Tank” that turns a founder’s pitch into an investor‑grade
evaluation—panel feedback, a funding decision, a valuation estimate (with methods like
comparables/VC method/SCORE‑card), and explicit why / why not—plus an
auto‑generated term sheet (SAFE/Equity) and risk register.
Positioning
• For accelerators, angels, micro‑VCs, venture studios, and founders who want fast,
repeatable diligence with transparent assumptions, audit trails, and exportable
artifacts.
• Output artifacts: Deal memo, scorecard & rubric, valuation workbook, risk register
with mitigations, cap table impact, term sheet draft, Q&A transcript, go/no‑go
rationale.
Demo narrative
1. Founder pastes pitch (summary, deck, metrics) and selects round type
(pre‑seed/seed/A).
2. Agents debate (angel vs VC vs risk assessor) with a growth analyst quantifying TAM,
unit economics, and scenarios.
3. System returns valuation range, recommended check size, instrument & terms,
and a panel transcript + decision.
2) Target User
• Founders seeking feedback and investor‑style diligence.
• Angel groups / syndicates / micro‑VCs standardizing intake and memos.
• Accelerators / universities running selection panels.
• Venture studios triaging many ideas quickly.
3) Features & Functionalities (Extensive)
Pitch Intake & Normalization
• Pitch wizard: problem, solution, ICP, GTM, traction, revenue model, pricing,
churn/retention, CAC/LTV, gross margin, team bios, fundraising ask, use of funds.
• Deck & data ingestion: PDF deck, one‑pager, KPI CSV (MRR, churn, cohorts), market
notes.
• Extractor: pulls explicit metrics (MRR, growth %, churn, ACV, ASP, CAC, payback,
MoM DAU, GM%) and implicit signals (regulatory scope, defensibility claims).
• Assumption registry: toggles and numeric assumptions used by models; every
decision points to these.
Multi‑Method Valuation
• Scorecard (team, market, product, traction, competition, defensibility, GTM) → base
multiple.
• VC Method (target ownership, future valuation at exit, probability discount).
• Comparables (sector/geo/maturity; EV/Revenue, EV/GMV, EV/ARR bands).
• Berkus/DMR (pre‑revenue heuristics) and Risk‑Factor Summation (± adjustments).
• Scenario engine: conservative / base / aggressive, with sensitivity sliders (CAC, churn,
growth, GM%).
• Check size recommendation based on target ownership, dilution cap, stage
norms, runway target.
Growth & Unit Economics
• Cohort analysis (retention curves; payback period).
• LTV/CAC with selectable LTV methods (cohort decay vs. simple margin‑based).
• Sales efficiency (magic number), burn multiple, rule of 40 (if later stage).
• Pricing & mix simulation (ACV shift, discounting impact).
Risk & Compliance
• Risk register: market, team, technical, regulatory, concentration, execution; each
with severity, likelihood, mitigation.
• Regulatory flags (fintech/health/security); KYC-lite prompts (company jurisdiction,
directors).
• IP posture (open‑source dependencies, patents, data rights).
• Fraud/variance checks (inconsistent metrics across files).
Investor Panel Simulation & Q&A
• Roleplay: Angel Investor, VC, Growth Analyst, Risk Assessor, and Startup Founder
(echoing & defending).
• Debate transcript with cited assumptions; position deltas after each challenge.
• Final vote (Yes/No/Conditional) + conditions to close (e.g., “hire senior PMM,” “SOC 2
audit path,” “LOI from top‑3 design partners”).
Output & Exports
• Deal memo (1–2 pages) with scorecard, valuation, decision rationale.
• Term sheet draft (SAFE or equity—% ownership, option pool refresh, pro‑rata,
most‑favored‑nation, board).
• Cap table impact: pre/post money, dilution table.
• Data room checklist for diligence follow‑ups.
• All exports: Markdown/HTML/DOCX/PDF/CSV for models.
4) Backend Architecture (Extremely Detailed &
Deployment‑Ready)
4.1 Topology
• Frontend/BFF: Next.js 14 (Vercel) using server actions for lightweight mutations and
file sign‑URLs.
• API Gateway: Node/NestJS (REST; OpenAPI 3.1; request validation w/ Zod/AJV; RBAC;
rate limits; Idempotency‑Key; Problem+JSON errors).
• Auth: Auth.js (OAuth/passwordless) + short‑lived JWT with rotating refresh;
SAML/OIDC; SCIM for org provisioning.
• Orchestration: CrewAI Orchestrator (Python FastAPI) coordinating agents:
o Angel Investor (gut‑feel + founder‑market fit + syndicate norms)
o VC (fund math, ownership targets, follow‑on strategy)
o Growth Analyst (market sizing, unit economics, scenarios)
o Risk Assessor (regulatory, execution, concentration, IP, security)
o Startup Founder (roleplay) (clarifies, defends, supplies missing context)
• Workers (Python):
o pitch-ingest (deck parse, KPI CSV parse, OCR fallback)
o metric-normalizer (derive growth %, churn types; CAC/LTV methods)
o valuation-engine (scorecard, VC method, comparables, Berkus/RFS; scenario
runs)
o cap-table-engine (pre/post money, option pool math)
o risk-engine (risk categorization; severity/likelihood scoring)
o panel-simulator (debate, Q&A transcript, vote aggregation)
o term-sheet-drafter (SAFE/Equity templates; parameterization)
o exporter (deal memo, spreadsheets, PDFs)
• Event Bus: NATS (pitch.*, metrics.*, valuation.*, panel.*, risk.*,
export.*).
• Task Queue: Celery (NATS/Redis backend) with lanes: interactive (panel
feedback), models (valuation), exports.
• DB: Postgres (Neon/Cloud SQL) + pgvector (embeddings for pitch text, comps,
heuristics, QA snippets).
• Object Storage: S3/R2 (uploads, exports, memo PDFs).
• Cache: Upstash Redis (hot pitch state, scenario results, presence).
• Realtime: WebSocket gateway (NestJS) + SSE fallback for panel streams and model
finishes.
• Observability: OpenTelemetry traces; Prometheus/Grafana; Sentry; structured logs.
• Secrets: Cloud Secrets Manager/Vault; KMS‑wrapped tokens; no plaintext secrets at
rest.
4.2 CrewAI Agents & Tooling
Agents
• Angel Investor — evaluates founder‑market fit, speed, storytelling, early traction
quality; suggests friendly check sizes, syndication angles.
• VC — enforces fund math (ownership, reserves, follow‑on strategy), return potential,
exit realism; negotiates terms.
• Growth Analyst — computes TAM/SAM/SOM (top‑down/bottom‑up), runs
cohort/retention and LTV/CAC, burn multiple, rule of 40 (if applicable), scenario
sensitivities.
• Risk Assessor — scores regulatory, market, execution, concentration, IP/security;
proposes mitigations and financing structure adjustments.
• Founder (roleplay) — answers panel questions, clarifies metrics, adjusts
assumptions when challenged.
Agent Tools (strict surface)
• Deck.parse(pdf|images) → sections, traction slides, problem/solution, pipeline
metrics.
• KPI.parse(csv|xlsx) → normalized KPIs (ARR/MRR, churn types, cohorts, CAC by
channel, GM%).
• Market.size(inputs) → TAM/SAM/SOM with method tags (topdown|bottomup),
assumptions.
• Finance.calc(metrics, assumptions) → LTV/CAC, payback, burn multiple, sales
efficiency, rule of 40.
• Valuation.scorecard(inputs) → base score & weightings.
• Valuation.vc_method(exit_value, target_mul, ownership, prob, years)
→ present value & range.
• Valuation.comps(category, stage) → EV/ARR bands (from internal comps
library).
• Valuation.berkus_rfs(inputs) → pre‑revenue estimate.
• Scenario.run(params) → conservative/base/aggressive outputs; sensitivities.
• Risk.register(pitch) → risks {category, severity, likelihood, mitigation}.
• Panel.debate(context) → transcript, member votes, conditions, final
recommendation.
• TermSheet.render(type, params) → SAFE/Equity DOCX/PDF.
• CapTable.simulate(pre_money, new_money, option_pool, existing_caps)
→ dilution table.
4.3 Data Model (Postgres + pgvector)
-- Tenancy & Users
CREATE TABLE orgs (
id UUID PRIMARY KEY, name TEXT NOT NULL, plan TEXT, created_at
TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE users (
id UUID PRIMARY KEY, org_id UUID REFERENCES orgs(id),
email CITEXT UNIQUE, name TEXT, role TEXT,
created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE memberships (
user_id UUID REFERENCES users(id), org_id UUID REFERENCES orgs(id),
workspace_role TEXT CHECK (workspace_role IN
('owner','admin','investor','analyst','founder','viewer')),
PRIMARY KEY (user_id, org_id)
);
-- Pitches
CREATE TABLE pitches (
id UUID PRIMARY KEY, org_id UUID, title TEXT, stage TEXT, --
'idea','preseed','seed','A'
sector TEXT, geo TEXT, round_type TEXT CHECK (round_type IN
('SAFE','Equity')) DEFAULT 'SAFE',
ask_usd NUMERIC, use_of_funds JSONB, summary TEXT, status TEXT
CHECK (status IN
('created','ingested','analyzing','valued','panel','decided','exported
','archived')) DEFAULT 'created',
created_by UUID, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE pitch_files (
id UUID PRIMARY KEY, pitch_id UUID REFERENCES pitches(id),
kind TEXT, -- 'deck','onepager','kpi','appendix'
s3_key TEXT, mime TEXT, size BIGINT, sha256 TEXT, uploaded_at
TIMESTAMPTZ DEFAULT now()
);
-- Extracted Entities & Metrics
CREATE TABLE kpis (
id UUID PRIMARY KEY, pitch_id UUID REFERENCES pitches(id),
period DATE, metric TEXT, value NUMERIC, meta JSONB
);
CREATE TABLE assumptions (
id UUID PRIMARY KEY, pitch_id UUID, key TEXT, value JSONB, source
TEXT, -- 'user','derived'
created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE market_models (
id UUID PRIMARY KEY, pitch_id UUID, method TEXT, --
'topdown','bottomup'
tam NUMERIC, sam NUMERIC, som NUMERIC, assumptions JSONB
);
CREATE TABLE unit_economics (
id UUID PRIMARY KEY, pitch_id UUID, ltv NUMERIC, cac NUMERIC,
payback_months NUMERIC,
gross_margin NUMERIC, burn_multiple NUMERIC, magic_number NUMERIC,
rule_of_40 NUMERIC, meta JSONB
);
-- Valuation
CREATE TABLE valuations (
id UUID PRIMARY KEY, pitch_id UUID, method TEXT, --
'scorecard','vc','comps','berkus','rfs'
inputs JSONB, result_low NUMERIC, result_base NUMERIC, result_high
NUMERIC, notes TEXT, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE scenarios (
id UUID PRIMARY KEY, pitch_id UUID, name TEXT, --
'conservative','base','aggressive'
params JSONB, outputs JSONB, created_at TIMESTAMPTZ DEFAULT now()
);
-- Risk & Panel
CREATE TABLE risks (
id UUID PRIMARY KEY, pitch_id UUID, category TEXT, severity TEXT,
likelihood TEXT,
description TEXT, mitigation TEXT, owner_role TEXT, created_at
TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE panel_transcripts (
id UUID PRIMARY KEY, pitch_id UUID, content TEXT, -- full debate
transcript
summary JSONB, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE decisions (
id UUID PRIMARY KEY, pitch_id UUID, recommendation TEXT CHECK
(recommendation IN ('yes','no','conditional')),
check_size_usd NUMERIC, instrument TEXT, -- 'SAFE','Equity'
pre_money_usd NUMERIC, post_money_usd NUMERIC, target_ownership
NUMERIC,
conditions TEXT[], rationale TEXT, created_at TIMESTAMPTZ DEFAULT
now()
);
-- Term Sheet & Cap Table
CREATE TABLE term_sheets (
id UUID PRIMARY KEY, pitch_id UUID, type TEXT, -- 'SAFE','Equity'
params JSONB, docx_key TEXT, pdf_key TEXT, created_at TIMESTAMPTZ
DEFAULT now()
);
CREATE TABLE cap_table (
id UUID PRIMARY KEY, pitch_id UUID, pre_money NUMERIC, new_money
NUMERIC, option_pool NUMERIC,
table JSONB, -- [{holder, class, pre%, post%}]
created_at TIMESTAMPTZ DEFAULT now()
);
-- Comps Library (internal knowledge)
CREATE TABLE comps (
id UUID PRIMARY KEY, sector TEXT, stage TEXT, geo TEXT,
multiple_name TEXT, -- 'EV/ARR'
p10 NUMERIC, p50 NUMERIC, p90 NUMERIC, sample INT, notes TEXT,
embedding VECTOR(768)
);
-- Comments, Audit & Exports
CREATE TABLE comments (
id UUID PRIMARY KEY, pitch_id UUID, author_id UUID, body TEXT,
anchor JSONB, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE exports (
id UUID PRIMARY KEY, pitch_id UUID, kind TEXT, --
'memo','valuation_csv','term_sheet_pdf','zip'
s3_key TEXT, meta JSONB, created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE audit_log (
id BIGSERIAL PRIMARY KEY, org_id UUID, user_id UUID, pitch_id UUID,
action TEXT, target TEXT, meta JSONB, created_at TIMESTAMPTZ DEFAULT
now()
);
Indexes & Constraints (high‑value)
• CREATE INDEX ON kpis (pitch_id, metric, period);
• CREATE INDEX ON valuations (pitch_id, method);
• Vector index on comps.embedding for fast comparable retrieval.
• Service‑level checks: decision requires at least one valuation record and risk register.
4.4 API Surface (REST /v1, OpenAPI)
Auth & Orgs
• POST /v1/auth/login / POST /v1/auth/refresh
• GET /v1/me / GET /v1/orgs/:id
Pitches
• POST /v1/pitches
{title,stage,sector,geo,round_type,ask_usd,use_of_funds,summary}
• GET /v1/pitches/:id / list
• POST /v1/pitches/:id/files (multipart) → {file_id}
• POST /v1/pitches/:id/ingest → parse deck/KPI; progress via WS
• PATCH /v1/pitches/:id {status}
Metrics & Markets
• GET /v1/pitches/:id/kpis
• POST /v1/pitches/:id/assumptions {key,value,source}
• POST /v1/pitches/:id/market {method, inputs} → TAM/SAM/SOM
• GET /v1/pitches/:id/unit-econ → LTV/CAC, burn multiple, etc.
Valuation & Scenarios
• POST /v1/pitches/:id/valuation/scorecard {weights?}
• POST /v1/pitches/:id/valuation/vc
{exit_value,target_mul,ownership,prob,years}
• POST /v1/pitches/:id/valuation/comps
{sector,stage,geo,metric:'EV/ARR'|'EV/GMV'}
• POST /v1/pitches/:id/valuation/berkus {inputs} / .../rfs
• POST /v1/pitches/:id/scenario {name, params}
• GET /v1/pitches/:id/valuations / .../scenarios
Panel & Decision
• POST /v1/pitches/:id/panel/simulate {modes} → transcript + summary
• POST /v1/pitches/:id/decision {recommendation, check_size_usd,
instrument, pre_money_usd, target_ownership, conditions[],
rationale}
• GET /v1/pitches/:id/decision
Term Sheet & Cap Table
• POST /v1/pitches/:id/cap-table/simulate
{pre_money,new_money,option_pool,existing_caps}
• POST /v1/pitches/:id/term-sheet {type, params} → artifacts (DOCX/PDF)
Exports
• POST /v1/pitches/:id/export
{targets:['memo','valuation_csv','term_sheet_pdf','zip']}
• GET /v1/exports/:id → signed URL
Conventions
• All mutations require Idempotency‑Key.
• Errors: Problem+JSON with typed codes.
• Cursor pagination; strict RLS by org/pitch.
4.5 Orchestration Logic (CrewAI)
State machine (per pitch):
created → ingested → analyzing → valued → panel → decided → exported →
archived
Turn sequence (typical)
1. Ingest deck/KPI → metrics normalized → assumptions created.
2. Growth Analyst computes TAM/SAM/SOM and unit economics (LTV/CAC, payback).
3. Valuation engine runs Scorecard + VC method + Comps + Berkus/RFS; stores ranges.
4. Risk Assessor fills risk register with mitigations; flags structure changes (e.g., SAFE
with MFN).
5. Panel simulation (Angel, VC, Risk, Founder) → transcript + votes + conditions.
6. Decision composed with check size, instrument, pre/post money, target
ownership.
7. Term‑sheet rendered; Cap table simulated; Deal memo & exports built.
4.6 Background Jobs
• IngestPitch(pitchId) → parse files → metrics.
• ComputeUnitEconomics(pitchId) → LTV/CAC/payback/burn multiple.
• RunMarketSizing(pitchId) → TAM/SAM/SOM variants.
• RunValuations(pitchId) → all methods, scenario sets.
• SimulatePanel(pitchId) → transcript + votes.
• DraftTermSheet(pitchId) → SAFE/Equity.
• ExportBundle(pitchId, targets[]).
• Periodics: CompsUpdate (internal library refresh), CostRollup, RetentionSweeper,
AlertOnFailure.
4.7 Realtime
• WS channels:
o pitch:{id}:ingest (file/metric extraction ticks)
o pitch:{id}:models (valuation/scenario progress)
o pitch:{id}:panel (debate chunks stream)
o pitch:{id}:decision (status updates)
o export:{id}:status
• Presence indicators during collaborative review; SSE fallback.
4.8 Caching & Performance
• Redis caches: latest valuations, scenario outputs, quick cap table sims.
• Concurrency caps to protect cost (e.g., ≤3 heavy jobs per pitch).
• SLOs:
o Ingest deck + KPI preview < 5s P95.
o First valuation (scorecard) < 3s P95; full set < 30s P95.
o Panel transcript (short form) < 10s P95.
o Export bundle < 12s P95.
4.9 Observability
• OTel traces: gateway → orchestrator → workers; tags include pitch_id, method,
tokens.
• Metrics: average match completeness (data sufficiency), valuation method dispersion
(range width), decision outcomes %, time‑to‑decision, export success.
• Logs: JSON with correlation ids; PII‑safe; audit_log for every valuation/decision export.
5) Frontend Architecture (React 18 + Next.js 14)
5.1 Tech Choices
• Next.js 14 App Router, TypeScript.
• UI: shadcn/ui + Tailwind (enterprise, keyboard‑friendly).
• Data/state: TanStack Query for server cache; Zustand for ephemeral workspace state
(sliders, scenario drafts, panel playback).
• Realtime: WebSocket client with reconnect/backoff; SSE fallback.
• Charts: Recharts (waterfalls, bands, tornado sensitivity, cohort curves).
• Tables: virtualized KPI & risk lists.
• Editors: TipTap for memo; Monaco for JSON assumptions (power users).
• File preview: deck thumbnails (PDF → images), CSV grid.
5.2 App Structure
/app
/(marketing)/page.tsx
/(app)
dashboard/page.tsx
pitches/
new/page.tsx
[pitchId]/
page.tsx // Pitch Overview
intake/page.tsx // Pitch wizard + files
metrics/page.tsx // KPIs & unit economics
market/page.tsx // TAM/SAM/SOM
valuation/page.tsx // Methods & ranges
scenarios/page.tsx // Sensitivities & cases
risks/page.tsx // Risk register
panel/page.tsx // Debate & votes
decision/page.tsx // Check size, instrument, rationale
terms/page.tsx // Cap table & term sheet
exports/page.tsx // Bundle and links
admin/
comps/page.tsx // Internal comps library viewer
audit/page.tsx
/components
PitchWizard/*
FileUploader/*
KPIGrid/*
MetricCards/*
CohortChart/*
LtvCacCard/*
MarketSizer/*
ValuationBands/*
ScorecardEditor/*
ScenarioToggles/*
SensitivityTornado/*
RiskRegister/*
PanelRoom/*
VoteTallies/*
DecisionForm/*
CapTableSim/*
TermSheetEditor/*
MemoEditor/*
ExportHub/*
DiffViewer/*
/lib
api-client.ts
ws-client.ts
zod-schemas.ts
rbac.ts
/store
usePitchStore.ts
useScenarioStore.ts
usePanelStore.ts
useRealtimeStore.ts
5.3 Key Pages & UX Flows
Dashboard
• Cards: “Start new pitch,” “Needs panel,” “Decisions pending,” “Recent exports.”
• Shortcuts to pitches with missing KPIs or assumptions.
Intake
• PitchWizard: form sections (problem/solution/GTM/ask).
• FileUploader: deck/KPI CSV; shows ingest progress; extracted metrics summary.
• Assumptions editor with common presets (e.g., target gross margin).
Metrics
• KPIGrid (virtualized) with growth %, MRR/ARR, churn (logo vs. revenue), ACV, CAC.
• MetricCards (burn multiple, magic number, GM%).
• CohortChart + LtvCacCard showing payback and LTV curves.
Market
• MarketSizer supporting top‑down/bottom‑up; inputs with toggles; TAM/SAM/SOM
outputs with confidence badges; editable assumptions.
Valuation
• ScorecardEditor: weights sliders; live base multiple.
• ValuationBands: ribbons for each method (low/base/high) with rationale tooltips;
click to expand formulas.
• “Adopt base valuation” toggles to feed Decision page.
Scenarios
• ScenarioToggles: conservative/base/aggressive plus custom; parameter sliders
(growth rate, CAC, churn, GM%).
• SensitivityTornado displays value‑driver impacts on valuation / runway.
Risks
• RiskRegister: list with category, severity, likelihood, mitigation owner; filter by high
severity; export as CSV.
Panel Room
• PanelRoom: live debate stream; role tabs (Angel/VC/Risk/Founder); VoteTallies;
“Conditions to close” chips.
• Threaded comments for reviewers; lock on “Move to Decision”.
Decision
• DecisionForm: Yes/No/Conditional; check size; target ownership; instrument
(SAFE/Equity) with fields (discount/cap/pro‑rata/board).
• Preview CapTableSim (pre/post money, dilution, option pool).
• MemoEditor (TipTap) auto‑seeded; reviewer sign‑off workflow.
Terms
• TermSheetEditor with SAFE/Equity templates; inline validation (e.g., discount XOR
cap for certain SAFE forms).
• Regenerate PDF/DOCX; confirm final.
Exports
• ExportHub: select memo/valuation CSV/term sheet/cap table/zip; progress list with
signed URLs; DiffViewer vs last export.
5.4 Component Breakdown (Selected)
• ValuationBands/Band.tsx
Props: { method, low, base, high, notes }; shows hoverable formula; click to
adopt into decision context.
• ScenarioToggles/SliderRow.tsx
Props: { paramKey, value, range, step }; updates scenario in
useScenarioStore; triggers recompute via server action (debounced).
• RiskRegister/Row.tsx
Props: { risk }; editable likelihood/severity (selects); mitigation textarea; creates audit
entry on change.
• PanelRoom/Transcript.tsx
Props: { chunks }; stream appends; role‑colored badges; copy button; filter by role or
topic.
• CapTableSim/Waterfall.tsx
Props: { preMoney, newMoney, pool, existing }; renders pre/post ownership bars;
tooltips for dilution.
5.5 Data Fetching & Caching
• Server Components for pitch overviews, valuations list, risks list.
• TanStack Query for volatile data (scenarios, panel stream, decision form).
• WS pushes update scenario outputs and panel transcript in place
(queryClient.setQueryData).
• Route prefetch: metrics → valuation → scenarios → decision.
5.6 Validation & Error Handling
• Zod schemas for pitch intake, KPI rows, valuation parameters, scenario params, term
sheet fields.
• Idempotency‑Key on generate/simulate/export actions; optimistic UI with rollback.
• Guardrails: can’t finalize decision without (a) ≥1 valuation method, (b) risk register, (c)
cap table sim.
• Problem+JSON renderer with remediation notes (e.g., “Add GM% or pick a comps
metric that does not require margins”).
5.7 Accessibility & i18n
• Keyboard navigation across tables and sliders; ARIA roles; large hit areas on sliders.
• High‑contrast & color‑blind‑safe charts; focus‑visible rings; screen reader labels for
band charts.
• next-intl scaffolding; currency/number/date localization.
6) Integrations
• Docs/Storage: Google Drive/SharePoint (optional) for pitch files & exports.
• CRM/Dealflow (optional): HubSpot/Affinity—write‑back of decision/memo links.
• Comms: Slack/Email for panel scheduling, decision ready, export links.
• Identity: Auth.js; SAML/OIDC; SCIM.
• Billing (SaaS): Stripe (seats + metered model runs).
• (No broker‑dealer functions): clearly non‑custodial, no funds movement.
7) DevOps & Deployment
• FE: Vercel.
• APIs/Workers: Render/Fly.io (simple) or GKE (scale; node pools: CPU for parsing;
memory for panel/valuation; burst for exports).
• DB: Neon/Cloud SQL Postgres + pgvector; PITR; automated migrations.
• Cache: Upstash Redis.
• Event Bus: NATS (managed/self‑hosted).
• Object Store: S3/R2 with lifecycle (retain exports; purge temps).
• CI/CD: GitHub Actions
o Jobs: lint/typecheck/unit/integration; Docker build; SBOM + cosign; migration
gate; staged deploy.
• IaC: Terraform modules (DB, Redis, NATS, buckets, secrets, DNS/CDN).
• Testing
o Unit: KPI parsing, unit‑econ math, valuation formulas, cap‑table math, term‑sheet
params.
o Contract: OpenAPI.
o E2E (Playwright): intake → ingest → metrics → valuation → scenarios → panel →
decision → terms → export.
o Load: k6 (parallel valuations/panels).
o Chaos: corrupted CSV, oversized decks, missing KPIs.
o Security: ZAP; container scans; secret scanning.
• SLOs
o Ingest preview < 5s P95; valuation set < 30s P95; panel summary < 10s P95; export
< 12s P95.
o 5xx < 0.5% / 1k.
8) Success Criteria
Product KPIs
• Decision time from intake to decision: < 1 hour median (with uploads present).
• Assumption coverage: ≥ 90% of required inputs populated or explicitly defaulted.
• Panel agreement clarity: rationale length ≥ 200 words with ≥ 3 explicit conditions on
“conditional yes.”
• User satisfaction: ≥ 80% rated “useful for next steps.”
Engineering SLOs
• Export success ≥ 99%; WS reconnect < 2s P95; panel stream latency < 250ms P95.
9) Security & Compliance
• RBAC: Owner/Admin/Investor/Analyst/Founder/Viewer; founders can only see their
pitches unless invited to a shared room.
• Encryption: TLS 1.2+; AES‑256 at rest; KMS envelope for tokens; scoped signed URLs
for files.
• Tenant isolation: Postgres RLS; S3 prefix isolation.
• Privacy: redact sensitive PII in logs; configurable retention periods for decks and KPIs.
• Auditability: immutable audit_log for valuations, panel votes, decisions, exports.
• Supply chain: SLSA provenance; image signing; dependency pinning; Dependabot.
• Disclaimer: Not investment advice; not a broker‑dealer; outputs are simulations and
require human review.
10) Visual/Logical Flows
A) Intake → Ingest
Founder completes wizard → uploads deck/KPI → pitch-ingest parses → KPIs +
assumptions saved → status to analyzing.
B) Metrics & Market
metric-normalizer derives growth/churn/CAC → market.size computes
TAM/SAM/SOM → unit economics computed → cards & charts populate.
C) Valuation & Scenarios
Run scorecard, VC method, comps, Berkus/RFS → save bands → user adjusts scenario
sliders → Scenario.run emits tornado sensitivities.
D) Risk
risk-engine proposes risks + mitigations → user edits/assigns owners → high severity
flagged on Decision page.
E) Panel Simulation
panel-simulator streams debate + Q&A (Founder role replies) → votes + conditions
captured → status panel → decision draft prepared.
F) Decision & Terms
Investor chooses Yes/No/Conditional + check size/instrument → cap-table-engine
shows dilution → term-sheet-drafter renders SAFE/Equity → reviewer signs off → status
decided.
G) Exports
exporter builds deal memo, valuation CSV, term sheet PDF, cap table, zip bundle →
signed URLs returned → status exported.