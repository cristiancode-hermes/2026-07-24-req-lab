import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsInt,
  IsUUID,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class CreateHistoryEntryDto {
  @ApiProperty()
  @IsUUID()
  workspaceId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  requestId?: string;

  @ApiProperty({ example: 'GET' })
  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
  method: string;

  @ApiProperty({ example: 'https://api.example.com/users' })
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  requestHeaders?: Record<string, string>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  requestBody?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  responseStatus?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responseStatusText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  responseHeaders?: Record<string, string>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responseBody?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  responseSize?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  timingMs?: number;
}

export class UpdateHistoryEntryDto extends PartialType(CreateHistoryEntryDto) {}
