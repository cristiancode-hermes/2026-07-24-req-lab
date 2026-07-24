import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProxyService } from './proxy.service';
import { ProxyRequestDto } from './dto/proxy.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Proxy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post()
  execute(@Body() dto: ProxyRequestDto) {
    return this.proxyService.execute(dto);
  }
}
