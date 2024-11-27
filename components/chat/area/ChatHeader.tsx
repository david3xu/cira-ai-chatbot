import { ArrowUpToLine, X } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { FileUpload } from '../input/FileUpload';

interface ChatHeaderProps {
  showUploader: boolean;
  setShowUploader: (show: boolean) => void;
}

export function ChatHeader({ showUploader, setShowUploader }: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-gray-700 bg-gray-900">
      <div className="grid grid-cols-2 px-4 py-3">
        <div className="flex justify-center">
          <ModelSelector />
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white"
          >
            {showUploader ? (
              <>
                <X className="w-5 h-5" />
                Hide Uploader
              </>
            ) : (
              <>
                <ArrowUpToLine className="w-5 h-5" />
                Show Uploader
              </>
            )}
          </button>
        </div>
      </div>

      {showUploader && (
        <div className="px-4 py-3 border-t border-gray-700">
          <FileUpload
            onFileSelect={(file) => {
              console.log('File selected:', file);
            }}
            accept={{ 'text/markdown': ['.md', '.markdown'] }}
            maxSize={5 * 1024 * 1024}
          />
        </div>
      )}
    </div>
  );
} 