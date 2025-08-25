-- Created automatically by Cursor AI (2024-12-19)
-- Initial database schema for AI Startup Fund

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS "vector";

-- Organizations
CREATE TABLE orgs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
    email CITEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Memberships (RBAC)
CREATE TABLE memberships (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
    workspace_role TEXT CHECK (workspace_role IN ('owner','admin','investor','analyst','founder','viewer')),
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, org_id)
);

-- Pitches
CREATE TABLE pitches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES orgs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    stage TEXT CHECK (stage IN ('idea','preseed','seed','A')) DEFAULT 'idea',
    sector TEXT,
    geo TEXT,
    round_type TEXT CHECK (round_type IN ('SAFE','Equity')) DEFAULT 'SAFE',
    ask_usd NUMERIC,
    use_of_funds JSONB,
    summary TEXT,
    status TEXT CHECK (status IN ('created','ingested','analyzing','valued','panel','decided','exported','archived')) DEFAULT 'created',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Pitch files
CREATE TABLE pitch_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    kind TEXT CHECK (kind IN ('deck','onepager','kpi','appendix')),
    s3_key TEXT NOT NULL,
    mime TEXT,
    size BIGINT,
    sha256 TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- KPIs
CREATE TABLE kpis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    period DATE,
    metric TEXT NOT NULL,
    value NUMERIC NOT NULL,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Assumptions
CREATE TABLE assumptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    source TEXT CHECK (source IN ('user','derived')) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Market models
CREATE TABLE market_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    method TEXT CHECK (method IN ('topdown','bottomup')),
    tam NUMERIC,
    sam NUMERIC,
    som NUMERIC,
    assumptions JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Unit economics
CREATE TABLE unit_economics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    ltv NUMERIC,
    cac NUMERIC,
    payback_months NUMERIC,
    gross_margin NUMERIC,
    burn_multiple NUMERIC,
    magic_number NUMERIC,
    rule_of_40 NUMERIC,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Valuations
CREATE TABLE valuations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    method TEXT CHECK (method IN ('scorecard','vc','comps','berkus','rfs')),
    inputs JSONB,
    result_low NUMERIC,
    result_base NUMERIC,
    result_high NUMERIC,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Scenarios
CREATE TABLE scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    name TEXT CHECK (name IN ('conservative','base','aggressive')),
    params JSONB,
    outputs JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Risks
CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    category TEXT,
    severity TEXT CHECK (severity IN ('low','medium','high','critical')),
    likelihood TEXT CHECK (likelihood IN ('low','medium','high')),
    description TEXT,
    mitigation TEXT,
    owner_role TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Panel transcripts
CREATE TABLE panel_transcripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    content TEXT,
    summary JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Decisions
CREATE TABLE decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    recommendation TEXT CHECK (recommendation IN ('yes','no','conditional')),
    check_size_usd NUMERIC,
    instrument TEXT CHECK (instrument IN ('SAFE','Equity')),
    pre_money_usd NUMERIC,
    post_money_usd NUMERIC,
    target_ownership NUMERIC,
    conditions TEXT[],
    rationale TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Term sheets
CREATE TABLE term_sheets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('SAFE','Equity')),
    params JSONB,
    docx_key TEXT,
    pdf_key TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Cap table
CREATE TABLE cap_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    pre_money NUMERIC,
    new_money NUMERIC,
    option_pool NUMERIC,
    table JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Comps library
CREATE TABLE comps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sector TEXT,
    stage TEXT,
    geo TEXT,
    multiple_name TEXT,
    p10 NUMERIC,
    p50 NUMERIC,
    p90 NUMERIC,
    sample INT,
    notes TEXT,
    embedding VECTOR(768),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id),
    body TEXT,
    anchor JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Exports
CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pitch_id UUID REFERENCES pitches(id) ON DELETE CASCADE,
    kind TEXT CHECK (kind IN ('memo','valuation_csv','term_sheet_pdf','zip')),
    s3_key TEXT,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log
CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    org_id UUID REFERENCES orgs(id),
    user_id UUID REFERENCES users(id),
    pitch_id UUID REFERENCES pitches(id),
    action TEXT NOT NULL,
    target TEXT,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_pitches_org_id ON pitches(org_id);
CREATE INDEX idx_pitches_status ON pitches(status);
CREATE INDEX idx_kpis_pitch_id_metric_period ON kpis(pitch_id, metric, period);
CREATE INDEX idx_valuations_pitch_id_method ON valuations(pitch_id, method);
CREATE INDEX idx_risks_pitch_id_severity ON risks(pitch_id, severity);
CREATE INDEX idx_comps_sector_stage_geo ON comps(sector, stage, geo);
CREATE INDEX idx_audit_log_org_id_created_at ON audit_log(org_id, created_at);

-- Vector index for comps embeddings
CREATE INDEX idx_comps_embedding ON comps USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Row Level Security (RLS) policies
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_economics ENABLE ROW LEVEL SECURITY;
ALTER TABLE valuations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE panel_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE term_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cap_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Sample data for testing
INSERT INTO orgs (id, name, plan) VALUES 
    (uuid_generate_v4(), 'Demo Fund', 'premium'),
    (uuid_generate_v4(), 'Test Accelerator', 'free');

-- Sample comps data
INSERT INTO comps (sector, stage, geo, multiple_name, p10, p50, p90, sample, notes) VALUES
    ('SaaS', 'seed', 'US', 'EV/ARR', 5, 15, 30, 50, 'SaaS seed stage comps'),
    ('Fintech', 'seed', 'US', 'EV/ARR', 8, 20, 40, 30, 'Fintech seed stage comps'),
    ('Healthtech', 'seed', 'US', 'EV/ARR', 6, 18, 35, 25, 'Healthtech seed stage comps');
