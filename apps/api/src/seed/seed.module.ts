import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { SeedService } from './seed.service';
import { User } from '../users/user.entity';
import { Workspace } from '../workspaces/workspace.entity';
import { Collection } from '../collections/collection.entity';
import { Request } from '../requests/request.entity';
import { Environment } from '../environments/environment.entity';
import { HistoryEntry } from '../history/history-entry.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Workspace,
      Collection,
      Request,
      Environment,
      HistoryEntry,
    ]),
    ConfigModule,
  ],
  providers: [SeedService],
})
export class SeedModule implements OnModuleInit {
  constructor(private readonly seedService: SeedService) {}

  async onModuleInit() {
    await this.seedService.seed();
  }
}
