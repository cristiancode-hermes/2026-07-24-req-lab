import { Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  template: `
    <div class="animate-pulse space-y-{{ spacing() }}">
      @for (item of items; track $index) {
        <div
          class="rounded-md bg-gray-200 dark:bg-gray-700"
          [style.height.px]="height()"
          [style.width.%]="widths()[$index % widths().length]"
        ></div>
      }
    </div>
  `,
})
export class SkeletonComponent {
  readonly count = input(3);
  readonly height = input(16);
  readonly widths = input([100, 85, 90, 70, 95]);
  readonly spacing = input(3);

  get items(): number[] {
    return Array.from({ length: this.count() }, (_, i) => i);
  }
}
