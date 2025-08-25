// Created automatically by Cursor AI (2024-12-19)

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pitch } from './pitch.entity';

@Entity('kpis')
export class KPI {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pitch_id: string;

  @Column({ type: 'date', nullable: true })
  period: Date;

  @Column({ type: 'text' })
  metric: string;

  @Column({ type: 'numeric' })
  value: number;

  @Column({ type: 'jsonb', nullable: true })
  meta: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => Pitch, pitch => pitch.kpis)
  @JoinColumn({ name: 'pitch_id' })
  pitch: Pitch;
}
