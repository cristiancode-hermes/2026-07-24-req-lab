import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from './request.entity';
import { CreateRequestDto, UpdateRequestDto } from './dto/request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
  ) {}

  async create(dto: CreateRequestDto): Promise<Request> {
    const request = this.requestsRepository.create(dto as unknown as Request);
    return this.requestsRepository.save(request) as unknown as Request;
  }

  async findByCollection(collectionId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: { collectionId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<Request | null> {
    return this.requestsRepository.findOne({
      where: { id },
      relations: { collection: true },
    });
  }

  async update(id: string, dto: UpdateRequestDto): Promise<Request> {
    const request = await this.findById(id);
    if (!request) {
      throw new NotFoundException('Request not found');
    }
    await this.requestsRepository.update(id, dto);
    return (await this.findById(id)) as Request;
  }

  async delete(id: string): Promise<void> {
    const result = await this.requestsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Request not found');
    }
  }
}
