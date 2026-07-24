import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 p-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="mb-8 text-center">
          <div class="mb-2 inline-flex items-center justify-center rounded-2xl bg-emerald-500/10 p-3">
            <svg class="h-10 w-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">ReqLab</h1>
          <p class="mt-1 text-sm text-gray-400">Create your account</p>
        </div>

        <!-- Register Card -->
        <div class="rounded-xl border border-emerald-500/20 bg-gray-800/80 p-6 backdrop-blur-sm">
          <h2 class="mb-6 text-lg font-semibold text-white">Create Account</h2>

          @if (error()) {
            <div class="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {{ error() }}
            </div>
          }

          <form (ngSubmit)="onRegister()" class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-300" for="name">Name</label>
              <input
                id="name"
                type="text"
                [(ngModel)]="name"
                name="name"
                required
                class="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-300" for="email">Email</label>
              <input
                id="email"
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-300" for="password">Password</label>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                minlength="6"
                class="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-300" for="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                class="w-full rounded-lg border border-gray-600 bg-gray-700/50 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Repeat password"
              />
            </div>
            <button
              type="submit"
              [disabled]="loading()"
              class="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              @if (loading()) {
                <span class="inline-flex items-center gap-2">
                  <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              } @else {
                Create Account
              }
            </button>
          </form>

          <p class="mt-6 text-center text-sm text-gray-400">
            Already have an account?
            <a routerLink="/login" class="font-medium text-emerald-400 hover:text-emerald-300">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class RegisterPageComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = signal('');
  loading = signal(false);

  onRegister(): void {
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.error.set('Please fill in all fields');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }
    this.error.set('');
    this.loading.set(true);
    this.auth
      .register({ email: this.email, password: this.password, name: this.name })
      .subscribe({
        next: () => {
          this.toast.success('Account created! Welcome to ReqLab.');
          this.router.navigate(['/app']);
        },
        error: (err) => {
          this.error.set(err.error?.message || 'Registration failed. Please try again.');
          this.loading.set(false);
        },
      });
  }
}
