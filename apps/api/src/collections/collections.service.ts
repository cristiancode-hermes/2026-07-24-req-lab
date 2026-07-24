import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from './collection.entity';
import { CreateCollectionDto, UpdateCollectionDto } from './dto/collection.dto';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionsRepository: Repository<Collection>,
  ) {}

  async create(dto: CreateCollectionDto): Promise<Collection> {
    const collection = this.collectionsRepository.create(dto as unknown as Collection);
    return this.collectionsRepository.save(collection) as unknown as Collection;
  }

  async findByWorkspace(workspaceId: string): Promise<Collection[]> {
    return this.collectionsRepository.find({
      where: { workspaceId },
      relations: { children: true, requests: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findById(id: string): Promise<Collection | null> {
    return this.collectionsRepository.findOne({
      where: { id },
      relations: { workspace: true, parent: true, children: true, requests: true },
    });
  }

  async update(id: string, dto: UpdateCollectionDto): Promise<Collection> {
    const collection = await this.findById(id);
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    await this.collectionsRepository.update(id, dto);
    return (await this.findById(id)) as Collection;
  }

  async delete(id: string): Promise<void> {
    const result = await this.collectionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Collection not found');
    }
  }
}
