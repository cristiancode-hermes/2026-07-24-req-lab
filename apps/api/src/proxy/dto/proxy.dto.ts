import { IsString, IsOptional, IsObject, IsIn, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProxyRequestDto {
  @ApiProperty({ example: 'GET' })
  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
  method: string;

  @ApiProperty({ example: 'https://api.example.com/users' })
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  body?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  params?: Record<string, string>;
}

export class ProxyResponseDto {
  @ApiProperty()
  status: number;

  @ApiProperty()
  statusText: string;

  @ApiProperty()
  headers: Record<string, string>;

  @ApiProperty()
  body: string;

  @ApiProperty()
  timing: number;
}
