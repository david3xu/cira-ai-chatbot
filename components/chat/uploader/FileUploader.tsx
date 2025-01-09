'use client'

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { isPdfFile } from '@/lib/utils/file';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DominationField, getDomainFieldOptions } from '@/lib/features/ai/config/constants';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
}

const CustomFileInput = React.forwardRef<HTMLInputElement, CustomInputProps>((props, ref) => (
  <input ref={ref} {...props} />
));

interface FileUploaderProps {
  onUpload: (files: File[], options: {
    author: string;
    source: string;
    dominationField: DominationField;
  }) => Promise<void>;
}

export function FileUploader({ onUpload }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [author, setAuthor] = useState('default author');
  const [source, setSource] = useState('');
  const [dominationField, setDominationField] = useState<DominationField>('NORMAL_CHAT');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const domainFieldOptions = getDomainFieldOptions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const validFiles: File[] = [];
      let hasError = false;

      Array.from(selectedFiles).forEach(file => {
        if (
          file.type === 'text/markdown' || 
          file.name.toLowerCase().endsWith('.md') || 
          isPdfFile(file)
        ) {
          validFiles.push(file);
        } else {
          hasError = true;
        }
      });

      if (hasError) {
        setError('Some files were skipped. Only Markdown (.md) and PDF files are accepted');
      } else {
        setError(null);
      }

      setFiles(validFiles);
    }
  };

  const handleUploadClick = async () => {
    if (files.length === 0) {
      setError('Please select files');
      return;
    }

    if (!dominationField) {
      setError('Please select a domination field');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const defaultSource = source || 'default source';
      
      // Process files one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setCurrentFile(file);
        setUploadStatus(`Uploading ${file.name} (${i + 1}/${files.length})`);
        
        await onUpload([file], {
          author,
          source: defaultSource,
          dominationField,
        });
      }

      // Reset form after successful upload
      setFiles([]);
      setCurrentFile(null);
      setSource('');
      setDominationField('NORMAL_CHAT');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setUploadStatus('Upload completed successfully');
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      setUploadStatus('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
          Choose Files
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.pdf,text/markdown,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
      <div className="space-y-4">
        <Select value={dominationField} onValueChange={(value: DominationField) => setDominationField(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select Domination Field" />
          </SelectTrigger>
          <SelectContent>
            {domainFieldOptions.map((field) => (
              <SelectItem key={field.value} value={field.value}>
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="Author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
      </div>
      {files.length > 0 && (
        <div className="text-sm text-gray-200">
          Selected files: {files.map(f => f.name).join(', ')}
        </div>
      )}
      {currentFile && (
        <div className="text-sm text-gray-200">
          Currently processing: {currentFile.name}
        </div>
      )}
      {error && (
        <div className="text-sm text-red-400">
          {error}
        </div>
      )}
      {uploading && (
        <div className="space-y-2">
          <div className="text-sm text-gray-200">{uploadStatus}</div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{width: `${uploadProgress}%`}}
            ></div>
          </div>
        </div>
      )}
      <Button 
        onClick={handleUploadClick}
        disabled={files.length === 0 || uploading}
        className="w-full"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>
    </div>
  );
} 