/**
 * FileList Component
 * 
 * Displays list of selected files with:
 * - File names
 * - Sizes
 * - Remove options
 * - Preview if possible
 */

import { X } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function FileList({ files, onRemove }: FileListProps) {
  return (
    <div className="space-y-2">
      {files.map((file, index) => (
        <div
          key={`${file.name}-${index}`}
          className="flex items-center justify-between p-2 rounded bg-gray-800"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {file.name}
              </p>
              <p className="text-sm text-gray-400">
                {formatBytes(file.size)}
              </p>
            </div>
          </div>
          <button
            onClick={() => onRemove(index)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      ))}
    </div>
  );
}
