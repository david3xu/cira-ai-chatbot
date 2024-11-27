import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  file: File;
  onRemove: () => void;
}

export function ImagePreview({ file, onRemove }: ImagePreviewProps) {
  return (
    <div className="relative">
      <Image
        src={URL.createObjectURL(file)}
        alt={file.name}
        width={200}
        height={200}
        className="rounded-lg object-cover"
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-background shadow-sm"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
} 