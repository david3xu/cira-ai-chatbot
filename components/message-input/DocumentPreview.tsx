import { DocumentIcon } from '@heroicons/react/24/outline';

interface DocumentMetadata {
  fileName: string;
  fileType?: string;
  fileSize?: number;
  previewUrl?: string;
}

interface DocumentPreviewProps {
  fileName: string;
  previewUrl?: string;
  metadata?: DocumentMetadata;
  variant?: 'input' | 'chat';  // To handle different styling for input vs chat area
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  fileName, 
  previewUrl, 
  metadata,
  variant = 'input' 
}) => {
  if (variant === 'input') {
    return (
      <div className="mb-2">
        <a 
          href={previewUrl || '#'} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <div 
            className="rounded-lg object-cover"
            style={{ 
              width: '100px',
              height: '100px',
              maxWidth: '100px',
              maxHeight: '100px',
            }}
          >
            <div className="w-full h-full bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-col items-center justify-center p-2">
              <DocumentIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
              <span className="text-xs mt-2 text-center truncate w-full">
                {fileName}
              </span>
            </div>
          </div>
        </a>
      </div>
    );
  }

  // Chat variant
  return (
    <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
      <div className="flex items-center gap-2">
        <DocumentIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-medium">
          {fileName}
        </span>
        {previewUrl && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 text-sm ml-auto"
          >
            View Document
          </a>
        )}
      </div>
      {metadata && (
        <div className="text-xs text-gray-500 mt-1">
          {metadata.fileSize && `${(metadata.fileSize / 1024).toFixed(1)} KB`}
          {metadata.fileType && metadata.fileSize && ' • '}
          {metadata.fileType}
        </div>
      )}
    </div>
  );
}; 