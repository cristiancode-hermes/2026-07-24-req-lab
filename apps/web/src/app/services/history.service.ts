import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { HistoryEntry } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private historySignal = signal<HistoryEntry[]>([]);
  readonly history = this.historySignal.asReadonly();

  constructor(private api: ApiService) {}

  loadAll(workspaceId: number): Observable<HistoryEntry[]> {
    return this.api.get<HistoryEntry[]>(`/workspaces/${workspaceId}/history`).pipe(
      tap((list) => this.historySignal.set(list)),
    );
  }

  create(entry: Partial<HistoryEntry> & { workspaceId: number; method: string; url: string; responseStatus: number }): Observable<HistoryEntry> {
    return this.api.post<HistoryEntry>('/history', entry).pipe(
      tap((e) => this.historySignal.update((list) => [e, ...list])),
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/history/${id}`).pipe(
      tap(() => this.historySignal.update((list) => list.filter((h) => h.id !== id))),
    );
  }

  clearAll(workspaceId: number): Observable<void> {
    return this.api.delete<void>(`/workspaces/${workspaceId}/history`).pipe(
      tap(() => this.historySignal.set([])),
    );
  }
}
