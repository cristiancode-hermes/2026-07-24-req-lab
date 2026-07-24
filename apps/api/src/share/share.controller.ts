import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ShareService } from './share.service';
import { CreateShareDto } from './dto/share.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Share')
@Controller('share')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(@Body() dto: CreateShareDto) {
    return this.shareService.create(dto);
  }

  @Get('token/:token')
  getByToken(@Param('token') token: string) {
    return this.shareService.getByToken(token);
  }

  @Get('collection/:collectionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  findByCollection(@Param('collectionId') collectionId: string) {
    return this.shareService.findByCollection(collectionId);
  }

  @Delete(':collectionId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  revoke(@Param('collectionId') collectionId: string) {
    return this.shareService.revoke(collectionId);
  }
}
