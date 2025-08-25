// Created automatically by Cursor AI (2024-12-19)

import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Org } from './org.entity';

@Entity('memberships')
export class Membership {
  @PrimaryColumn({ type: 'uuid' })
  user_id: string;

  @PrimaryColumn({ type: 'uuid' })
  org_id: string;

  @Column({ type: 'text' })
  workspace_role: 'owner' | 'admin' | 'investor' | 'analyst' | 'founder' | 'viewer';

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => User, user => user.memberships)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Org, org => org.users)
  @JoinColumn({ name: 'org_id' })
  org: Org;
}
