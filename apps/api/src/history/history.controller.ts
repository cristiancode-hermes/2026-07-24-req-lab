import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { HistoryService } from './history.service';
import { CreateHistoryEntryDto } from './dto/history.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DefaultValuePipe, ParseIntPipe } from '@nestjs/common';

@ApiTags('History')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  create(@Body() dto: CreateHistoryEntryDto) {
    return this.historyService.create(dto);
  }

  @Get('workspace/:workspaceId')
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.historyService.findByWorkspace(workspaceId, page, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historyService.findById(id);
  }

  @Delete('workspace/:workspaceId')
  clearByWorkspace(@Param('workspaceId') workspaceId: string) {
    return this.historyService.clearByWorkspace(workspaceId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historyService.delete(id);
  }
}
