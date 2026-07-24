import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WorkspaceService } from '../../services/workspace.service';
import { ThemeService } from '../../services/theme.service';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { SkeletonComponent } from '../../shared/skeleton.component';
import { ToastComponent } from '../../shared/toast.component';
import { ToastService } from '../../services/toast.service';
import { Workspace } from '../../interfaces';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, EmptyStateComponent, SkeletonComponent, ToastComponent, FormsModule],
  template: `
    <!-- Top Bar -->
    <div class="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-950">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <svg class="h-6 w-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="text-lg font-bold text-gray-900 dark:text-white">ReqLab</span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-500 dark:text-gray-400">
          {{ auth.currentUser()?.name }}
        </span>
        <button
          class="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          (click)="theme.toggle()"
          title="Toggle theme"
        >
          @if (theme.isDark()) {
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          } @else {
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          }
        </button>
        <button
          class="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          (click)="showCreateModal.set(true)"
        >
          + New Workspace
        </button>
        <button
          class="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          (click)="auth.logout()"
        >
          Logout
        </button>
      </div>
    </div>

    <div class="flex h-[calc(100vh-3.5rem)]">
      <!-- Left Sidebar - Workspaces -->
      <div class="w-64 border-r border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
        <h3 class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Workspaces
        </h3>
        <div class="space-y-1">
          @for (ws of workspaces(); track ws.id) {
            <button
              class="w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400"
              [class]="selectedWs()?.id === ws.id ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'"
              (click)="selectWorkspace(ws)"
            >
              <div class="flex items-center gap-2">
                <svg class="h-4 w-4 shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span class="truncate">{{ ws.name }}</span>
              </div>
            </button>
          } @empty {
            <p class="px-3 text-sm text-gray-400">No workspaces yet</p>
          }
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 overflow-auto p-6">
        @if (loading()) {
          <app-skeleton [count]="5" [height]="20" />
        } @else if (error()) {
          <div class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400">
            {{ error() }}
          </div>
        } @else if (workspaces().length === 0) {
          <app-empty-state
            icon="folder"
            title="Welcome to ReqLab"
            description="Create your first workspace to start organizing your API requests."
            actionLabel="Create Workspace"
            (action)="showCreateModal.set(true)"
          />
        } @else if (selectedWs()) {
          <!-- KPI Cards -->
          <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div class="flex items-center gap-3">
                <div class="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <svg class="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Requests</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ kpiRequests() || 0 }}</p>
                </div>
              </div>
            </div>
            <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div class="flex items-center gap-3">
                <div class="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                  <svg class="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Collections</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ kpiCollections() || 0 }}</p>
                </div>
              </div>
            </div>
            <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
              <div class="flex items-center gap-3">
                <div class="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
                  <svg class="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Runs</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ kpiRuns() || 0 }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div>
            <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            @if (recentActivity().length === 0) {
              <div class="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                No recent activity. Start sending requests!
              </div>
            } @else {
              <div class="space-y-2">
                @for (entry of recentActivity(); track $index) {
                  <div class="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
                    <span
                      class="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold"
                      [class]="methodColor(entry.method)"
                    >{{ entry.method }}</span>
                    <span class="flex-1 truncate text-sm font-mono text-gray-700 dark:text-gray-300">
                      {{ entry.url }}
                    </span>
                    <span
                      class="inline-flex items-center rounded px-2 py-0.5 text-xs font-bold"
                      [class]="statusColor(entry.responseStatus)"
                    >{{ entry.responseStatus }}</span>
                    <span class="text-xs text-gray-400">{{ entry.timingMs }}ms</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Open Workspace Button -->
          <div class="mt-6">
            <button
              class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              (click)="openWorkspace()"
            >
              Open Workspace
            </button>
          </div>
        }
      </div>
    </div>

    <!-- Create Workspace Modal -->
    @if (showCreateModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" (click)="showCreateModal.set(false)"></div>
        <div class="relative z-10 w-full max-w-md rounded-xl border border-emerald-500/20 bg-white p-6 shadow-2xl dark:bg-gray-900">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">New Workspace</h3>
          <div class="space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                [(ngModel)]="newWsName"
                placeholder="My API Workspace"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Description (optional)</label>
              <textarea
                [(ngModel)]="newWsDesc"
                placeholder="What is this workspace for?"
                rows="3"
                class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              ></textarea>
            </div>
            <div class="flex justify-end gap-3">
              <button
                class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                (click)="showCreateModal.set(false)"
              >
                Cancel
              </button>
              <button
                class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                [disabled]="!newWsName().trim()"
                (click)="createWorkspace()"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    <app-toast />
  `,
})
export class DashboardPageComponent implements OnInit {
  protected auth = inject(AuthService);
  protected theme = inject(ThemeService);
  private router = inject(Router);
  private workspaceService = inject(WorkspaceService);
  private toast = inject(ToastService);

  readonly workspaces = this.workspaceService.workspaces;
  readonly loading = signal(true);
  readonly error = signal('');
  readonly selectedWs = signal<Workspace | null>(null);
  readonly showCreateModal = signal(false);
  readonly newWsName = signal('');
  readonly newWsDesc = signal('');
  readonly kpiRequests = signal(0);
  readonly kpiCollections = signal(0);
  readonly kpiRuns = signal(0);
  readonly recentActivity = signal<Array<{ method: string; url: string; responseStatus: number; timingMs: number }>>([]);

  ngOnInit(): void {
    this.loadWorkspaces();
  }

  private loadWorkspaces(): void {
    this.loading.set(true);
    this.error.set('');
    this.workspaceService.loadAll().subscribe({
      next: () => this.loading.set(false),
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load workspaces');
        this.loading.set(false);
      },
    });
  }

  selectWorkspace(ws: Workspace): void {
    this.selectedWs.set(ws);
    this.loadWorkspaceStats(ws.id);
  }

  private loadWorkspaceStats(id: number): void {
    // Load KPI data from workspace
    this.workspaceService.getById(id).subscribe({
      next: () => {
        // If the backend provides stats, they'd be here
        // For now, compute from loaded data
      },
    });
  }

  openWorkspace(): void {
    const ws = this.selectedWs();
    if (ws) {
      this.router.navigate(['/app/workspace', ws.id]);
    }
  }

  createWorkspace(): void {
    if (!this.newWsName().trim()) return;
    this.workspaceService
      .create({ name: this.newWsName().trim(), description: this.newWsDesc().trim() })
      .subscribe({
        next: (ws) => {
          this.toast.success('Workspace created!');
          this.showCreateModal.set(false);
          this.newWsName.set('');
          this.newWsDesc.set('');
          this.selectWorkspace(ws);
        },
        error: (err) => {
          this.toast.error(err.error?.message || 'Failed to create workspace');
        },
      });
  }

  methodColor(method: string): string {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      case 'POST': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'PUT': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
      case 'PATCH': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
      case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  statusColor(status: number): string {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
    if (status >= 300 && status < 400) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    if (status >= 400 && status < 500) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    if (status >= 500) return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    return 'bg-gray-100 text-gray-800';
  }
}
