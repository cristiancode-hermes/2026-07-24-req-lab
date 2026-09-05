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
import { Workspace } from '../workspaces/workspace.entity';
import { Request } from '../requests/request.entity';

@Entity('collections')
@Index(['workspaceId'])
@Index(['parentId'])
export class Collection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  workspaceId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.collections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;

  @Column({ nullable: true, type: 'text' })
  parentId: string | null;

  @ManyToOne(() => Collection, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parentId' })
  parent: Collection | null;

  @OneToMany(() => Collection, (collection) => collection.parent)
  children: Collection[];

  @Column()
  name: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Request, (request) => request.collection)
  requests: Request[];
}
