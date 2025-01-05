import type { UploadedFile } from '@/lib/types/state/uploadedFile'

export class StorageRepository {
  async uploadFile(
    bucket: string, 
    path: string, 
    file: File
  ): Promise<UploadedFile> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('path', path)
    formData.append('bucket', bucket)

    const response = await fetch('/api/storage/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload file')
    }

    return response.json()
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const response = await fetch('/api/storage/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ bucket, path })
    })

    if (!response.ok) {
      throw new Error('Failed to delete file')
    }
  }

  async getFileUrl(bucket: string, path: string): Promise<string> {
    const response = await fetch(`/api/storage/url?bucket=${bucket}&path=${path}`)

    if (!response.ok) {
      throw new Error('Failed to get file URL')
    }

    const { url } = await response.json()
    return url
  }

  async listFiles(bucket: string, path: string): Promise<string[]> {
    const response = await fetch(`/api/storage/list?bucket=${bucket}&path=${path}`);

    if (!response.ok) {
      throw new Error('Failed to list files');
    }

    const { files } = await response.json();
    return files.map((file: any) => file.name);
  }
} 