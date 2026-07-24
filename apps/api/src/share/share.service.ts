import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { CollectionShare } from './collection-share.entity';
import { CreateShareDto } from './dto/share.dto';
import { Collection } from '../collections/collection.entity';

@Injectable()
export class ShareService {
  constructor(
    @InjectRepository(CollectionShare)
    private readonly shareRepository: Repository<CollectionShare>,
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
  ) {}

  async create(dto: CreateShareDto): Promise<CollectionShare> {
    const existing = await this.shareRepository.findOne({
      where: { collectionId: dto.collectionId },
    });
    if (existing) {
      throw new BadRequestException('Collection already has a share link');
    }

    const collection = await this.collectionRepository.findOne({
      where: { id: dto.collectionId },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    const shareToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = dto.expiresInDays
      ? new Date(Date.now() + dto.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const share = this.shareRepository.create({
      collectionId: dto.collectionId,
      shareToken,
      expiresAt,
    } as unknown as CollectionShare);
    return this.shareRepository.save(share) as unknown as CollectionShare;
  }

  async getByToken(token: string): Promise<Collection> {
    const share = await this.shareRepository.findOne({
      where: { shareToken: token },
      relations: { collection: true },
    });
    if (!share) {
      throw new NotFoundException('Share link not found');
    }
    if (share.expiresAt && new Date() > share.expiresAt) {
      throw new BadRequestException('Share link has expired');
    }
    const collection = await this.collectionRepository.findOne({
      where: { id: share.collectionId },
      relations: { requests: true },
    });
    if (!collection) {
      throw new NotFoundException('Shared collection not found');
    }
    return collection;
  }

  async revoke(collectionId: string): Promise<void> {
    const result = await this.shareRepository.delete({ collectionId });
    if (result.affected === 0) {
      throw new NotFoundException('Share link not found');
    }
  }

  async findByCollection(collectionId: string): Promise<CollectionShare | null> {
    return this.shareRepository.findOne({
      where: { collectionId },
    });
  }
}
