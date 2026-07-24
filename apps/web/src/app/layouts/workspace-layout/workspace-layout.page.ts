import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { WorkspaceService } from '../../services/workspace.service';
import { CollectionService } from '../../services/collection.service';
import { RequestService } from '../../services/request.service';
import { RequestExecutorService } from '../../services/request-executor.service';
import { EnvironmentService } from '../../services/environment.service';
import { HistoryService } from '../../services/history.service';
import { ShareService } from '../../services/share.service';
import { ImportExportService } from '../../services/import-export.service';
import { ToastService } from '../../services/toast.service';
import { ThemeService } from '../../services/theme.service';
import { CollectionTreeComponent } from './collection-tree.component';
import { ModalComponent } from '../../shared/modal.component';
import { KeyValueEditorComponent } from '../../shared/key-value-editor.component';
import { JsonEditorComponent } from '../../shared/json-editor.component';
import { BadgeComponent } from '../../shared/badge.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { ToastComponent } from '../../shared/toast.component';
import {
  Collection, RequestConfig, RequestMethod, KeyValuePair,
  AuthConfig, Environment, HistoryEntry, Workspace
} from '../../interfaces';

@Component({
  selector: 'app-workspace-layout',
  standalone: true,
  imports: [
    FormsModule, CollectionTreeComponent, ModalComponent, KeyValueEditorComponent,
    JsonEditorComponent, BadgeComponent, EmptyStateComponent, ToastComponent,
  ],
  template: `
    <!-- Top Navbar -->
    <div class="flex h-12 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950">
      <div class="flex items-center gap-3">
        <button class="rounded-lg p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" (click)="router.navigate(['/app'])">
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ currentWsName() }}</span>
        <!-- Workspace selector -->
        <select
          class="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          [ngModel]="activeWorkspaceId()"
          (ngModelChange)="selectWorkspace($event)"
        >
          @for (ws of workspaces(); track ws.id) {
            <option [value]="ws.id">{{ ws.name }}</option>
          }
        </select>
      </div>
      <div class="flex items-center gap-2">
        <button class="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          (click)="showHistory.set(!showHistory())">
          📋 History
        </button>
        <button class="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          (click)="showEnvManager.set(true)">
          ⚙ Env
        </button>
        <button class="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          (click)="showImportExport.set(true)">
          📦 I/E
        </button>
        <button class="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          (click)="theme.toggle()">
          {{ theme.isDark() ? '☀️' : '🌙' }}
        </button>
        <div class="relative">
          <button class="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            (click)="showUserMenu.set(!showUserMenu())">
            👤 {{ auth.currentUser()?.name }}
          </button>
          @if (showUserMenu()) {
            <div class="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800"
              (click)="showUserMenu.set(false)">
              <div class="border-b border-gray-200 px-3 py-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                {{ auth.currentUser()?.email }}
              </div>
              <button class="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                (click)="auth.logout()">Sign Out</button>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Main 3-panel layout -->
    <div class="flex h-[calc(100vh-48px)]">
      <!-- LEFT: Collection Tree Sidebar -->
      <div class="w-72 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
        <div class="p-3">
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Collections</h3>
            <button class="rounded p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              (click)="createCollection()">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          @if (collections().length === 0) {
            <p class="text-xs text-gray-400">No collections yet.</p>
          }
          <app-collection-tree
            [collections]="collectionTree()"
            [expandedIds]="expandedIds()"
            [selectedRequestId]="activeRequest()?.id ?? null"
            (selectRequest)="selectRequest($event)"
            (selectCollection)="toggleCollectionExpand($event.id)"
            (contextMenu)="showContextMenu($event)"
          />
        </div>
      </div>

      <!-- CENTER + BOTTOM: Request Editor + Response Viewer -->
      <div class="flex flex-1 flex-col overflow-hidden">
        <!-- URL Bar -->
        <div class="flex items-center gap-1 border-b border-gray-200 bg-white px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
          <select
            class="w-24 rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs font-bold dark:border-gray-600 dark:bg-gray-800"
            [ngModel]="currentMethod()"
            (ngModelChange)="currentMethod.set($event)"
            [style.color]="methodTextColor(currentMethod())"
          >
            @for (m of methods; track m) {
              <option [value]="m">{{ m }}</option>
            }
          </select>
          <div class="relative flex-1">
            <input
              class="w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 font-mono text-sm text-gray-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              placeholder="https://api.example.com/users"
              [ngModel]="currentUrl()"
              (ngModelChange)="currentUrl.set($event)"
            />
          </div>
          <button
            class="flex items-center gap-1.5 rounded-md px-4 py-1.5 text-sm font-semibold text-white transition-colors"
            [class]="executing() ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'"
            (click)="executing() ? cancelRequest() : sendRequest()"
          >
            @if (executing()) {
              <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Cancel
            } @else {
              Send
            }
          </button>
        </div>

        <!-- Request Tabs + Editor -->
        <div class="flex flex-col border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950" style="flex: 1 1 50%; min-height: 200px;">
          <!-- Tab Bar -->
          <div class="flex border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            @for (tab of requestTabs(); track tab) {
              <button
                class="px-4 py-2 text-xs font-medium transition-colors"
                [class]="activeRequestTab() === tab
                  ? 'border-b-2 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800/50'"
                (click)="activeRequestTab.set(tab)"
              >{{ tab }}</button>
            }
          </div>

          <!-- Tab Content -->
          <div class="flex-1 overflow-auto p-3">
            @switch (activeRequestTab()) {
              @case ('Params') {
                <app-key-value-editor [(pairs)]="currentParams" label="Parameter" />
              }
              @case ('Headers') {
                <app-key-value-editor [(pairs)]="currentHeaders" label="Header" />
              }
              @case ('Body') {
                <div class="space-y-2">
                  <select
                    class="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    [ngModel]="bodyType()"
                    (ngModelChange)="bodyType.set($event)"
                  >
                    <option value="none">No Body</option>
                    <option value="raw">Raw</option>
                    <option value="form-data">Form Data</option>
                    <option value="x-www-form-urlencoded">x-www-form-urlencoded</option>
                  </select>
                  @if (bodyType() !== 'none') {
                    <textarea
                      class="h-48 w-full rounded-md border border-gray-300 bg-white p-2 font-mono text-xs text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      [ngModel]="bodyContent()"
                      (ngModelChange)="bodyContent.set($event)"
                      placeholder="Enter request body..."
                    ></textarea>
                  }
                </div>
              }
              @case ('Auth') {
                <div class="space-y-3">
                  <select
                    class="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                    [ngModel]="authType()"
                    (ngModelChange)="authType.set($event)"
                  >
                    <option value="none">No Auth</option>
                    <option value="basic">Basic Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="api-key">API Key</option>
                  </select>
                  @switch (authType()) {
                    @case ('basic') {
                      <input class="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" placeholder="Username" [(ngModel)]="authUsername" />
                      <input class="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" type="password" placeholder="Password" [(ngModel)]="authPassword" />
                    }
                    @case ('bearer') {
                      <input class="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" placeholder="Token" [(ngModel)]="authToken" />
                    }
                    @case ('api-key') {
                      <input class="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 outline-none focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" placeholder="Key" [(ngModel)]="authApiKey" />
                      <select class="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" [(ngModel)]="authApiKeyLocation">
                        <option value="header">Header</option>
                        <option value="query">Query Param</option>
                      </select>
                    }
                  }
                </div>
              }
              @case ('Settings') {
                <div class="space-y-3 text-xs text-gray-500 dark:text-gray-400">
                  <p>Request settings and preferences will appear here.</p>
                  <label class="flex items-center gap-2">
                    <input type="checkbox" class="rounded border-gray-300" [(ngModel)]="followRedirects" />
                    Follow redirects
                  </label>
                </div>
              }
            }
          </div>
        </div>

        <!-- Response Viewer -->
        <div class="flex flex-col bg-white dark:bg-gray-950" style="flex: 1 1 50%; min-height: 200px;">
          <!-- Response Status Bar -->
          <div class="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-800 dark:bg-gray-900">
            <div class="flex items-center gap-2">
              @if (responseStatus()) {
                <app-badge [label]="'' + responseStatus()" variant="status" />
                <span class="text-xs text-gray-600 dark:text-gray-400">{{ responseStatusText() }}</span>
                <span class="text-xs text-gray-400">{{ responseTime() }}ms</span>
                <span class="text-xs text-gray-400">{{ formatSize(responseSize()) }}</span>
              }
              @if (!responseStatus() && !executing()) {
                <span class="text-xs text-gray-400">Hit Send to see the response</span>
              }
              @if (executing()) {
                <span class="text-xs text-emerald-600 dark:text-emerald-400">Sending request...</span>
              }
            </div>
            <div class="flex gap-2">
              @for (tab of responseTabs(); track tab) {
                <button
                  class="text-xs font-medium transition-colors"
                  [class]="activeResponseTab() === tab ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'"
                  (click)="activeResponseTab.set(tab)"
                >{{ tab }}</button>
              }
            </div>
          </div>

          <!-- Response Content -->
          <div class="flex-1 overflow-auto p-3">
            @if (!responseBody() && !executing()) {
              <app-empty-state icon="request" title="No Response Yet" description="Enter a URL and hit Send to see the response." />
            } @else if (executing()) {
              <div class="flex h-full items-center justify-center">
                <div class="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-emerald-500"></div>
              </div>
            } @else {
              @switch (activeResponseTab()) {
                @case ('Pretty') {
                  <pre class="font-mono text-xs leading-relaxed"><code>{{ formatResponseBody() }}</code></pre>
                }
                @case ('Raw') {
                  <pre class="whitespace-pre-wrap font-mono text-xs leading-relaxed">{{ responseBody() }}</pre>
                }
                @case ('Headers') {
                  <div class="space-y-1">
                    @for (h of responseHeaderPairs(); track h.key) {
                      <div class="flex gap-2 text-xs">
                        <span class="font-semibold text-gray-500 dark:text-gray-400">{{ h.key }}:</span>
                        <span class="font-mono text-gray-700 dark:text-gray-300">{{ h.value }}</span>
                      </div>
                    }
                  </div>
                }
              }
            }
          </div>
        </div>
      </div>

      <!-- RIGHT: History Panel (slide-out) -->
      @if (showHistory()) {
        <div class="w-80 shrink-0 overflow-y-auto border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div class="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-800">
            <h3 class="text-sm font-semibold text-gray-900 dark:text-white">History</h3>
            <div class="flex items-center gap-2">
              <button class="text-xs text-red-500 hover:text-red-700" (click)="clearHistory()">Clear All</button>
              <button class="text-gray-400 hover:text-gray-600" (click)="showHistory.set(false)">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div class="p-3">
            <input
              class="w-full rounded-md border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-900 outline-none placeholder:text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Search history..."
              [(ngModel)]="historySearch"
            />
          </div>
          @if (historyEntries().length === 0) {
            <p class="px-3 text-xs text-gray-400">No requests executed yet.</p>
          }
          <div class="space-y-1 px-2">
            @for (entry of historyEntries(); track entry.id) {
              <button
                class="w-full rounded-md px-2 py-1.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50"
                (click)="replayHistory(entry)"
              >
                <div class="flex items-center gap-1.5">
                  <span
                    class="inline-flex items-center rounded px-1 py-0.5 text-xs font-bold"
                    [class]="methodColor(entry.method)">{{ entry.method }}</span>
                  <span class="text-xs text-gray-400">{{ entry.responseStatus }}</span>
                  <span class="text-xs text-gray-400">{{ entry.timingMs }}ms</span>
                </div>
                <div class="mt-0.5 truncate font-mono text-xs text-gray-700 dark:text-gray-300">{{ entry.url }}</div>
              </button>
            }
          </div>
          @if (historyEntries().length > 0) {
            <div class="border-t border-gray-200 p-3 dark:border-gray-800">
              <button class="w-full rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                (click)="clearHistory()">Clear All History</button>
            </div>
          }
        </div>
      }
    </div>

    <!-- Environment Manager Modal -->
    @if (showEnvManager()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="showEnvManager.set(false)">
        <div class="w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <h2 class="text-sm font-semibold text-gray-900 dark:text-white">Manage Environments</h2>
            <button class="text-gray-400 hover:text-gray-600" (click)="showEnvManager.set(false)">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-4">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Environments</h3>
              <button class="text-xs text-emerald-600 hover:text-emerald-700" (click)="createEnvironment()">+ Add</button>
            </div>
            <div class="mb-4 space-y-1">
              @for (env of environments(); track env.id) {
                <div class="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <label class="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <input type="radio" name="activeEnv" [checked]="env.isActive" (change)="selectEnvironment(env.id)" class="text-emerald-600" />
                    {{ env.name }}
                  </label>
                  <button class="ml-auto text-xs text-red-500 hover:text-red-600" (click)="deleteEnvironment(env.id)">✕</button>
                </div>
              }
            </div>
            @if (editingEnv()) {
              <div class="border-t border-gray-200 pt-3 dark:border-gray-700">
                <input class="mb-2 w-full rounded-md border border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-900 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                  placeholder="Environment name" [ngModel]="editingEnv()?.name" (ngModelChange)="updateEditingEnvName($event)" />
                <div class="mb-2 flex items-center justify-between">
                  <h4 class="text-xs font-semibold text-gray-500 dark:text-gray-400">Variables</h4>
                  <button class="text-xs text-emerald-600" (click)="addVariable()">+ Add Variable</button>
                </div>
                @for (v of editingVariables(); track $index) {
                  <div class="mb-1 flex items-center gap-2">
                    <input class="flex-1 rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-900 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="Key" [(ngModel)]="v.key" />
                    <input class="flex-1 rounded-md border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-900 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="Value" [(ngModel)]="v.value" />
                    <button class="text-xs text-red-500 hover:text-red-600" (click)="removeVariable($index)">✕</button>
                  </div>
                }
                <div class="mt-3 flex justify-end gap-2">
                  <button class="rounded-md px-3 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                    (click)="showEnvManager.set(false)">Cancel</button>
                  <button class="rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                    (click)="saveEnvironment()">Save</button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- Share Modal -->
    @if (showShareModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="showShareModal.set(false)">
        <div class="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900" (click)="$event.stopPropagation()">
          <h2 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Share Collection</h2>
          @if (shareUrl()) {
            <div class="mb-3 flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
              <span class="flex-1 truncate font-mono text-xs text-gray-700 dark:text-gray-300">{{ shareUrl() }}</span>
              <button class="text-xs text-emerald-600 hover:text-emerald-700" (click)="copyShareUrl()">Copy</button>
            </div>
            <button class="w-full rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              (click)="revokeShare()">Revoke</button>
          } @else {
            <p class="mb-3 text-xs text-gray-500 dark:text-gray-400">Generate a shareable link for this collection.</p>
            <button class="w-full rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
              (click)="generateShareLink()">Generate Link</button>
          }
        </div>
      </div>
    }

    <!-- Import/Export Modal -->
    @if (showImportExport()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" (click)="showImportExport.set(false)">
        <div class="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900" (click)="$event.stopPropagation()">
          <h2 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Import / Export</h2>
          <div class="space-y-4">
            <div>
              <h3 class="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Import</h3>
              <textarea class="h-24 w-full rounded-md border border-gray-300 bg-gray-50 p-2 font-mono text-xs text-gray-900 outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                placeholder="Paste Postman JSON..." [(ngModel)]="importJson"></textarea>
              <button class="mt-1 rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                (click)="doImport()">Import</button>
            </div>
            <div>
              <h3 class="mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">Export</h3>
              <button class="rounded-md bg-gray-700 px-3 py-1 text-xs font-medium text-white hover:bg-gray-600"
                (click)="doExport()">Download JSON</button>
            </div>
          </div>
        </div>
      </div>
    }

    <app-toast />
  `,
})
export class WorkspaceLayoutComponent implements OnInit {
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  protected auth = inject(AuthService);
  private workspaceService = inject(WorkspaceService);
  private collectionService = inject(CollectionService);
  private requestService = inject(RequestService);
  private executorService = inject(RequestExecutorService);
  private envService = inject(EnvironmentService);
  private historyService = inject(HistoryService);
  private shareService = inject(ShareService);
  private importExportService = inject(ImportExportService);
  protected toast = inject(ToastService);
  protected theme = inject(ThemeService);

  readonly methods: RequestMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  // Workspace state
  readonly workspaces = this.workspaceService.workspaces;
  readonly activeWorkspaceId = signal<number>(0);
  readonly currentWsName = signal('');
  readonly collections = signal<Collection[]>([]);
  readonly expandedIds = signal<Set<number>>(new Set());

  // Request editor state
  readonly currentMethod = signal<RequestMethod>('GET');
  readonly currentUrl = signal('');
  readonly currentParams = signal<KeyValuePair[]>([]);
  readonly currentHeaders = signal<KeyValuePair[]>([]);
  readonly bodyType = signal<string>('none');
  readonly bodyContent = signal('');
  readonly activeRequestTab = signal('Params');
  readonly requestTabs = signal(['Params', 'Headers', 'Body', 'Auth', 'Settings']);
  readonly activeRequest = signal<RequestConfig | null>(null);

  // Auth state
  readonly authType = signal<string>('none');
  authUsername = '';
  authPassword = '';
  authToken = '';
  authApiKey = '';
  authApiKeyLocation = 'header';
  followRedirects = true;
  private authApiKeyName = 'X-API-Key';

  // Response state
  readonly responseStatus = signal<number | null>(null);
  readonly responseStatusText = signal('');
  private responseHeaders = signal('');
  readonly responseBody = signal('');
  readonly responseTime = signal<number>(0);
  readonly responseSize = signal<number>(0);
  readonly executing = signal(false);
  readonly activeResponseTab = signal('Pretty');
  readonly responseTabs = signal(['Pretty', 'Raw', 'Headers']);

  // UI state
  readonly showHistory = signal(false);
  readonly showUserMenu = signal(false);
  readonly showEnvManager = signal(false);
  readonly showShareModal = signal(false);
  readonly showImportExport = signal(false);
  historySearch = '';
  importJson = '';

  // Environment state
  readonly environments = signal<Environment[]>([]);
  readonly activeEnvId = signal<number>(0);
  readonly editingEnv = signal<Environment | null>(null);
  readonly editingVariables = signal<KeyValuePair[]>([]);

  // History state
  readonly historyEntries = signal<HistoryEntry[]>([]);

  // Share state
  readonly shareUrl = signal('');

  // Computed collection tree
  readonly collectionTree = computed(() => {
    const flat = this.collections();
    const map = new Map<number, Collection>();
    const roots: Collection[] = [];

    for (const item of flat) {
      map.set(item.id, { ...item, children: [], requests: [] });
    }

    for (const item of flat) {
      const node = map.get(item.id)!;
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  });

  // Computed response header pairs
  readonly responseHeaderPairs = computed(() => {
    const h = this.responseHeaders();
    if (!h) return [];
    try {
      const parsed = JSON.parse(h);
      return Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
    } catch {
      return [{ key: 'Content-Type', value: h }];
    }
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const wsId = params.get('id');
      if (wsId) {
        this.activeWorkspaceId.set(Number(wsId));
        this.loadWorkspaces();
        this.loadWorkspaceData(Number(wsId));
      }
    });
  }

  private loadWorkspaces(): void {
    this.workspaceService.loadAll().subscribe();
  }

  private loadWorkspaceData(workspaceId: number): void {
    // Load collections
    this.collectionService.loadTree(workspaceId).subscribe(tree => {
      // Flatten the tree for easier management
      const flat: Collection[] = [];
      const flatten = (items: Collection[]) => {
        for (const item of items) {
          flat.push({ ...item, children: undefined, requests: undefined });
          if (item.children) flatten(item.children);
        }
      };
      flatten(tree);
      this.collections.set(flat);
    });

    // Load environments
    this.envService.loadAll(workspaceId).subscribe(envs => {
      this.environments.set(envs);
      const active = envs.find(e => e.isActive);
      if (active) this.activeEnvId.set(active.id);
    });

    // Load history
    this.loadHistory(workspaceId);
  }

  private loadHistory(workspaceId: number): void {
    this.historyService.loadAll(workspaceId).subscribe(h => this.historyEntries.set(h));
  }

  selectWorkspace(id: number): void {
    this.activeWorkspaceId.set(id);
    const ws = this.workspaces().find(w => w.id === id);
    if (ws) this.currentWsName.set(ws.name);
    this.router.navigate(['/app/workspace', id]);
    this.loadWorkspaceData(id);
  }

  selectRequest(req: any): void {
    this.activeRequest.set(req);
    this.currentMethod.set(req.method);
    this.currentUrl.set(req.url);
    this.currentParams.set(req.params || []);
    this.currentHeaders.set(req.headers || []);
    if (req.body) {
      this.bodyType.set(req.body.type || 'none');
      this.bodyContent.set(typeof req.body.content === 'string' ? req.body.content : '');
    } else {
      this.bodyType.set('none');
      this.bodyContent.set('');
    }
  }

  toggleCollectionExpand(id: number): void {
    const set = new Set(this.expandedIds());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.expandedIds.set(set);
  }

  showContextMenu(event: { event: MouseEvent; item: Collection }): void {
    const action = confirm(`Actions for "${event.item.name}"\nOK = Delete\nCancel = Cancel`);
    if (action) {
      this.collectionService.delete(event.item.id, this.activeWorkspaceId()).subscribe(() => {
        this.toast.success('Collection deleted');
        this.loadWorkspaceData(this.activeWorkspaceId());
      });
    }
  }

  createCollection(): void {
    const name = prompt('Collection name:');
    if (!name || !this.activeWorkspaceId()) return;
    this.collectionService.create({ workspaceId: this.activeWorkspaceId(), name, parentId: null }).subscribe(() => {
      this.toast.success('Collection created');
      this.loadWorkspaceData(this.activeWorkspaceId());
    });
  }

  sendRequest(): void {
    if (!this.currentUrl()) return;
    this.executing.set(true);
    this.responseStatus.set(null);

    // Build headers
    const headers: Record<string, string> = {};
    for (const h of this.currentHeaders()) {
      if (h.enabled && h.key) headers[h.key] = h.value;
    }

    // Apply auth
    switch (this.authType()) {
      case 'basic': {
        const encoded = btoa(`${this.authUsername}:${this.authPassword}`);
        headers['Authorization'] = `Basic ${encoded}`;
        break;
      }
      case 'bearer':
        headers['Authorization'] = `Bearer ${this.authToken}`;
        break;
      case 'api-key':
        if (this.authApiKeyLocation === 'header') {
          headers[this.authApiKeyName || 'X-API-Key'] = this.authApiKey;
        }
        break;
    }

    // Resolve variables from active environment
    const activeEnv = this.environments().find(e => e.id === this.activeEnvId());
    const resolveVars = (text: string): string => {
      if (!activeEnv) return text;
      return text.replace(/\{\{(.+?)\}\}/g, (_, key) => {
        const varEntry = activeEnv.variables.find(v => v.key === key.trim());
        return varEntry ? varEntry.value : `{{${key}}}`;
      });
    };

    // Build query params
    const queryParams: Record<string, string> = {};
    for (const p of this.currentParams()) {
      if (p.enabled && p.key) queryParams[p.key] = p.value;
    }

    // Build request config for executor
    const bodyContent = this.bodyType() !== 'none' ? this.bodyContent() : undefined;
    const bodyType = this.bodyType() !== 'none' ? this.bodyType() : undefined;

    const config: RequestConfig = {
      id: 0,
      collectionId: 0,
      name: '',
      method: this.currentMethod(),
      url: resolveVars(this.currentUrl()),
      params: Object.entries(queryParams).map(([key, value]) => ({ key, value, enabled: true })),
      headers: Object.entries(headers).map(([key, value]) => ({ key, value, enabled: true })),
      body: bodyContent ? { type: bodyType as any, content: bodyContent } : null,
      auth: { type: 'none' },
      sortOrder: 0,
    };

    const variables: Record<string, string> = {};
    if (activeEnv) {
      for (const v of activeEnv.variables) {
        if (v.enabled) variables[v.key] = v.value;
      }
    }

    this.executorService.execute(config, variables).subscribe({
      next: (res) => {
        this.responseStatus.set(res.status);
        this.responseStatusText.set(res.statusText);
        this.responseHeaders.set(JSON.stringify(res.headers, null, 2));
        this.responseBody.set(res.body);
        this.responseTime.set(res.timingMs);
        this.responseSize.set(res.size);
        this.executing.set(false);

        // Save to history
        if (this.activeWorkspaceId()) {
          this.historyService.create({
            workspaceId: this.activeWorkspaceId(),
            requestId: this.activeRequest()?.id ?? null,
            method: config.method,
            url: config.url,
            requestHeaders: JSON.stringify(headers),
            requestBody: bodyContent ?? null,
            responseStatus: res.status,
            responseStatusText: res.statusText,
            responseHeaders: JSON.stringify(res.headers),
            responseBody: res.body,
            responseSize: res.size,
            timingMs: res.timingMs,
          } as any).subscribe();
        }
      },
      error: (err) => {
        this.responseStatus.set(err.status || 0);
        this.responseStatusText.set(err.statusText || 'Error');
        this.responseBody.set(err.error?.message || err.message || 'Request failed');
        this.executing.set(false);
      },
    });
  }

  cancelRequest(): void {
    this.executorService.cancel();
    this.executing.set(false);
    this.toast.info('Request cancelled');
  }

  selectEnvironment(id: number): void {
    this.activeEnvId.set(id);
    this.envService.setActive(id).subscribe();
  }

  createEnvironment(): void {
    if (!this.activeWorkspaceId()) return;
    const newEnv: Environment = { id: 0, workspaceId: this.activeWorkspaceId(), name: 'New Environment', variables: [], isActive: false };
    this.editingEnv.set(newEnv);
    this.editingVariables.set([]);
  }

  updateEditingEnvName(name: string): void {
    const env = this.editingEnv();
    if (env) this.editingEnv.set({ ...env, name });
  }

  deleteEnvironment(id: number): void {
    this.envService.delete(id).subscribe(() => {
      this.toast.success('Environment deleted');
      this.loadWorkspaceData(this.activeWorkspaceId());
    });
  }

  addVariable(): void {
    this.editingVariables.update(v => [...v, { key: '', value: '', enabled: true }]);
  }

  removeVariable(index: number): void {
    this.editingVariables.update(v => v.filter((_, i) => i !== index));
  }

  saveEnvironment(): void {
    const env = this.editingEnv();
    if (!env) return;
    const data = { ...env, variables: this.editingVariables() };
    if (env.id === 0) {
      this.envService.create({ workspaceId: this.activeWorkspaceId(), name: env.name, variables: this.editingVariables() }).subscribe(() => {
        this.toast.success('Environment created');
        this.showEnvManager.set(false);
        this.loadWorkspaceData(this.activeWorkspaceId());
      });
    } else {
      this.envService.update(env.id, { name: env.name, variables: this.editingVariables() }).subscribe(() => {
        this.toast.success('Environment saved');
        this.showEnvManager.set(false);
        this.loadWorkspaceData(this.activeWorkspaceId());
      });
    }
  }

  replayHistory(entry: HistoryEntry): void {
    this.currentMethod.set(entry.method as RequestMethod);
    this.currentUrl.set(entry.url);
    try {
      const h = typeof entry.requestHeaders === 'string' ? JSON.parse(entry.requestHeaders) : entry.requestHeaders;
      if (Array.isArray(h)) this.currentHeaders.set(h);
    } catch { /* ignore */ }
    this.activeRequestTab.set('Headers');
  }

  clearHistory(): void {
    if (!this.activeWorkspaceId()) return;
    this.historyService.clearAll(this.activeWorkspaceId()).subscribe(() => {
      this.historyEntries.set([]);
      this.toast.success('History cleared');
    });
  }

  generateShareLink(): void {
    this.toast.info('Select a collection first');
  }

  copyShareUrl(): void {
    navigator.clipboard.writeText(this.shareUrl());
    this.toast.success('Link copied!');
  }

  revokeShare(): void {
    this.shareUrl.set('');
    this.toast.success('Share link revoked');
  }

  doImport(): void {
    if (!this.importJson || !this.activeWorkspaceId()) return;
    try {
      const data = JSON.parse(this.importJson);
      this.importExportService.importPostman(this.activeWorkspaceId(), data).subscribe(() => {
        this.toast.success('Collection imported');
        this.showImportExport.set(false);
        this.loadWorkspaceData(this.activeWorkspaceId());
      });
    } catch {
      this.toast.error('Invalid JSON');
    }
  }

  doExport(): void {
    const collId = this.collections()[0]?.id;
    if (!collId) { this.toast.error('No collection to export'); return; }
    this.importExportService.exportPostman(collId).subscribe(data => {
      this.importExportService.downloadAsFile(data, 'collection');
      this.toast.success('Collection exported');
    });
  }

  formatResponseBody(): string {
    const body = this.responseBody();
    if (!body) return '';
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
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

  methodTextColor(method: RequestMethod): string {
    switch (method) {
      case 'GET': return '#059669';
      case 'POST': return '#2563eb';
      case 'PUT': return '#d97706';
      case 'PATCH': return '#7c3aed';
      case 'DELETE': return '#dc2626';
    }
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
