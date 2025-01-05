/**
 * Document Service
 * 
 * Handles all document-related operations:
 * - Upload/download
 * - Processing
 * - Conversion
 * - Metadata management
 */

import { ApiService } from './base/ApiService';
import type { Document, ProcessDocumentOptions, SearchOptions } from '@/lib/types/app';
import type { UploadedFile } from '@/lib/types/state/uploadedFile';
// import { StorageRepository } from '@/lib/repositories/StorageRepository';
// import { UploadHandler } from '@/lib/handlers/UploadHandler';

export class DocumentService extends ApiService {
  static async getDocuments(query?: string, domination_field?: string): Promise<Document[]> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (domination_field) params.append('domination_field', domination_field);
    
    return this.get<Document[]>(`/api/documents?${params.toString()}`);
  }

  static async createDocument(content: string, domination_field?: string): Promise<Document> {
    return this.post<Document>('/api/documents', {
      content,
      domination_field
    });
  }

  static async uploadDocument(file: File, onProgress?: (progress: number) => void): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify({
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      }
    }));
    
    return this.post<UploadedFile>('/api/documents/upload', formData);
  }

  static async processDocument(url: string, path: string, domination_field?: string): Promise<void> {
    return this.post('/api/documents/process', {
      url,
      path,
      domination_field
    });
  }

  static async deleteDocument(id: string): Promise<void> {
    return this.delete(`/api/documents/${id}`);
  }

  static async searchDocuments(query: string, options?: SearchOptions): Promise<Document[]> {
    const searchParams: Record<string, string> = { query }
    
    if (options?.field) searchParams.field = options.field
    if (options?.limit) searchParams.limit = options.limit.toString()
    if (options?.offset) searchParams.offset = options.offset.toString()
    if (options?.filters) searchParams.filters = JSON.stringify(options.filters)
    if (options?.sort) searchParams.sort = JSON.stringify(options.sort)

    const params = new URLSearchParams(searchParams)
    return this.get<Document[]>(`/api/documents/search?${params}`);
  }

  static async getUploadedFiles(): Promise<UploadedFile[]> {
    return this.get<UploadedFile[]>('/api/documents/files');
  }

  static async getDocument(documentId: string): Promise<Document> {
    const response = await fetch(`/api/documents/${documentId}`)

    if (!response.ok) {
      throw new Error('Failed to get document')
    }

    return response.json()
  }

  static async updateDocument(
    documentId: string, 
    updates: Partial<Document>
  ): Promise<Document> {
    const response = await fetch(`/api/documents/${documentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    })

    if (!response.ok) {
      throw new Error('Failed to update document')
    }

    return response.json()
  }
}

