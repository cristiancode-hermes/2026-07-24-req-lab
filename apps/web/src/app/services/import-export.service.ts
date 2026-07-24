import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ImportExportData } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class ImportExportService {
  constructor(private api: ApiService) {}

  importPostman(workspaceId: number, data: ImportExportData): Observable<{ collections: number; requests: number }> {
    return this.api.post<{ collections: number; requests: number }>(
      `/workspaces/${workspaceId}/import/postman`,
      data,
    );
  }

  exportPostman(collectionId: number): Observable<ImportExportData> {
    return this.api.get<ImportExportData>(`/collections/${collectionId}/export/postman`);
  }

  downloadAsFile(data: ImportExportData, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
