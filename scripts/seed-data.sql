-- Created automatically by Cursor AI (2024-12-19)
-- Seed data for AI Startup Fund application

-- Sample Organizations
INSERT INTO orgs (id, name, slug, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'TechVentures Capital', 'techventures', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'Innovation Fund', 'innovation-fund', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'Startup Accelerator', 'startup-accelerator', NOW(), NOW());

-- Sample Users
INSERT INTO users (id, org_id, email, name, role, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'john@techventures.com', 'John Smith', 'investor', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'sarah@techventures.com', 'Sarah Johnson', 'analyst', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'mike@innovation.com', 'Mike Chen', 'investor', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'lisa@accelerator.com', 'Lisa Rodriguez', 'founder', NOW(), NOW());

-- Sample Pitches
INSERT INTO pitches (id, org_id, title, description, stage, sector, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', 'CloudFlow - SaaS Analytics Platform', 'Enterprise-grade analytics platform for SaaS companies', 'Series A', 'SaaS', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440002', 'FinTechPro - Payment Processing', 'Next-generation payment processing for small businesses', 'Seed', 'FinTech', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440003', 'HealthAI - Medical Diagnostics', 'AI-powered medical diagnostics platform', 'Series B', 'HealthTech', NOW(), NOW());

-- Sample KPIs for CloudFlow (SaaS)
INSERT INTO kpis (id, pitch_id, metric_name, value, unit, period, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440020', 'ARR', 2500000, 'USD', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440020', 'ARR', 1800000, 'USD', '2023-01', NOW()),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440020', 'ARR', 1200000, 'USD', '2022-01', NOW()),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440020', 'Customer Count', 150, 'customers', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440020', 'Customer Count', 100, 'customers', '2023-01', NOW()),
('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440020', 'Customer Count', 60, 'customers', '2022-01', NOW()),
('550e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440020', 'Gross Margin', 85, 'percent', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440020', 'CAC', 5000, 'USD', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440020', 'LTV', 50000, 'USD', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440020', 'Churn Rate', 5, 'percent', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440020', 'Burn Rate', 200000, 'USD', '2024-01', NOW());

-- Sample KPIs for FinTechPro (FinTech)
INSERT INTO kpis (id, pitch_id, metric_name, value, unit, period, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440021', 'GMV', 50000000, 'USD', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440021', 'GMV', 30000000, 'USD', '2023-01', NOW()),
('550e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440021', 'Revenue', 2500000, 'USD', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440021', 'Revenue', 1500000, 'USD', '2023-01', NOW()),
('550e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440021', 'Merchant Count', 5000, 'merchants', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440021', 'Merchant Count', 3000, 'merchants', '2023-01', NOW()),
('550e8400-e29b-41d4-a716-446655440047', '550e8400-e29b-41d4-a716-446655440021', 'Take Rate', 5, 'percent', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440048', '550e8400-e29b-41d4-a716-446655440021', 'CAC', 200, 'USD', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440049', '550e8400-e29b-41d4-a716-446655440021', 'LTV', 2000, 'USD', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440021', 'Burn Rate', 150000, 'USD', '2024-01', NOW());

-- Sample KPIs for HealthAI (HealthTech)
INSERT INTO kpis (id, pitch_id, metric_name, value, unit, period, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440022', 'Revenue', 8000000, 'USD', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440022', 'Revenue', 5000000, 'USD', '2023-01', NOW()),
('550e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440022', 'Revenue', 2000000, 'USD', '2022-01', NOW()),
('550e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440022', 'Hospital Partners', 25, 'hospitals', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440055', '550e8400-e29b-41d4-a716-446655440022', 'Hospital Partners', 15, 'hospitals', '2023-01', NOW()),
('550e8400-e29b-41d4-a716-446655440056', '550e8400-e29b-41d4-a716-446655440022', 'Diagnoses Per Month', 50000, 'diagnoses', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440057', '550e8400-e29b-41d4-a716-446655440022', 'Diagnoses Per Month', 30000, 'diagnoses', '2023-01', NOW()),
('550e8400-e29b-41d4-a716-446655440058', '550e8400-e29b-41d4-a716-446655440022', 'Accuracy Rate', 95, 'percent', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440059', '550e8400-e29b-41d4-a716-446655440022', 'Gross Margin', 70, 'percent', '2024-01', NOW()),
('550e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440022', 'Burn Rate', 500000, 'USD', '2024-01', NOW());

-- Sample Comps Data (Comparables)
INSERT INTO comps (id, company_name, sector, stage, ev_revenue, ev_ebitda, revenue, ebitda, created_at) VALUES
-- SaaS Comps
('550e8400-e29b-41d4-a716-446655440070', 'Salesforce', 'SaaS', 'Public', 8.5, 25.0, 30000000000, 1200000000, NOW()),
('550e8400-e29b-41d4-a716-446655440071', 'HubSpot', 'SaaS', 'Public', 12.0, 35.0, 2000000000, 80000000, NOW()),
('550e8400-e29b-41d4-a716-446655440072', 'Zoom', 'SaaS', 'Public', 6.0, 20.0, 4000000000, 200000000, NOW()),
('550e8400-e29b-41d4-a716-446655440073', 'Slack', 'SaaS', 'Public', 15.0, 45.0, 1000000000, 50000000, NOW()),
('550e8400-e29b-41d4-a716-446655440074', 'Notion', 'SaaS', 'Private', 20.0, 60.0, 500000000, 25000000, NOW()),
('550e8400-e29b-41d4-a716-446655440075', 'Figma', 'SaaS', 'Private', 25.0, 75.0, 400000000, 20000000, NOW()),

-- FinTech Comps
('550e8400-e29b-41d4-a716-446655440076', 'Stripe', 'FinTech', 'Private', 8.0, 30.0, 14000000000, 400000000, NOW()),
('550e8400-e29b-41d4-a716-446655440077', 'Square', 'FinTech', 'Public', 6.5, 25.0, 17000000000, 600000000, NOW()),
('550e8400-e29b-41d4-a716-446655440078', 'PayPal', 'FinTech', 'Public', 5.0, 20.0, 25000000000, 1000000000, NOW()),
('550e8400-e29b-41d4-a716-446655440079', 'Adyen', 'FinTech', 'Public', 12.0, 40.0, 6000000000, 200000000, NOW()),
('550e8400-e29b-41d4-a716-446655440080', 'Plaid', 'FinTech', 'Private', 15.0, 50.0, 2000000000, 80000000, NOW()),

-- HealthTech Comps
('550e8400-e29b-41d4-a716-446655440081', 'Teladoc', 'HealthTech', 'Public', 4.0, 15.0, 2000000000, 100000000, NOW()),
('550e8400-e29b-41d4-a716-446655440082', 'Doximity', 'HealthTech', 'Public', 8.0, 25.0, 400000000, 15000000, NOW()),
('550e8400-e29b-41d4-a716-446655440083', 'Butterfly Network', 'HealthTech', 'Public', 6.0, 20.0, 100000000, 5000000, NOW()),
('550e8400-e29b-41d4-a716-446655440084', 'Tempus', 'HealthTech', 'Private', 10.0, 35.0, 500000000, 20000000, NOW()),
('550e8400-e29b-41d4-a716-446655440085', 'Insitro', 'HealthTech', 'Private', 12.0, 40.0, 300000000, 15000000, NOW());

-- Sample Valuations
INSERT INTO valuations (id, pitch_id, method, valuation, confidence, notes, created_at) VALUES
-- CloudFlow Valuations
('550e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440020', 'scorecard', 20000000, 'medium', 'Strong team and market, good traction', NOW()),
('550e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440020', 'comps', 21250000, 'high', 'Based on SaaS comps with 8.5x revenue multiple', NOW()),
('550e8400-e29b-41d4-a716-446655440092', '550e8400-e29b-41d4-a716-446655440020', 'vc_method', 18000000, 'medium', 'Target 25% IRR over 5 years', NOW()),

-- FinTechPro Valuations
('550e8400-e29b-41d4-a716-446655440093', '550e8400-e29b-41d4-a716-446655440021', 'scorecard', 15000000, 'medium', 'Good market opportunity, early stage', NOW()),
('550e8400-e29b-41d4-a716-446655440094', '550e8400-e29b-41d4-a716-446655440021', 'comps', 12500000, 'medium', 'Based on FinTech comps with 5.0x revenue multiple', NOW()),
('550e8400-e29b-41d4-a716-446655440095', '550e8400-e29b-41d4-a716-446655440021', 'berkus', 2500000, 'high', 'Prototype, quality team, and sales traction', NOW()),

-- HealthAI Valuations
('550e8400-e29b-41d4-a716-446655440096', '550e8400-e29b-41d4-a716-446655440022', 'scorecard', 40000000, 'high', 'Excellent team, large market, strong traction', NOW()),
('550e8400-e29b-41d4-a716-446655440097', '550e8400-e29b-41d4-a716-446655440022', 'comps', 56000000, 'medium', 'Based on HealthTech comps with 7.0x revenue multiple', NOW()),
('550e8400-e29b-41d4-a716-446655440098', '550e8400-e29b-41d4-a716-446655440022', 'vc_method', 45000000, 'medium', 'Target 30% IRR over 4 years', NOW());

-- Sample Risk Assessments
INSERT INTO risk_assessments (id, pitch_id, category, risk_name, severity, likelihood, mitigation, owner, created_at) VALUES
-- CloudFlow Risks
('550e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440020', 'market', 'Competition from established players', 'medium', 'high', 'Focus on specific verticals and superior UX', 'Product Team', NOW()),
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440020', 'technical', 'Data security and compliance', 'high', 'medium', 'Implement SOC 2 and GDPR compliance', 'CTO', NOW()),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440020', 'team', 'Key employee retention', 'medium', 'medium', 'Implement equity vesting and competitive compensation', 'CEO', NOW()),

-- FinTechPro Risks
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440021', 'regulatory', 'Payment processing regulations', 'high', 'high', 'Engage regulatory consultants and legal team', 'Compliance Officer', NOW()),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440021', 'market', 'Economic downturn impact', 'medium', 'medium', 'Diversify customer base and reduce dependency', 'Sales Team', NOW()),
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440021', 'technical', 'System scalability', 'medium', 'low', 'Invest in cloud infrastructure and load testing', 'CTO', NOW()),

-- HealthAI Risks
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440022', 'regulatory', 'FDA approval requirements', 'high', 'high', 'Engage regulatory consultants and plan clinical trials', 'Regulatory Affairs', NOW()),
('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440022', 'technical', 'AI model accuracy and bias', 'high', 'medium', 'Implement rigorous testing and validation protocols', 'AI Team', NOW()),
('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440022', 'market', 'Healthcare adoption barriers', 'medium', 'high', 'Focus on value proposition and pilot programs', 'Sales Team', NOW());

-- Sample Panel Simulations
INSERT INTO panel_simulations (id, pitch_id, transcript, decision_summary, conditions, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440020', 
'Angel: "I love the SaaS model and the team looks solid. The ARR growth is impressive at 39% YoY."
VC: "The market is crowded but they have a clear differentiation. I''m concerned about the burn rate though."
Risk: "The churn rate of 5% is acceptable for enterprise SaaS, but we need to monitor it closely."
Founder: "We''re addressing the burn rate by improving unit economics and expanding into new markets."',
'Recommendation: Invest
Check Size: $5M
Confidence: High
Key Factors: Strong growth, experienced team, clear market opportunity',
'["Monthly board meetings for first 6 months", "Hire VP of Sales within 3 months", "Achieve 20% reduction in burn rate by Q3"]',
NOW()),

('550e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440021',
'Angel: "The payment space is huge but very competitive. I like their focus on SMBs."
VC: "The GMV growth is strong but the take rate seems low compared to competitors."
Risk: "Regulatory risks are significant in fintech. Need to ensure compliance team is in place."
Founder: "We''re working on increasing take rate through value-added services."',
'Recommendation: Invest with conditions
Check Size: $2M
Confidence: Medium
Key Factors: Large market, regulatory concerns, early stage',
'["Hire compliance officer within 2 months", "Achieve 7% take rate by end of year", "Obtain necessary licenses"]',
NOW()),

('550e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440022',
'Angel: "Healthcare AI is the future. The accuracy rate of 95% is impressive."
VC: "The regulatory path is clear but expensive. Need to ensure sufficient runway."
Risk: "FDA approval is the biggest risk. Timeline and costs need careful monitoring."
Founder: "We have a clear regulatory strategy and sufficient funding for clinical trials."',
'Recommendation: Invest
Check Size: $10M
Confidence: High
Key Factors: Strong technology, large market, clear regulatory path',
'["Achieve FDA approval within 18 months", "Expand to 50 hospital partners by end of year", "Maintain 95%+ accuracy rate"]',
NOW());

-- Sample Investment Decisions
INSERT INTO investment_decisions (id, pitch_id, recommendation, check_size, instrument_type, pre_money_valuation, target_ownership, conditions, rationale, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440120', '550e8400-e29b-41d4-a716-446655440020', 'invest', 5000000, 'equity', 20000000, 20.0, '["Monthly board meetings", "Hire VP Sales", "Reduce burn rate"]', 'Strong SaaS metrics, experienced team, clear market opportunity', NOW()),
('550e8400-e29b-41d4-a716-446655440121', '550e8400-e29b-41d4-a716-446655440021', 'invest_conditional', 2000000, 'safe', 15000000, 12.0, '["Hire compliance officer", "Increase take rate", "Obtain licenses"]', 'Large market opportunity but regulatory risks require careful management', NOW()),
('550e8400-e29b-41d4-a716-446655440122', '550e8400-e29b-41d4-a716-446655440022', 'invest', 10000000, 'equity', 40000000, 20.0, '["FDA approval", "Expand partnerships", "Maintain accuracy"]', 'Breakthrough technology in large healthcare market with clear regulatory path', NOW());

-- Sample Cap Tables
INSERT INTO cap_tables (id, pitch_id, holder_name, shares, ownership_percentage, share_type, liquidation_preference, created_at) VALUES
-- CloudFlow Cap Table
('550e8400-e29b-41d4-a716-446655440130', '550e8400-e29b-41d4-a716-446655440020', 'Founder', 8000000, 80.0, 'common', 1.0, NOW()),
('550e8400-e29b-41d4-a716-446655440131', '550e8400-e29b-41d4-a716-446655440020', 'Employee Pool', 2000000, 20.0, 'common', 1.0, NOW()),

-- FinTechPro Cap Table
('550e8400-e29b-41d4-a716-446655440132', '550e8400-e29b-41d4-a716-446655440021', 'Founder', 7000000, 70.0, 'common', 1.0, NOW()),
('550e8400-e29b-41d4-a716-446655440133', '550e8400-e29b-41d4-a716-446655440021', 'Angel Investors', 2000000, 20.0, 'preferred', 1.5, NOW()),
('550e8400-e29b-41d4-a716-446655440134', '550e8400-e29b-41d4-a716-446655440021', 'Employee Pool', 1000000, 10.0, 'common', 1.0, NOW()),

-- HealthAI Cap Table
('550e8400-e29b-41d4-a716-446655440135', '550e8400-e29b-41d4-a716-446655440022', 'Founder', 6000000, 60.0, 'common', 1.0, NOW()),
('550e8400-e29b-41d4-a716-446655440136', '550e8400-e29b-41d4-a716-446655440022', 'Series A Investors', 3000000, 30.0, 'preferred', 1.5, NOW()),
('550e8400-e29b-41d4-a716-446655440137', '550e8400-e29b-41d4-a716-446655440022', 'Employee Pool', 1000000, 10.0, 'common', 1.0, NOW());

-- Sample Term Sheets
INSERT INTO term_sheets (id, pitch_id, instrument_type, investment_amount, pre_money_valuation, post_money_valuation, liquidation_preference, anti_dilution, board_seats, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440140', '550e8400-e29b-41d4-a716-446655440020', 'equity', 5000000, 20000000, 25000000, 1.0, true, 1, NOW()),
('550e8400-e29b-41d4-a716-446655440141', '550e8400-e29b-41d4-a716-446655440021', 'safe', 2000000, 15000000, 17000000, 1.0, false, 0, NOW()),
('550e8400-e29b-41d4-a716-446655440142', '550e8400-e29b-41d4-a716-446655440022', 'equity', 10000000, 40000000, 50000000, 1.5, true, 2, NOW());

-- Sample Export Bundles
INSERT INTO export_bundles (id, pitch_id, bundle_type, file_count, total_size_bytes, expires_at, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440150', '550e8400-e29b-41d4-a716-446655440020', 'full_analysis', 8, 2048576, NOW() + INTERVAL '365 days', NOW()),
('550e8400-e29b-41d4-a716-446655440151', '550e8400-e29b-41d4-a716-446655440021', 'valuation_only', 3, 1048576, NOW() + INTERVAL '180 days', NOW()),
('550e8400-e29b-41d4-a716-446655440152', '550e8400-e29b-41d4-a716-446655440022', 'full_analysis', 10, 3145728, NOW() + INTERVAL '365 days', NOW());
