import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './workspace.entity';
import { CreateWorkspaceDto, UpdateWorkspaceDto } from './dto/workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspacesRepository: Repository<Workspace>,
  ) {}

  async create(userId: string, dto: CreateWorkspaceDto): Promise<Workspace> {
    const workspace = this.workspacesRepository.create({
      ...dto,
      userId,
    } as unknown as Workspace);
    return this.workspacesRepository.save(workspace) as unknown as Workspace;
  }

  async findByUser(userId: string): Promise<Workspace[]> {
    return this.workspacesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Workspace | null> {
    return this.workspacesRepository.findOne({
      where: { id },
      relations: { user: true },
    });
  }

  async update(id: string, dto: UpdateWorkspaceDto): Promise<Workspace> {
    const workspace = await this.findById(id);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    await this.workspacesRepository.update(id, dto);
    return (await this.findById(id)) as Workspace;
  }

  async delete(id: string): Promise<void> {
    const result = await this.workspacesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Workspace not found');
    }
  }
}
