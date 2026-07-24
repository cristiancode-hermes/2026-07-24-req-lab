# ReqLab Frontend Documentation

## Overview

The ReqLab frontend is built with **Angular 22**, using standalone components, zoneless change detection, and signal-based state management.

## Architecture

### Component Tree (Simplified)

```
AppComponent
├── LoginPageComponent
├── RegisterPageComponent
├── DashboardPageComponent
│   ├── SidebarComponent (workspace list)
│   └── Main area (KPI cards + recent activity)
└── WorkspaceLayoutComponent (3-panel layout)
    ├── Sidebar
    │   ├── WorkspaceSelectorComponent
    │   ├── CollectionTreeComponent
    │   └── CollectionFolderComponent (recursive)
    ├── RequestEditorComponent
    │   ├── UrlBarComponent (method selector + URL input + send)
    │   ├── TabGroupComponent
    │   │   ├── ParamsTab (key-value editor)
    │   │   ├── HeadersTab (key-value editor)
    │   │   ├── BodyTab (JSON/form-data/text editor)
    │   │   ├── AuthTab (auth presets)
    │   │   └── SettingsTab
    │   └── KeyValueEditorComponent
    ├── ResponseViewerComponent
    │   ├── ResponseStatusBarComponent
    │   ├── ResponseTabGroupComponent
    │   │   ├── ResponsePrettyComponent (collapsible JSON)
    │   │   ├── ResponseRawComponent
    │   │   └── ResponseHeadersComponent
    │   └── ResponseMetaComponent (timing, size)
    ├── HistoryPanelComponent (slide-out)
    └── NavbarComponent
        ├── EnvironmentSelectorComponent
        └── UserMenuComponent
```

### State Management

All state is managed via Angular signals:
- **Services** expose `signal<T>()` data as `asReadonly()` to consumers
- **Pages** use the state triad pattern: `loading()`, `error()`, `items()`
- **Shared components** receive `input()` and emit `output()` — no injected services

### Key Services

| Service | Purpose | Key Methods |
|---------|---------|-------------|
| `ApiService` | Base HTTP wrapper | `get<T>(url)`, `post<T>(url, body)`, etc. |
| `AuthService` | Authentication | `login()`, `register()`, `logout()`, `isAuthenticated()` |
| `WorkspaceService` | Workspaces CRUD | `list()`, `create()`, `update()`, `delete()` |
| `CollectionService` | Collections + tree | `list()`, `create()`, `update()`, `delete()`, `buildTree()` |
| `RequestService` | Requests CRUD | `list()`, `create()`, `update()`, `delete()` |
| `RequestExecutorService` | Send HTTP via proxy | `execute(request)`, `cancel()` |
| `EnvironmentService` | Environment variables | `list()`, `create()`, `update()`, `delete()`, `resolveVariables()` |
| `HistoryService` | Request history | `list()`, `delete()`, `clearAll()` |
| `ShareService` | Collection sharing | `createLink()`, `revokeLink()`, `getSharedCollection()` |
| `ImportExportService` | Postman import/export | `import()`, `export()` |
| `ThemeService` | Dark/light mode | `toggle()`, `isDark` signal |
| `ToastService` | Notifications | `success()`, `error()`, `info()` |

## Design System

### Colors: "Terminal Teal"
- **Primary**: Emerald/teal scale (500: `#10b981`)
- **Accent**: Orange/coral scale (500: `#f97316`)
- **Surface**: White / Dark: slate-800
- **Background**: Slate-50 / Dark: slate-900
- **Ink**: Slate-900 / Dark: slate-100

### HTTP Method Colors
- GET: `#10b981` (green)
- POST: `#3b82f6` (blue)
- PUT: `#f59e0b` (amber)
- PATCH: `#8b5cf6` (purple)
- DELETE: `#ef4444` (red)

### Typography
- **Sans**: Inter, system-ui
- **Mono**: JetBrains Mono, Fira Code, monospace

### Dark Mode
Toggled via `.dark` class on `document.documentElement`. Persisted in localStorage. Transition: 200ms ease on `background-color` and `color`.
