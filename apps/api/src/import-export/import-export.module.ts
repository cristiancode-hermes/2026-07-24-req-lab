import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportExportController } from './import-export.controller';
import { ImportExportService } from './import-export.service';
import { Collection } from '../collections/collection.entity';
import { Request } from '../requests/request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Collection, Request])],
  controllers: [ImportExportController],
  providers: [ImportExportService],
  exports: [ImportExportService],
})
export class ImportExportModule {}
