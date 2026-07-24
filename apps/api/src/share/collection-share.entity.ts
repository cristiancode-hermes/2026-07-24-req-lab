import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Collection } from '../collections/collection.entity';

@Entity('collection_shares')
@Index(['shareToken'], { unique: true })
export class CollectionShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  collectionId: string;

  @ManyToOne(() => Collection, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'collectionId' })
  collection: Collection;

  @Column({ length: 64, unique: true })
  shareToken: string;

  @Column({ nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
