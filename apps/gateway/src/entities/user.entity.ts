// Created automatically by Cursor AI (2024-12-19)

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Org } from './org.entity';
import { Pitch } from './pitch.entity';
import { Membership } from './membership.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  org_id: string;

  @Column({ type: 'citext', unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  name: string;

  @Column({ type: 'text', default: 'user' })
  role: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => Org, org => org.users)
  @JoinColumn({ name: 'org_id' })
  org: Org;

  @OneToMany(() => Pitch, pitch => pitch.created_by_user)
  pitches: Pitch[];

  @OneToMany(() => Membership, membership => membership.user)
  memberships: Membership[];
}
