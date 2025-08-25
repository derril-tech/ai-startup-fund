// Created automatically by Cursor AI (2024-12-19)

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pitch } from './pitch.entity';

@Entity('valuations')
export class Valuation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pitch_id: string;

  @Column({ type: 'text' })
  method: 'scorecard' | 'vc' | 'comps' | 'berkus' | 'rfs';

  @Column({ type: 'jsonb', nullable: true })
  inputs: Record<string, any>;

  @Column({ type: 'numeric', nullable: true })
  result_low: number;

  @Column({ type: 'numeric', nullable: true })
  result_base: number;

  @Column({ type: 'numeric', nullable: true })
  result_high: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => Pitch, pitch => pitch.valuations)
  @JoinColumn({ name: 'pitch_id' })
  pitch: Pitch;
}
