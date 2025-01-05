/**
 * UploadProgress Component
 * 
 * Shows upload progress with:
 * - Progress bar
 * - Percentage
 * - Cancel option
 */

interface UploadProgressProps {
  progress: number;
  onCancel?: () => void;
}

export function UploadProgress({ progress, onCancel }: UploadProgressProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>Uploading...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
