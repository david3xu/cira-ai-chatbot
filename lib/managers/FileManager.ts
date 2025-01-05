import { DocumentDomain } from "../domain/DocumentDomain";
import { UploadHandler } from "../handlers/UploadHandler";
import { StorageRepository } from "../repositories/StorageRepository";
import { UploadedFile } from "../types/app";

export class FileManager {
  constructor(private repository: StorageRepository) {}

  async listUploadedFiles(): Promise<UploadedFile[]> {
    const files = await this.repository.listFiles('documents', 'uploads');
    return Promise.all(files.map(name => DocumentDomain.createFileRecord(name, this.repository)));
  }

  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<{path: string; url: string}> {
    return UploadHandler.handleUpload(
      file,
      (path) => this.repository.uploadFile('documents', path, file),
      onProgress && ((progress) => onProgress(progress.percentage))
    );
  }
} 