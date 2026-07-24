# ReqLab API Documentation

## Base URL

All API endpoints are prefixed with `/api`.

**Base URL (dev):** `http://localhost:3000/api`

## Authentication

Most endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Register
```
POST /api/auth/register
Body: { email: string, password: string, name: string }
Response: { token: string, user: User }
```

### Login
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: User }
```

### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { user: User }
```

### Update Profile
```
PATCH /api/auth/me
Headers: Authorization: Bearer <token>
Body: { name?: string }
Response: { user: User }
```

## Workspaces

All workspace endpoints require authentication.

### List Workspaces
```
GET /api/workspaces
Response: Workspace[]
```

### Create Workspace
```
POST /api/workspaces
Body: { name: string, description?: string }
Response: Workspace
```

### Get Workspace
```
GET /api/workspaces/:id
Response: Workspace
```

### Update Workspace
```
PATCH /api/workspaces/:id
Body: { name?: string, description?: string }
Response: Workspace
```

### Delete Workspace
```
DELETE /api/workspaces/:id
Response: 204 No Content
```

## Collections

### List Collections (tree)
```
GET /api/workspaces/:wsId/collections
Response: Collection[]
```

### Create Collection/Folder
```
POST /api/workspaces/:wsId/collections
Body: { name: string, parentId?: string }
Response: Collection
```

### Get Collection
```
GET /api/workspaces/:wsId/collections/:id
Response: Collection (with requests)
```

### Update Collection
```
PATCH /api/workspaces/:wsId/collections/:id
Body: { name?: string, parentId?: string }
Response: Collection
```

### Delete Collection
```
DELETE /api/workspaces/:wsId/collections/:id
Response: 204 No Content
```

## Requests

### List Requests
```
GET /api/collections/:collId/requests
Response: Request[]
```

### Create Request
```
POST /api/collections/:collId/requests
Body: { name, method, url, params?, headers?, body?, auth?, sortOrder? }
Response: Request
```

### Get Request
```
GET /api/requests/:id
Response: Request
```

### Update Request
```
PATCH /api/requests/:id
Body: Partial<Request>
Response: Request
```

### Delete Request
```
DELETE /api/requests/:id
Response: 204 No Content
```

## Environments

### List Environments
```
GET /api/workspaces/:wsId/environments
Response: Environment[]
```

### Create Environment
```
POST /api/workspaces/:wsId/environments
Body: { name: string, variables?: KeyValuePair[] }
Response: Environment
```

### Update Environment
```
PATCH /api/workspaces/:wsId/environments/:id
Body: { name?, variables? }
Response: Environment
```

### Delete Environment
```
DELETE /api/workspaces/:wsId/environments/:id
Response: 204 No Content
```

## Proxy (Execute Request)

### Send HTTP Request
```
POST /api/proxy
Headers: Authorization: Bearer <token>
Body: { method, url, headers?: Record<string,string>, body?: any, params?: Record<string,string> }
Response: { status, statusText, headers, body, timing }
```

## History

### List History
```
GET /api/workspaces/:wsId/history?page=1&limit=50
Response: HistoryEntry[]
```

### Get History Entry
```
GET /api/workspaces/:wsId/history/:id
Response: HistoryEntry
```

### Delete History Entry
```
DELETE /api/workspaces/:wsId/history/:id
Response: 204 No Content
```

### Clear All History
```
DELETE /api/workspaces/:wsId/history
Response: 204 No Content
```

## Share

### Create Share Link
```
POST /api/collections/:collId/share
Body: { expiresInDays?: number }
Response: { shareToken: string, url: string }
```

### Get Shared Collection (public)
```
GET /api/share/:token
Response: Collection (with requests)
```

### Revoke Share Link
```
DELETE /api/collections/:collId/share
Response: 204 No Content
```

## Import/Export

### Export Collection (Postman JSON)
```
GET /api/collections/:collId/export
Response: PostmanCollectionJson
```

### Import Collection
```
POST /api/workspaces/:wsId/import
Body: { collection: PostmanCollectionJson }
Response: Collection
```

## Models

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
```

### Workspace
```typescript
interface Workspace {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Collection
```typescript
interface Collection {
  id: string;
  workspaceId: string;
  parentId?: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

### Request
```typescript
interface RequestConfig {
  id: string;
  collectionId: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body?: { type: 'json' | 'form-data' | 'text'; content: string | array };
  auth?: { type: 'none' | 'basic' | 'bearer' | 'api-key'; [key: string]: any };
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

### KeyValuePair
```typescript
interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}
```

### Environment
```typescript
interface Environment {
  id: string;
  workspaceId: string;
  name: string;
  variables: KeyValuePair[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### HistoryEntry
```typescript
interface HistoryEntry {
  id: string;
  workspaceId: string;
  requestId?: string;
  method: string;
  url: string;
  requestHeaders: any;
  requestBody?: any;
  responseStatus: number;
  responseStatusText: string;
  responseHeaders: any;
  responseBody?: string;
  responseSize: number;
  timingMs: number;
  timestamp: string;
}
```
