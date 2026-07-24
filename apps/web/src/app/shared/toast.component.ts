import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      @for (toast of toasts(); track toast.id) {
        <div
          class="flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg transition-all duration-300"
          [class]="toastClass(toast.type)"
        >
          <span class="text-sm font-medium">{{ toast.message }}</span>
          <button
            class="ml-2 opacity-60 hover:opacity-100"
            (click)="toastService.dismiss(toast.id)"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastComponent {
  protected toastService = inject(ToastService);
  readonly toasts = this.toastService.toasts;

  toastClass(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200';
      case 'error':
        return 'border-red-500 bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      case 'warning':
        return 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200';
      case 'info':
        return 'border-blue-500 bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
    }
  }
}
