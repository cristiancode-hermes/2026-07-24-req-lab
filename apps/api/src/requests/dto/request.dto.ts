import {
  IsString,
  IsOptional,
  IsArray,
  IsObject,
  IsIn,
  IsInt,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';

class KeyValueDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  value?: string;
}

export class CreateRequestDto {
  @ApiProperty()
  @IsUUID()
  collectionId: string;

  @ApiProperty({ example: 'Get Users' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ default: 'GET' })
  @IsOptional()
  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])
  method?: string;

  @ApiProperty({ example: 'https://api.example.com/users' })
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyValueDto)
  params?: Record<string, string>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KeyValueDto)
  headers?: Record<string, string>[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  body?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  auth?: Record<string, any>;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

export class UpdateRequestDto extends PartialType(CreateRequestDto) {}
