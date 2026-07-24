import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ImportExportService } from './import-export.service';
import { ImportPostmanDto } from './dto/import-export.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Import-Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('import-export')
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  @Get('export/:collectionId')
  async exportCollection(
    @Param('collectionId') collectionId: string,
    @Res() res: Response,
  ) {
    const result = await this.importExportService.exportCollection(collectionId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="collection-${collectionId}.json"`,
    );
    res.json(result);
  }

  @Post('import')
  importCollection(@Body() dto: ImportPostmanDto) {
    return this.importExportService.importCollection(
      dto.workspaceId,
      dto.collection,
    );
  }
}
