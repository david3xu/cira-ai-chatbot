import { FileProcessingService } from '@/lib/services/fileProcessingService';

export async function uploadMarkdownToSupabase(
  file: File,
  source: string,
  author: string,
  dominationField: string,
  abortSignal: AbortSignal,
  onProgress: (progress: number) => void
) {
  return FileProcessingService.processFile({
    file,
    source,
    author,
    dominationField,
    abortSignal,
    onProgress: (progress) => onProgress(progress.overall)
  });
}

export async function uploadFolderToSupabase(
  files: File[], 
  source: string, 
  author: string, 
  dominationField: string, 
  abortSignal: AbortSignal
) {
  return FileProcessingService.processFolder(files, source, author, dominationField, abortSignal);
}
