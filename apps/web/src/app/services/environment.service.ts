import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Environment, KeyValuePair } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  private environmentsSignal = signal<Environment[]>([]);
  readonly environments = this.environmentsSignal.asReadonly();

  private activeEnvSignal = signal<Environment | null>(null);
  readonly activeEnvironment = this.activeEnvSignal.asReadonly();

  constructor(private api: ApiService) {}

  loadAll(workspaceId: number): Observable<Environment[]> {
    return this.api.get<Environment[]>(`/workspaces/${workspaceId}/environments`).pipe(
      tap((list) => {
        this.environmentsSignal.set(list);
        const active = list.find((e) => e.isActive);
        if (active) this.activeEnvSignal.set(active);
      }),
    );
  }

  create(data: { workspaceId: number; name: string; variables?: KeyValuePair[] }): Observable<Environment> {
    return this.api.post<Environment>(`/workspaces/${data.workspaceId}/environments`, data).pipe(
      tap((env) => this.environmentsSignal.update((list) => [...list, env])),
    );
  }

  update(id: number, data: { name?: string; variables?: KeyValuePair[]; isActive?: boolean }): Observable<Environment> {
    return this.api.patch<Environment>(`/environments/${id}`, data).pipe(
      tap((updated) => {
        this.environmentsSignal.update((list) =>
          list.map((e) => (e.id === id ? updated : e)),
        );
        if (data.isActive) {
          this.activeEnvSignal.set(updated);
        }
      }),
    );
  }

  setActive(id: number): Observable<Environment> {
    return this.update(id, { isActive: true }).pipe(
      tap(() => {
        this.environmentsSignal.update((list) =>
          list.map((e) => ({ ...e, isActive: e.id === id })),
        );
      }),
    );
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/environments/${id}`).pipe(
      tap(() => {
        this.environmentsSignal.update((list) => list.filter((e) => e.id !== id));
        this.activeEnvSignal.update((a) => (a?.id === id ? null : a));
      }),
    );
  }

  getActiveVariables(): Record<string, string> {
    const env = this.activeEnvSignal();
    if (!env) return {};
    return Object.fromEntries(
      env.variables.filter((v) => v.enabled).map((v) => [v.key, v.value]),
    );
  }
}
