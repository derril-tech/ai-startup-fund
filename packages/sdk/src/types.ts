// Created automatically by Cursor AI (2024-12-19)

export interface Pitch {
  id: string;
  title: string;
  stage: 'idea' | 'preseed' | 'seed' | 'A';
  sector: string;
  geo: string;
  round_type: 'SAFE' | 'Equity';
  ask_usd: number;
  use_of_funds: string[];
  summary: string;
  status: 'created' | 'ingested' | 'analyzing' | 'valued' | 'panel' | 'decided' | 'exported' | 'archived';
  created_by: string;
  created_at: string;
}

export interface KPI {
  id: string;
  pitch_id: string;
  period: string;
  metric: string;
  value: number;
  meta: Record<string, any>;
}

export interface Valuation {
  id: string;
  pitch_id: string;
  method: 'scorecard' | 'vc' | 'comps' | 'berkus' | 'rfs';
  inputs: Record<string, any>;
  result_low: number;
  result_base: number;
  result_high: number;
  notes: string;
  created_at: string;
}

export interface Risk {
  id: string;
  pitch_id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  description: string;
  mitigation: string;
  owner_role: string;
  created_at: string;
}

export interface Decision {
  id: string;
  pitch_id: string;
  recommendation: 'yes' | 'no' | 'conditional';
  check_size_usd: number;
  instrument: 'SAFE' | 'Equity';
  pre_money_usd: number;
  post_money_usd: number;
  target_ownership: number;
  conditions: string[];
  rationale: string;
  created_at: string;
}

export interface CapTable {
  id: string;
  pitch_id: string;
  pre_money: number;
  new_money: number;
  option_pool: number;
  table: CapTableEntry[];
  created_at: string;
}

export interface CapTableEntry {
  holder: string;
  class: string;
  pre_percentage: number;
  post_percentage: number;
  shares: number;
}

export interface TermSheet {
  id: string;
  pitch_id: string;
  type: 'SAFE' | 'Equity';
  params: Record<string, any>;
  docx_key: string;
  pdf_key: string;
  created_at: string;
}
