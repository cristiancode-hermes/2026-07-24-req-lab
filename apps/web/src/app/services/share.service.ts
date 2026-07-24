import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CollectionShare } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class ShareService {
  constructor(private api: ApiService) {}

  createShare(collectionId: number, expiresInHours?: number): Observable<CollectionShare> {
    return this.api.post<CollectionShare>(`/collections/${collectionId}/share`, {
      expiresInHours: expiresInHours ?? null,
    });
  }

  revokeShare(collectionId: number): Observable<void> {
    return this.api.delete<void>(`/collections/${collectionId}/share`);
  }

  getShared(token: string): Observable<{ collection: import('../interfaces').Collection }> {
    return this.api.get<{ collection: import('../interfaces').Collection }>(`/shared/${token}`);
  }
}
