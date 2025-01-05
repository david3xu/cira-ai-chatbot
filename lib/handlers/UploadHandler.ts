import type { UploadProgress } from '@/lib/types/state/uploadedFile'

export class UploadHandler {
  static async handleUpload(
    file: File,
    uploadFn: (path: string) => Promise<any>,
    onProgress?: (progress: UploadProgress) => void
  ) {
    // Generate unique path
    const path = `${Date.now()}-${file.name}`
    
    try {
      // Track upload progress
      let loaded = 0
      const total = file.size
      
      // Upload file with progress tracking
      const result = await uploadFn(path)
      
      // Report final progress
      onProgress?.({
        loaded: total,
        total,
        percentage: 100
      })

      return {
        path,
        ...result
      }
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  }
} 