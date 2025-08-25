// Created automatically by Cursor AI (2024-12-19)

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pitch } from './pitch.entity';

@Entity('pitch_files')
export class PitchFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  pitch_id: string;

  @Column({ type: 'text' })
  kind: 'deck' | 'onepager' | 'kpi' | 'appendix';

  @Column({ type: 'text' })
  s3_key: string;

  @Column({ type: 'text', nullable: true })
  mime: string;

  @Column({ type: 'bigint', nullable: true })
  size: number;

  @Column({ type: 'text', nullable: true })
  sha256: string;

  @CreateDateColumn({ type: 'timestamptz' })
  uploaded_at: Date;

  @ManyToOne(() => Pitch, pitch => pitch.files)
  @JoinColumn({ name: 'pitch_id' })
  pitch: Pitch;
}
