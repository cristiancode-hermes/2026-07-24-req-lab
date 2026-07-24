import { Component, model, input } from '@angular/core';

@Component({
  selector: 'app-json-editor',
  standalone: true,
  template: `
    <div class="space-y-2">
      <textarea
        [value]="value()"
        (input)="onInput($any($event.target).value)"
        placeholder="{{ placeholder() }}"
        rows="{{ rows() }}"
        class="w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-mono text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        spellcheck="false"
      ></textarea>
      @if (showFormat()) {
        <div class="flex gap-2">
          <button
            class="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            (click)="formatJson()"
          >
            Format JSON
          </button>
          <button
            class="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            (click)="minifyJson()"
          >
            Minify
          </button>
        </div>
      }
    </div>
  `,
})
export class JsonEditorComponent {
  readonly value = model.required<string>();
  readonly placeholder = input('{}');
  readonly rows = input(8);
  readonly showFormat = input(true);

  onInput(val: string): void {
    this.value.set(val);
  }

  formatJson(): void {
    try {
      const parsed = JSON.parse(this.value());
      this.value.set(JSON.stringify(parsed, null, 2));
    } catch {
      // ignore invalid JSON
    }
  }

  minifyJson(): void {
    try {
      const parsed = JSON.parse(this.value());
      this.value.set(JSON.stringify(parsed));
    } catch {
      // ignore invalid JSON
    }
  }
}
