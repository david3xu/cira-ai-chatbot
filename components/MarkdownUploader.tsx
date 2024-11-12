import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FiMenu } from 'react-icons/fi'; // Import the icon
import { dominationFieldsData } from '@/lib/data/domFields';
import { isPdfFile } from '@/lib/utils/file';
import { FileProcessingService } from '../lib/services/fileProcessingService';
import { FileEncoder } from '@/lib/services/fileEncoder';

// Add this interface at the top of your file
interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  webkitdirectory?: string;
  directory?: string;
}

// Create a custom input component
const CustomFileInput = React.forwardRef<HTMLInputElement, CustomInputProps>((props, ref) => (
  <input ref={ref} {...props} />
));

export function MarkdownUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState('');
  const [dominationField, setDominationField] = useState(''); // New state for domination field
  const [uploading, setUploading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [reminder, setReminder] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileProgress, setFileProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = selectedFiles.filter(file => 
        file.type === 'text/markdown' || 
        file.name.toLowerCase().endsWith('.md') || 
        isPdfFile(file)
      );
      setFiles(validFiles);
      setReminder(validFiles.length < selectedFiles.length ? 'Some files were ignored. Only Markdown (.md) and PDF files are accepted.' : '');
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      console.log(`Selected ${selectedFiles.length} files from folder`);
      
      const validFiles = selectedFiles.filter(file => {
        const isMarkdown = file.type === 'text/markdown' || file.name.toLowerCase().endsWith('.md');
        const isPdfFile = FileEncoder.isPdf(file);
        return isMarkdown || isPdfFile;
      });
      
      console.log(`${validFiles.length} valid files (Markdown or PDF) found`);
      
      setFiles(validFiles);
      setReminder('You have selected a folder. Only Markdown and PDF files will be processed. Please review the files and click "Upload" to proceed.');
      
      if (validFiles.length < selectedFiles.length) {
        console.warn(`${selectedFiles.length - validFiles.length} files were ignored due to invalid type`);
      }
    } else {
      console.warn('No files selected from folder');
    }
  };

  const handleUpload = async () => {
    if (files.length === 0 || !dominationField) {
      setError('Please select files and a domination field');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setUploadStatus('Starting upload...');
    abortControllerRef.current = new AbortController();

    try {
      const defaultSource = source || 'default source';
      const defaultAuthor = author || 'default author';
      const totalFiles = files.length;
      let successCount = 0;
      const failedFiles: Array<{name: string, error: string}> = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const baseProgress = (i / totalFiles) * 100;
        
        try {
          const result = await FileProcessingService.processFile({
            file,
            source: defaultSource,
            author: defaultAuthor,
            dominationField,
            abortSignal: abortControllerRef.current.signal,
            onProgress: (progress) => {
              setFileProgress(progress.fileProgress);
              setUploadProgress(baseProgress + (progress.fileProgress / totalFiles));
              setUploadStatus(`File ${i + 1}/${totalFiles} - ${file.name}: ${progress.stage}`);
            }
          });

          if (result.success) {
            successCount++;
          } else {
            if (result.error?.includes('already exists')) {
              failedFiles.push({ 
                name: file.name, 
                error: `Duplicate file in ${dominationField} domain` 
              });
            } else {
              failedFiles.push({ 
                name: file.name, 
                error: result.error || 'Unknown error' 
              });
            }
          }
        } catch (error) {
          failedFiles.push({ 
            name: file.name, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      if (failedFiles.length > 0) {
        const duplicates = failedFiles.filter(f => f.error.includes('Duplicate file'));
        const otherErrors = failedFiles.filter(f => !f.error.includes('Duplicate file'));
        
        let statusMessage = [];
        if (duplicates.length > 0) {
          statusMessage.push(`${duplicates.length} duplicate files skipped`);
        }
        if (otherErrors.length > 0) {
          statusMessage.push(`${otherErrors.length} files failed to upload`);
        }
        
        setUploadStatus(`Upload completed: ${statusMessage.join(', ')}`);
        setError(failedFiles.map(f => `${f.name}: ${f.error}`).join('\n'));
      } else {
        setUploadStatus('Upload completed successfully!');
        setReminder(`Successfully uploaded all ${totalFiles} files!`);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setUploading(false);
      setUploadProgress(100);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setAuthor('');
    setSource('');
    setDominationField(''); // Reset domination field
    setReminder('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={() => setIsSidebarVisible(!isSidebarVisible)} className="md:hidden p-2">
          <FiMenu className="h-6 w-6 text-white" /> {/* Use the alternative icon */}
        </Button>
        <div className="flex space-x-2">
          <Button onClick={() => fileInputRef.current?.click()}>
            Choose File
          </Button>
          <Button onClick={() => folderInputRef.current?.click()}>
            Choose Folder
          </Button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.pdf,text/markdown,application/pdf"
        onChange={handleFileChange}
        multiple
        className="hidden"
      />
      <CustomFileInput
        ref={folderInputRef}
        type="file"
        webkitdirectory=""
        directory=""
        multiple
        onChange={handleFolderChange}
        className="hidden"
      />
      <div className="relative">
        <select
          value={dominationField}
          onChange={(e) => setDominationField(e.target.value)}
          className="block w-full p-2 border rounded"
        >
          <option value="" disabled>Select Domination Field</option>
          {dominationFieldsData.map((field) => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="block w-full p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Source"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        className="block w-full p-2 border rounded"
      />
      {uploading && (
        <div className="space-y-2">
          <div className="flex flex-col gap-1">
            <div className="text-blue-500 font-medium">{uploadStatus}</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{width: `${uploadProgress}%`}}
              ></div>
            </div>
            <div className="text-sm text-gray-500">
              Overall Progress: {uploadProgress.toFixed(1)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
                style={{width: `${fileProgress}%`}}
              />
            </div>
            <div className="text-sm text-gray-500">
              Current File Progress: {fileProgress.toFixed(1)}%
            </div>
          </div>
        </div>
      )}
      {!uploading && error && <div className="text-red-500">{error}</div>}
      {!uploading && reminder && <div className="text-green-500">{reminder}</div>}
      {files.length > 0 && (
        <div>
          <h3>Selected Files:</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
      <Button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>
      <Button onClick={resetForm} disabled={uploading}>
        Reset
      </Button>
    </div>
  );
}
