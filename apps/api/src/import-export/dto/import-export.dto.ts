import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PostmanCollection {
  info: {
    name: string;
    schema: string;
  };
  item: PostmanItem[];
}

export class PostmanItem {
  name: string;
  request: {
    method: string;
    url: {
      raw: string;
      protocol?: string;
      host?: string[];
      path?: string[];
      query?: { key: string; value: string }[];
    };
    header?: { key: string; value: string }[];
    body?: {
      mode: string;
      raw?: string;
    };
  };
  response?: any[];
}

export class ImportPostmanDto {
  @ApiProperty()
  @IsObject()
  collection: PostmanCollection;

  @ApiProperty()
  @IsString()
  workspaceId: string;
}
