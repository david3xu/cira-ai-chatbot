import { useState, useCallback } from 'react';
import { DocumentService } from '@/lib/services/DocumentService';
import { UploadedFile, UploadProgress } from '@/lib/types/app';

export function useFileUploader() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0
  });

  const uploadFiles = useCallback(async (files: File[]) => {
    setIsUploading(true);
    
    try {
      const uploadedFiles = await Promise.all(
        files.map(file =>
          DocumentService.uploadDocument(file, (percentage) => {
            setProgress({
              loaded: percentage,
              total: 100,
              percentage
            });
          })
        )
      );

      setUploadedFiles(prev => [...prev, ...uploadedFiles]);
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setIsUploading(false);
      setProgress({ loaded: 0, total: 0, percentage: 0 });
    }
  }, []);

  const removeFile = useCallback(async (fileId: string) => {
    try {
      await DocumentService.deleteDocument(fileId);
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    } catch (error) {
      console.error('Failed to remove file:', error);
    }
  }, []);

  return {
    uploadedFiles,
    isUploading,
    progress,
    uploadFiles,
    removeFile
  };
} 