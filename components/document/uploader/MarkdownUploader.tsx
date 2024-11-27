import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/lib/features/chat/hooks';
import { cn } from '@/lib/utils/styling';
import { v4 as uuidv4 } from 'uuid';
import { ChatService } from '@/lib/services/chat/ChatService';

export function MarkdownUploader() {
  const { handleSendMessage, isLoading, currentChat, model, dominationField } = useChat();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<string>('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/markdown') {
      setFile(file);
      setError(null);
    } else {
      setError('Please upload a markdown file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/markdown': ['.md']
    },
    maxFiles: 1
  });

  const handleUpload = async () => {
    if (!file) return;
    try {
      const content = await file.text();
      const response = await ChatService.processMarkdown({
        content,
        chatId: currentChat?.id,
        model,
        dominationField,
        messagePairId: uuidv4()
      });
      // Handle streaming response...
    } catch (error) {
      setError('Failed to process markdown file');
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragActive ? 'border-primary bg-primary/10' : 'border-muted',
          'cursor-pointer'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? 'Drop the markdown file here'
              : 'Drag & drop a markdown file, or click to select'}
          </p>
        </div>
      </div>

      {file && (
        <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
          <FileText className="h-4 w-4" />
          <span className="flex-1 truncate text-sm">{file.name}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8"
            onClick={() => setFile(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button
        onClick={handleUpload}
        disabled={!file || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Upload and Process'
        )}
      </Button>
    </div>
  );
} 