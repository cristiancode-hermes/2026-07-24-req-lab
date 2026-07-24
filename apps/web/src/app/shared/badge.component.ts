import { Component, input } from '@angular/core';
import { RequestMethod } from '../interfaces';

@Component({
  selector: 'app-badge',
  standalone: true,
  template: `
    <span
      class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold leading-5 tracking-wide"
      [class]="colorClass()"
    >
      {{ label() }}
    </span>
  `,
})
export class BadgeComponent {
  readonly label = input.required<string>();
  readonly variant = input<'method' | 'status'>('method');

  colorClass(): string {
    if (this.variant() === 'method') {
      return this.methodColor(this.label() as RequestMethod);
    }
    return this.statusColor(Number(this.label()));
  }

  private methodColor(method: RequestMethod): string {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'POST':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'PUT':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      case 'PATCH':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    }
  }

  private statusColor(status: number): string {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    if (status >= 300 && status < 400) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    if (status >= 400 && status < 500) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    if (status >= 500) return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
}
