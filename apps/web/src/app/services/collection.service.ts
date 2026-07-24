import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Collection } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class CollectionService {
  private collectionsSignal = signal<Collection[]>([]);
  readonly collections = this.collectionsSignal.asReadonly();

  constructor(private api: ApiService) {}

  loadTree(workspaceId: number): Observable<Collection[]> {
    return this.api.get<Collection[]>(`/workspaces/${workspaceId}/collections/tree`).pipe(
      tap((tree) => this.collectionsSignal.set(tree)),
    );
  }

  create(data: {
    workspaceId: number;
    name: string;
    parentId?: number | null;
  }): Observable<Collection> {
    return this.api
      .post<Collection>(`/workspaces/${data.workspaceId}/collections`, data)
      .pipe(tap((c) => this.addToTree(c, data.parentId ?? null)));
  }

  update(id: number, data: { name?: string; parentId?: number | null; sortOrder?: number }): Observable<Collection> {
    return this.api.patch<Collection>(`/collections/${id}`, data).pipe(
      tap((updated) =>
        this.collectionsSignal.update((tree) => this.updateInTree(tree, updated)),
      ),
    );
  }

  delete(id: number, workspaceId: number): Observable<void> {
    return this.api.delete<void>(`/collections/${id}`).pipe(
      tap(() =>
        this.collectionsSignal.update((tree) => this.removeFromTree(tree, id)),
      ),
    );
  }

  private addToTree(collection: Collection, parentId: number | null): void {
    const flat = this.flattenTree(this.collectionsSignal());
    flat.push(collection);
    // rebuild tree from flat
    this.collectionsSignal.set(this.buildTree(flat));
  }

  private updateInTree(tree: Collection[], updated: Collection): Collection[] {
    const flat = this.flattenTree(tree).map((c) => (c.id === updated.id ? updated : c));
    return this.buildTree(flat);
  }

  private removeFromTree(tree: Collection[], id: number): Collection[] {
    const flat = this.flattenTree(tree).filter((c) => c.id !== id);
    return this.buildTree(flat);
  }

  private flattenTree(tree: Collection[]): Collection[] {
    const result: Collection[] = [];
    const walk = (items: Collection[]) => {
      for (const item of items) {
        result.push({ ...item, children: undefined, requests: undefined });
        if (item.children) walk(item.children);
      }
    };
    walk(tree);
    return result;
  }

  private buildTree(flat: Collection[]): Collection[] {
    const map = new Map<number, Collection>();
    const roots: Collection[] = [];

    for (const item of flat) {
      map.set(item.id, { ...item, children: [] });
    }

    for (const item of flat) {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }
}
