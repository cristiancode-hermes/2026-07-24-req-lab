import { IsString, IsOptional, IsArray, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class CreateEnvironmentDto {
  @ApiProperty()
  @IsUUID()
  workspaceId: string;

  @ApiProperty({ example: 'Development' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  variables?: Record<string, string>[];

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateEnvironmentDto extends PartialType(CreateEnvironmentDto) {}
