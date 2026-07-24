import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { RequestConfig } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class RequestService {
  private requestsSignal = signal<RequestConfig[]>([]);
  readonly requests = this.requestsSignal.asReadonly();

  constructor(private api: ApiService) {}

  loadByCollection(collectionId: number): Observable<RequestConfig[]> {
    return this.api.get<RequestConfig[]>(`/collections/${collectionId}/requests`).pipe(
      tap((list) => this.requestsSignal.set(list)),
    );
  }

  getById(id: number): Observable<RequestConfig> {
    return this.api.get<RequestConfig>(`/requests/${id}`);
  }

  create(data: Partial<RequestConfig> & { collectionId: number; name: string; method: string; url: string }): Observable<RequestConfig> {
    return this.api.post<RequestConfig>('/requests', data).pipe(
      tap((req) => this.requestsSignal.update((list) => [...list, req])),
    );
  }

  update(id: number, data: Partial<RequestConfig>): Observable<RequestConfig> {
    return this.api.patch<RequestConfig>(`/requests/${id}`, data).pipe(
      tap((updated) =>
        this.requestsSignal.update((list) =>
          list.map((r) => (r.id === id ? updated : r)),
        ),
      ),
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/requests/${id}`).pipe(
      tap(() =>
        this.requestsSignal.update((list) => list.filter((r) => r.id !== id)),
      ),
    );
  }
}
