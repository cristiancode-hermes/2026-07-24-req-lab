import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryEntry } from './history-entry.entity';
import { CreateHistoryEntryDto } from './dto/history.dto';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(HistoryEntry)
    private readonly historyRepository: Repository<HistoryEntry>,
  ) {}

  async create(dto: CreateHistoryEntryDto): Promise<HistoryEntry> {
    const entry = this.historyRepository.create({
      ...dto,
      timestamp: new Date(),
    } as unknown as HistoryEntry);
    return this.historyRepository.save(entry) as unknown as HistoryEntry;
  }

  async findByWorkspace(
    workspaceId: string,
    page = 1,
    limit = 20,
  ): Promise<{ data: HistoryEntry[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.historyRepository.findAndCount({
      where: { workspaceId },
      order: { timestamp: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async findById(id: string): Promise<HistoryEntry | null> {
    return this.historyRepository.findOne({
      where: { id },
      relations: { workspace: true },
    });
  }

  async delete(id: string): Promise<void> {
    const result = await this.historyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('History entry not found');
    }
  }

  async clearByWorkspace(workspaceId: string): Promise<void> {
    await this.historyRepository.delete({ workspaceId });
  }
}
