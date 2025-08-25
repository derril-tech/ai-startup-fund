// Created automatically by Cursor AI (2024-12-19)

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Pitch } from './pitch.entity';

@Entity('orgs')
export class Org {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', default: 'free' })
  plan: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @OneToMany(() => User, user => user.org)
  users: User[];

  @OneToMany(() => Pitch, pitch => pitch.org)
  pitches: Pitch[];
}
