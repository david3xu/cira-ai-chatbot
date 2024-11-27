import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'application/pdf': ['.pdf'],
    'text/markdown': ['.md']
  },
  maxSize = 5242880, // 5MB
  className
}: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.[0]) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors',
        isDragActive ? 'border-primary bg-primary/10' : 'border-muted',
        className
      )}
    >
      <input {...getInputProps()} />
      <Upload className="h-8 w-8 text-muted-foreground" />
      <p className="mt-2 text-sm text-muted-foreground">
        {isDragActive ? 'Drop file here' : 'Drag & drop or click to select'}
      </p>
    </div>
  );
} 