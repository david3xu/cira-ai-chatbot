import { StorageRepository } from '../repositories/StorageRepository';
import { UploadedFile } from '../types/app';

export class DocumentDomain {
  static async createFileRecord(name: string, repository: StorageRepository): Promise<UploadedFile> {
    const now = new Date().toISOString();
    return {
      id: name,
      name,
      path: `uploads/${name}`,
      url: await repository.getFileUrl('documents', `uploads/${name}`),
      size: 0,
      type: '',
      createdAt: now,
      updatedAt: now
    };
  }

  static createUploadedFile(file: File, path: string, url: string): UploadedFile {
    const now = new Date().toISOString();
    return {
      id: Date.now().toString(),
      name: file.name,
      path,
      url,
      size: file.size,
      type: file.type,
      createdAt: now,
      updatedAt: now
    };
  }
} 