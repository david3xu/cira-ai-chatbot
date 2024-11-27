import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentPreviewProps {
  file: File;
  onRemove: () => void;
}

export function DocumentPreview({ file, onRemove }: DocumentPreviewProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted p-2">
      <FileText className="h-4 w-4" />
      <span className="text-sm truncate">{file.name}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 ml-auto"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
} 