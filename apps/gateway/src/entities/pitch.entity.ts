// Created automatically by Cursor AI (2024-12-19)

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Org } from './org.entity';
import { User } from './user.entity';
import { PitchFile } from './pitch-file.entity';
import { KPI } from './kpi.entity';
import { Valuation } from './valuation.entity';

@Entity('pitches')
export class Pitch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  org_id: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', default: 'idea' })
  stage: 'idea' | 'preseed' | 'seed' | 'A';

  @Column({ type: 'text', nullable: true })
  sector: string;

  @Column({ type: 'text', nullable: true })
  geo: string;

  @Column({ type: 'text', default: 'SAFE' })
  round_type: 'SAFE' | 'Equity';

  @Column({ type: 'numeric', nullable: true })
  ask_usd: number;

  @Column({ type: 'jsonb', nullable: true })
  use_of_funds: string[];

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', default: 'created' })
  status: 'created' | 'ingested' | 'analyzing' | 'valued' | 'panel' | 'decided' | 'exported' | 'archived';

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => Org, org => org.pitches)
  @JoinColumn({ name: 'org_id' })
  org: Org;

  @ManyToOne(() => User, user => user.pitches)
  @JoinColumn({ name: 'created_by' })
  created_by_user: User;

  @OneToMany(() => PitchFile, file => file.pitch)
  files: PitchFile[];

  @OneToMany(() => KPI, kpi => kpi.pitch)
  kpis: KPI[];

  @OneToMany(() => Valuation, valuation => valuation.pitch)
  valuations: Valuation[];
}
