import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Collection } from '../collections/collection.entity';
import { Environment } from '../environments/environment.entity';
import { HistoryEntry } from '../history/history-entry.entity';

@Entity('workspaces')
@Index(['userId'])
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.workspaces, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Collection, (collection) => collection.workspace)
  collections: Collection[];

  @OneToMany(() => Environment, (env) => env.workspace)
  environments: Environment[];

  @OneToMany(() => HistoryEntry, (entry) => entry.workspace)
  historyEntries: HistoryEntry[];
}
