import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Collection } from '../collections/collection.entity';

@Entity('requests')
@Index(['collectionId'])
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  collectionId: string;

  @ManyToOne(() => Collection, (collection) => collection.requests, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'collectionId' })
  collection: Collection;

  @Column()
  name: string;

  @Column({ default: 'GET' })
  method: string;

  @Column()
  url: string;

  @Column('simple-json', { default: [] })
  params: Record<string, string>[];

  @Column('simple-json', { default: [] })
  headers: Record<string, string>[];

  @Column('simple-json', { nullable: true })
  body: Record<string, any> | null;

  @Column('simple-json', { nullable: true })
  auth: Record<string, any> | null;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
