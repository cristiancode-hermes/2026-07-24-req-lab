import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Environment } from './environment.entity';
import { CreateEnvironmentDto, UpdateEnvironmentDto } from './dto/environment.dto';

@Injectable()
export class EnvironmentsService {
  constructor(
    @InjectRepository(Environment)
    private readonly environmentsRepository: Repository<Environment>,
  ) {}

  async create(dto: CreateEnvironmentDto): Promise<Environment> {
    if (dto.isActive) {
      await this.deactivateOthers(dto.workspaceId);
    }
    const env = this.environmentsRepository.create(dto as unknown as Environment);
    return this.environmentsRepository.save(env) as unknown as Environment;
  }

  async findByWorkspace(workspaceId: string): Promise<Environment[]> {
    return this.environmentsRepository.find({
      where: { workspaceId },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(id: string): Promise<Environment | null> {
    return this.environmentsRepository.findOne({
      where: { id },
      relations: { workspace: true },
    });
  }

  async update(id: string, dto: UpdateEnvironmentDto): Promise<Environment> {
    const env = await this.findById(id);
    if (!env) {
      throw new NotFoundException('Environment not found');
    }
    if (dto.isActive && dto.workspaceId) {
      await this.deactivateOthers(dto.workspaceId);
    } else if (dto.isActive) {
      const existing = await this.findById(id);
      if (existing) {
        await this.deactivateOthers(existing.workspaceId);
      }
    }
    await this.environmentsRepository.update(id, dto);
    return (await this.findById(id)) as Environment;
  }

  async delete(id: string): Promise<void> {
    const result = await this.environmentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Environment not found');
    }
  }

  private async deactivateOthers(workspaceId: string): Promise<void> {
    await this.environmentsRepository.update(
      { workspaceId, isActive: true },
      { isActive: false },
    );
  }
}
