import { ApiService } from './base/ApiService'
import { StorageClient } from '../clients/StorageClient'

export class StorageService extends ApiService {
  constructor(private storageClient: StorageClient) {
    super()
  }

  async upload(bucket: string, path: string, file: File): Promise<{ path: string }> {
    const { data, error } = await this.storageClient.storage
      .from(bucket)
      .upload(path, file)

    if (error) throw error
    return { path: data.path }
  }

  async delete(bucket: string, path: string): Promise<void> {
    const { error } = await this.storageClient.storage
      .from(bucket)
      .remove([path])

    if (error) throw error
  }

  async list(bucket: string, path?: string): Promise<string[]> {
    const { data, error } = await this.storageClient.storage
      .from(bucket)
      .list(path)

    if (error) throw error
    return data.map(file => file.name)
  }

  static getPublicUrl(bucket: string, path: string): string {
    return `${process.env.NEXT_PUBLIC_STORAGE_URL}/${bucket}/${path}`;
  }
} 