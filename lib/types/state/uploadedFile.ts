import type { Json } from '@/supabase/types/database.types';

export interface UploadedFile {
  id: string;
  title: string | null;
  content: string | null;
  content_type: string;
  url: string | null;
  source: string | null;
  author: string | null;
  domination_field: string | null;
  metadata: Json | null;
  created_at?: string | null;
  updated_at?: string | null;
  status?: string | null;
  relevance_score?: number | null;
  view_count?: number | null;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadState {
  files: UploadedFile[]
  isUploading: boolean
  progress: UploadProgress | null
  error: string | null
} 