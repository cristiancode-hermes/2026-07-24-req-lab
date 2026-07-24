import { Component, input, output, signal } from '@angular/core';
import { Collection, RequestMethod } from '../../interfaces';

@Component({
  selector: 'app-collection-tree',
  standalone: true,
  imports: [],
  template: `
    <div class="space-y-0.5">
      @for (item of collections(); track item.id) {
        <div>
          @if (item.children && item.children.length > 0) {
            <!-- Folder / Collection -->
            <div
              class="group flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
              [class]="expandedIds().has(item.id) ? 'bg-gray-50 dark:bg-gray-800/50' : ''"
              (click)="toggleExpand(item.id)"
              (contextmenu)="onContextMenu($event, item)"
            >
              <!-- Expand/Collapse -->
              <svg
                class="h-3.5 w-3.5 shrink-0 text-gray-400 transition-transform"
                [class.rotate-90]="expandedIds().has(item.id)"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
              <!-- Folder icon -->
              <svg class="h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span class="flex-1 truncate text-gray-700 dark:text-gray-300">{{ item.name }}</span>
              <!-- Context menu button -->
              <button
                class="hidden rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 group-hover:block dark:hover:bg-gray-700"
                (click)="$event.stopPropagation(); onContextMenu($event, item)"
              >
                <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>

            <!-- Children -->
            @if (expandedIds().has(item.id)) {
              <div class="ml-3 border-l border-gray-200 pl-2 dark:border-gray-700">
                <app-collection-tree
                  [collections]="item.children!"
                  [expandedIds]="expandedIds()"
                  (selectRequest)="selectRequest.emit($event)"
                  (selectCollection)="selectCollection.emit($event)"
                  (contextMenu)="contextMenu.emit($event)"
                />
              </div>
            }
          } @else {
            <!-- Request item (leaf) or empty collection -->
            @if (item.requests && item.requests.length > 0) {
              <div class="ml-3 border-l border-gray-200 pl-2 dark:border-gray-700">
                @for (req of item.requests; track req.id) {
                  <div
                    class="group flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                    [class]="selectedRequestId() === req.id ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'"
                    (click)="selectRequest.emit(req)"
                    (contextmenu)="onContextMenu($event, item)"
                  >
                    <span
                      class="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-bold"
                      [class]="methodColor(req.method)"
                    >{{ req.method }}</span>
                    <span class="flex-1 truncate">{{ req.name }}</span>
                  </div>
                }
              </div>
            } @else {
              <!-- Empty collection - still show it as expandable -->
              <div class="ml-3 border-l border-gray-200 pl-2 dark:border-gray-700">
                <div
                  class="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  (click)="selectCollection.emit(item)"
                  (contextmenu)="onContextMenu($event, item)"
                >
                  <svg class="h-4 w-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <span class="truncate">{{ item.name }}</span>
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
})
export class CollectionTreeComponent {
  readonly collections = input<Collection[]>([]);
  readonly expandedIds = input<Set<number>>(new Set());
  readonly selectedRequestId = input<number | null>(null);

  readonly selectRequest = output<any>();
  readonly selectCollection = output<Collection>();
  readonly contextMenu = output<{ event: MouseEvent; item: Collection }>();

  toggleExpand(id: number): void {
    // Handled by parent via expandedIds
    this.selectCollection.emit({ id } as any);
  }

  onContextMenu(event: MouseEvent, item: Collection): void {
    event.preventDefault();
    event.stopPropagation();
    this.contextMenu.emit({ event, item });
  }

  methodColor(method: string): string {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'PUT': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      case 'PATCH': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  }
}
