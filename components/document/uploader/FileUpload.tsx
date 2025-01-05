/**
 * FileUpload Component
 * 
 * Main file upload component that:
 * - Handles drag and drop
 * - Manages file selection
 * - Validates files
 * - Triggers upload process
 */

'use client'

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { UploadProgress } from './UploadProgress';
import { FileList } from './FileList';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export function FileUpload({ onFileSelect, accept, maxSize = 5 * 1024 * 1024 }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize
  });

  const handleUpload = async () => {
    setUploading(true);
    
    for (const file of files) {
      try {
        await onFileSelect(file);
        setProgress((prev) => prev + (100 / files.length));
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
    
    setUploading(false);
    setProgress(0);
    setFiles([]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50/5' : 'border-gray-600'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-300">
          {isDragActive ? 'Drop files here' : 'Drag files here or click to select'}
        </p>
      </div>

      {files.length > 0 && (
        <>
          <FileList files={files} onRemove={removeFile} />
          <div className="flex justify-end gap-2">
            <Button onClick={() => setFiles([])} variant="ghost">
              Clear All
            </Button>
            <Button onClick={handleUpload} disabled={uploading}>
              Upload {files.length} file{files.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </>
      )}

      {uploading && <UploadProgress progress={progress} />}
    </div>
  );
}
