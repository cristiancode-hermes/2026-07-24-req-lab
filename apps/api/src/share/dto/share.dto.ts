import { IsUUID, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';

export class CreateShareDto {
  @ApiProperty()
  @IsUUID()
  collectionId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  expiresInDays?: number;
}

export class UpdateShareDto extends PartialType(CreateShareDto) {}
