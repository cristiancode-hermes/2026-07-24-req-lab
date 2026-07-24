import { Component, model, input } from '@angular/core';
import { KeyValuePair } from '../interfaces';

@Component({
  selector: 'app-key-value-editor',
  standalone: true,
  template: `
    <div class="space-y-1">
      <!-- Header -->
      <div class="flex items-center gap-2 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">
        <span class="w-8"></span>
        <span class="flex-1">Key</span>
        <span class="flex-1">Value</span>
        <span class="w-8"></span>
      </div>
      <!-- Rows -->
      @for (pair of pairs(); track pairIdx; let pairIdx = $index) {
        <div class="flex items-center gap-2">
          <!-- Checkbox -->
          <input
            type="checkbox"
            [checked]="pair.enabled"
            (change)="toggle(pairIdx)"
            class="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-600"
          />
          <!-- Key -->
          <input
            type="text"
            [value]="pair.key"
            (input)="updateKey(pairIdx, $any($event.target).value)"
            placeholder="Key"
            class="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <!-- Value -->
          <input
            type="text"
            [value]="pair.value"
            (input)="updateValue(pairIdx, $any($event.target).value)"
            placeholder="Value"
            class="flex-1 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm font-mono text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
          <!-- Remove -->
          <button
            class="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-800"
            (click)="remove(pairIdx)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
      <!-- Add button -->
      <button
        class="mt-1 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
        (click)="add()"
      >
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add {{ label() }}
      </button>
    </div>
  `,
})
export class KeyValueEditorComponent {
  readonly pairs = model.required<KeyValuePair[]>();
  readonly label = input('Row');

  add(): void {
    this.pairs.update((list) => [...list, { key: '', value: '', enabled: true }]);
  }

  remove(index: number): void {
    this.pairs.update((list) => list.filter((_, i) => i !== index));
  }

  toggle(index: number): void {
    this.pairs.update((list) =>
      list.map((p, i) => (i === index ? { ...p, enabled: !p.enabled } : p)),
    );
  }

  updateKey(index: number, key: string): void {
    this.pairs.update((list) =>
      list.map((p, i) => (i === index ? { ...p, key } : p)),
    );
  }

  updateValue(index: number, value: string): void {
    this.pairs.update((list) =>
      list.map((p, i) => (i === index ? { ...p, value } : p)),
    );
  }
}
