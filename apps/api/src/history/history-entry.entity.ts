import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Workspace } from '../workspaces/workspace.entity';

@Entity('history_entries')
@Index(['workspaceId'])
@Index(['timestamp'])
export class HistoryEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspaceId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.historyEntries, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column({ nullable: true, type: 'text' })
  requestId: string | null;

  @Column()
  method: string;

  @Column()
  url: string;

  @Column('simple-json', { default: [] })
  requestHeaders: Record<string, string>[];

  @Column('simple-json', { nullable: true })
  requestBody: Record<string, any> | null;

  @Column({ nullable: true })
  responseStatus: number;

  @Column({ nullable: true })
  responseStatusText: string;

  @Column('simple-json', { default: [] })
  responseHeaders: Record<string, string>[];

  @Column('text', { nullable: true })
  responseBody: string | null;

  @Column({ nullable: true })
  responseSize: number;

  @Column({ nullable: true })
  timingMs: number;

  @Column({ type: 'datetime' })
  timestamp: Date;
}
