import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ShareService } from '../../services/share.service';
import { BadgeComponent } from '../../shared/badge.component';
import { SkeletonComponent } from '../../shared/skeleton.component';
import { Collection, RequestConfig } from '../../interfaces';

@Component({
  selector: 'app-shared-collection-page',
  standalone: true,
  imports: [BadgeComponent, SkeletonComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
      <!-- Header -->
      <div class="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
        <div class="mx-auto flex max-w-4xl items-center gap-3">
          <svg class="h-6 w-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="text-lg font-bold text-gray-900 dark:text-white">ReqLab</span>
          <span class="text-sm text-gray-400">— Shared Collection</span>
        </div>
      </div>

      <div class="mx-auto max-w-4xl p-6">
        @if (loading()) {
          <app-skeleton [count]="6" [height]="24" />
        } @else if (error()) {
          <div class="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-900/20">
            <svg class="mx-auto mb-3 h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p class="text-red-700 dark:text-red-300">This shared collection is not available or has expired.</p>
          </div>
        } @else if (collection()) {
          <!-- Collection Name -->
          <div class="mb-6">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ collection()?.name }}</h1>
          </div>

          <!-- Requests -->
          <div class="space-y-2">
            @for (req of requests(); track req.id) {
              <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                <div class="flex items-center gap-3">
                  <app-badge [label]="req.method" variant="method" />
                  <span class="flex-1 font-mono text-sm text-gray-700 dark:text-gray-300">
                    {{ req.name }}
                  </span>
                  <span class="truncate text-xs font-mono text-gray-500 dark:text-gray-400">
                    {{ req.url }}
                  </span>
                </div>
                @if (req.body?.content) {
                  <details class="mt-2">
                    <summary class="cursor-pointer text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      View Request Body
                    </summary>
                    <pre class="mt-2 overflow-x-auto rounded-lg bg-gray-50 p-3 text-xs font-mono dark:bg-gray-800"><code>{{ req.body!.content }}</code></pre>
                  </details>
                }
              </div>
            } @empty {
              <p class="py-12 text-center text-sm text-gray-500 dark:text-gray-400">This collection is empty.</p>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class SharedCollectionPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private shareService = inject(ShareService);

  readonly collection = signal<Collection | null>(null);
  readonly requests = signal<RequestConfig[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.loadShared(token);
    }
  }

  private loadShared(token: string): void {
    this.loading.set(true);
    this.shareService.getShared(token).subscribe({
      next: (res) => {
        this.collection.set(res.collection);
        this.requests.set(res.collection.requests || []);
        // Also handle children recursively
        if (res.collection.children) {
          const allReqs = this.collectRequests(res.collection.children);
          this.requests.set(allReqs);
        }
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load shared collection');
        this.loading.set(false);
      },
    });
  }

  private collectRequests(collections: Collection[]): RequestConfig[] {
    const reqs: RequestConfig[] = [];
    const walk = (items: Collection[]) => {
      for (const c of items) {
        if (c.requests) reqs.push(...c.requests);
        if (c.children) walk(c.children);
      }
    };
    walk(collections);
    return reqs;
  }
}
