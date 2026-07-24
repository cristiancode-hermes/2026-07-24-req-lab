export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Workspace {
  id: number;
  userId: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: number;
  workspaceId: number;
  parentId: number | null;
  name: string;
  sortOrder: number;
  children?: Collection[];
  requests?: RequestConfig[];
}

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface AuthConfig {
  type: 'none' | 'basic' | 'bearer' | 'api-key';
  username?: string;
  password?: string;
  token?: string;
  apiKey?: string;
  apiKeyLocation?: 'header' | 'query';
  apiKeyName?: string;
}

export interface RequestBody {
  type: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary';
  content?: string;
  contentType?: string;
}

export interface RequestConfig {
  id: number;
  collectionId: number;
  name: string;
  method: RequestMethod;
  url: string;
  params: KeyValuePair[];
  headers: KeyValuePair[];
  body: RequestBody | null;
  auth: AuthConfig;
  sortOrder: number;
}

export interface Environment {
  id: number;
  workspaceId: number;
  name: string;
  variables: KeyValuePair[];
  isActive: boolean;
}

export interface HistoryEntry {
  id: number;
  workspaceId: number;
  requestId: number | null;
  method: RequestMethod;
  url: string;
  requestHeaders: string;
  requestBody: string | null;
  responseStatus: number;
  responseStatusText: string;
  responseHeaders: string;
  responseBody: string;
  responseSize: number;
  timingMs: number;
  timestamp: string;
}

export interface CollectionShare {
  id: number;
  collectionId: number;
  shareToken: string;
  expiresAt: string | null;
  url?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ImportExportData {
  info: { name: string; description?: string; schema: string };
  item: ImportExportItem[];
}

export interface ImportExportItem {
  name: string;
  item?: ImportExportItem[];
  request?: {
    method: RequestMethod;
    url: string;
    header?: { key: string; value: string; enabled?: boolean }[];
    body?: { mode: string; raw?: string };
  };
}
