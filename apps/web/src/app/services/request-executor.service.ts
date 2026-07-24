import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { RequestConfig, KeyValuePair } from '../interfaces';

export interface ProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timingMs: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class RequestExecutorService {
  private loadingSignal = signal(false);
  readonly loading = this.loadingSignal.asReadonly();

  private cancelSubject = new Subject<void>();

  constructor(private http: HttpClient) {}

  execute(config: RequestConfig, variables: Record<string, string> = {}): Observable<ProxyResponse> {
    this.loadingSignal.set(true);

    const resolvedUrl = this.resolveVariables(config.url, variables);
    const resolvedHeaders = this.resolveKeyValues(config.headers, variables);
    const resolvedParams = this.resolveKeyValues(config.params, variables);

    // Build auth headers
    const authHeaders: Record<string, string> = {};
    if (config.auth && config.auth.type !== 'none') {
      switch (config.auth.type) {
        case 'basic':
          authHeaders['Authorization'] = 'Basic ' + btoa(`${config.auth.username}:${config.auth.password}`);
          break;
        case 'bearer':
          authHeaders['Authorization'] = `Bearer ${config.auth.token}`;
          break;
        case 'api-key':
          if (config.auth.apiKeyLocation === 'query') {
            // handled via params below
          } else {
            authHeaders[config.auth.apiKeyName || 'X-API-Key'] = config.auth.apiKey || '';
          }
          break;
      }
    }

    const headers: Record<string, string> = {
      ...authHeaders,
      ...Object.fromEntries(
        resolvedHeaders.filter((h) => h.enabled).map((h) => [h.key, h.value]),
      ),
    };

    let params = new HttpParams();
    for (const p of resolvedParams.filter((p) => p.enabled)) {
      params = params.set(p.key, p.value);
    }

    // For API Key in query
    if (config.auth && config.auth.type === 'api-key' && config.auth.apiKeyLocation === 'query') {
      params = params.set(config.auth.apiKeyName || 'api_key', config.auth.apiKey || '');
    }

    let body: unknown = undefined;
    if (config.body && config.body.type !== 'none' && config.body.content) {
      body = config.body.content;
      if (config.body.contentType) {
        headers['Content-Type'] = config.body.contentType;
      }
    }

    return new Observable<ProxyResponse>((observer) => {
      const start = performance.now();

      const abortController = new AbortController();
      const cancelSub = this.cancelSubject.subscribe(() => {
        abortController.abort();
      });

      let httpHeaders = new HttpHeaders(headers);

      this.http
        .request(config.method, '/api/proxy', {
          body: { url: resolvedUrl, method: config.method, headers, params: params.toString(), body },
          headers: httpHeaders,
          responseType: 'text',
          observe: 'response',
        })
        .subscribe({
          next: (res) => {
            const timingMs = Math.round(performance.now() - start);
            const bodyText = typeof res.body === 'string' ? res.body : JSON.stringify(res.body);
            const size = new Blob([bodyText || '']).size;

            // Parse response headers
            const respHeaders: Record<string, string> = {};
            if (res.headers) {
              res.headers.keys().forEach((key) => {
                respHeaders[key] = res.headers.get(key) || '';
              });
            }

            this.loadingSignal.set(false);
            cancelSub.unsubscribe();
            observer.next({
              status: res.status,
              statusText: res.statusText,
              headers: respHeaders,
              body: bodyText || '',
              timingMs,
              size,
            });
            observer.complete();
          },
          error: (err) => {
            this.loadingSignal.set(false);
            cancelSub.unsubscribe();
            observer.error(err);
          },
        });

      return () => {
        cancelSub.unsubscribe();
        abortController.abort();
      };
    });
  }

  cancel(): void {
    this.cancelSubject.next();
    this.loadingSignal.set(false);
  }

  private resolveVariables(value: string, variables: Record<string, string>): string {
    return value.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);

  }

  private resolveKeyValues(pairs: KeyValuePair[], variables: Record<string, string>): KeyValuePair[] {
    return pairs.map((p) => ({
      ...p,
      key: this.resolveVariables(p.key, variables),
      value: this.resolveVariables(p.value, variables),
    }));
  }
}
