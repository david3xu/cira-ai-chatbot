export interface UploadedFile {
  id: string
  name: string
  path: string
  url: string
  type: string
  size: number
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadState {
  files: UploadedFile[]
  isUploading: boolean
  progress: UploadProgress | null
  error: string | null
} 