import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'reqlab_theme';
  private darkSignal = signal<boolean>(this.loadTheme());

  readonly isDark = this.darkSignal.asReadonly();

  constructor() {
    // Apply theme on construction
    this.applyTheme(this.darkSignal());

    // React to changes
    effect(() => {
      this.applyTheme(this.darkSignal());
    });
  }

  toggle(): void {
    this.darkSignal.update((v) => !v);
  }

  setDark(dark: boolean): void {
    this.darkSignal.set(dark);
  }

  private loadTheme(): boolean {
    const stored = localStorage.getItem(this.storageKey);
    if (stored !== null) {
      return stored === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(dark: boolean): void {
    localStorage.setItem(this.storageKey, dark ? 'dark' : 'light');
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
