import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Workspace } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private workspacesSignal = signal<Workspace[]>([]);
  readonly workspaces = this.workspacesSignal.asReadonly();

  constructor(private api: ApiService) {}

  loadAll(): Observable<Workspace[]> {
    return this.api.get<Workspace[]>('/workspaces').pipe(
      tap((list) => this.workspacesSignal.set(list)),
    );
  }

  getById(id: number): Observable<Workspace> {
    return this.api.get<Workspace>(`/workspaces/${id}`);
  }

  create(data: { name: string; description?: string }): Observable<Workspace> {
    return this.api.post<Workspace>('/workspaces', data).pipe(
      tap((ws) => this.workspacesSignal.update((list) => [...list, ws])),
    );
  }

  update(id: number, data: { name?: string; description?: string }): Observable<Workspace> {
    return this.api.patch<Workspace>(`/workspaces/${id}`, data).pipe(
      tap((updated) =>
        this.workspacesSignal.update((list) =>
          list.map((w) => (w.id === id ? updated : w)),
        ),
      ),
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/workspaces/${id}`).pipe(
      tap(() =>
        this.workspacesSignal.update((list) => list.filter((w) => w.id !== id)),
      ),
    );
  }
}
