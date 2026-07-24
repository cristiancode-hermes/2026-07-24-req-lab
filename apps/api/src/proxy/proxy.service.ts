import { Injectable, BadRequestException } from '@nestjs/common';
import { ProxyRequestDto, ProxyResponseDto } from './dto/proxy.dto';

@Injectable()
export class ProxyService {
  async execute(request: ProxyRequestDto): Promise<ProxyResponseDto> {
    const start = Date.now();

    try {
      const url = new URL(request.url);
      if (request.params) {
        Object.entries(request.params).forEach(([key, value]) => {
          url.searchParams.append(key, String(value));
        });
      }

      const fetchInit: RequestInit = {
        method: request.method,
        headers: request.headers as Record<string, string>,
      };

      if (request.method !== 'GET' && request.method !== 'HEAD' && request.body !== undefined) {
        const bodyStr =
          typeof request.body === 'string'
            ? request.body
            : JSON.stringify(request.body);
        fetchInit.body = bodyStr;
        if (
          request.headers &&
          !Object.keys(request.headers).some(
            (k) => k.toLowerCase() === 'content-type',
          )
        ) {
          fetchInit.headers = {
            ...(request.headers as Record<string, string>),
            'Content-Type': 'application/json',
          };
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      fetchInit.signal = controller.signal;

      const response = await fetch(url.toString(), fetchInit);
      clearTimeout(timeoutId);

      const timing = Date.now() - start;
      const responseBody = await response.text();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        timing,
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new BadRequestException('Proxy request timed out after 30 seconds');
      }
      throw new BadRequestException(`Proxy request failed: ${error.message}`);
    }
  }
}
