// Created automatically by Cursor AI (2024-12-19)

import { z } from 'zod';

export const PitchSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  stage: z.enum(['idea', 'preseed', 'seed', 'A']),
  sector: z.string().min(1),
  geo: z.string().min(1),
  round_type: z.enum(['SAFE', 'Equity']),
  ask_usd: z.number().positive(),
  use_of_funds: z.array(z.string()),
  summary: z.string().min(1),
  status: z.enum(['created', 'ingested', 'analyzing', 'valued', 'panel', 'decided', 'exported', 'archived']),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
});

export const CreatePitchSchema = PitchSchema.omit({ id: true, created_by: true, created_at: true });

export const KPISchema = z.object({
  id: z.string().uuid(),
  pitch_id: z.string().uuid(),
  period: z.string(),
  metric: z.string(),
  value: z.number(),
  meta: z.record(z.any()),
});

export const ValuationSchema = z.object({
  id: z.string().uuid(),
  pitch_id: z.string().uuid(),
  method: z.enum(['scorecard', 'vc', 'comps', 'berkus', 'rfs']),
  inputs: z.record(z.any()),
  result_low: z.number(),
  result_base: z.number(),
  result_high: z.number(),
  notes: z.string(),
  created_at: z.string().datetime(),
});

export const RiskSchema = z.object({
  id: z.string().uuid(),
  pitch_id: z.string().uuid(),
  category: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  likelihood: z.enum(['low', 'medium', 'high']),
  description: z.string(),
  mitigation: z.string(),
  owner_role: z.string(),
  created_at: z.string().datetime(),
});

export const DecisionSchema = z.object({
  id: z.string().uuid(),
  pitch_id: z.string().uuid(),
  recommendation: z.enum(['yes', 'no', 'conditional']),
  check_size_usd: z.number().positive(),
  instrument: z.enum(['SAFE', 'Equity']),
  pre_money_usd: z.number().positive(),
  post_money_usd: z.number().positive(),
  target_ownership: z.number().min(0).max(1),
  conditions: z.array(z.string()),
  rationale: z.string(),
  created_at: z.string().datetime(),
});
