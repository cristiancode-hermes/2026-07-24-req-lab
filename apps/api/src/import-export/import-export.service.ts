import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Collection } from '../collections/collection.entity';
import { Request } from '../requests/request.entity';
import { PostmanCollection, PostmanItem } from './dto/import-export.dto';

@Injectable()
export class ImportExportService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionsRepository: Repository<Collection>,
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,
  ) {}

  async exportCollection(collectionId: string): Promise<PostmanCollection> {
    const collection = await this.collectionsRepository.findOne({
      where: { id: collectionId },
      relations: { requests: true },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    const items: PostmanItem[] = collection.requests.map((req) => ({
      name: req.name,
      request: {
        method: req.method,
        url: {
          raw: req.url,
          host: [req.url],
          path: [],
        },
        header: (req.headers || []).map(
          (h: Record<string, string>) => ({
            key: h.key || '',
            value: h.value || '',
          }),
        ),
        body: req.body
          ? {
              mode: 'raw',
              raw: JSON.stringify(req.body),
            }
          : undefined,
      },
    }));

    return {
      info: {
        name: collection.name,
        schema:
          'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      },
      item: items,
    };
  }

  async importCollection(
    workspaceId: string,
    postmanCollection: PostmanCollection,
  ): Promise<Collection> {
    if (!postmanCollection.info || !postmanCollection.info.name) {
      throw new BadRequestException('Invalid Postman collection format');
    }

    const collection = this.collectionsRepository.create({
      workspaceId,
      name: postmanCollection.info.name,
    } as unknown as Collection);
    const savedCollection = await this.collectionsRepository.save(collection) as unknown as Collection;

    if (postmanCollection.item && postmanCollection.item.length > 0) {
      for (const item of postmanCollection.item) {
        const url = item.request?.url?.raw || '';
        const request = this.requestsRepository.create({
          collectionId: savedCollection.id,
          name: item.name,
          method: item.request?.method || 'GET',
          url,
          headers: (item.request?.header || []).map((h) => ({
            key: h.key,
            value: h.value,
          })),
          body: item.request?.body?.raw
            ? this.tryParseJson(item.request.body.raw)
            : null,
        } as unknown as Request);
        await this.requestsRepository.save(request);
      }
    }

    return this.collectionsRepository.findOne({
      where: { id: savedCollection.id },
      relations: { requests: true },
    }) as Promise<Collection>;
  }

  private tryParseJson(text: string): Record<string, any> | null {
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }
}
