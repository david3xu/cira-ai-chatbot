import { Button } from '@/components/ui/button';
import { Plus } from 'react-feather';
import { forwardRef } from 'react';

interface FileUploadProps {
  onUpload: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  ({ onUpload, onChange }, ref) => (
    <>
      <Button
        onClick={onUpload}
        className="mr-2 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors duration-200"
      >
        <Plus size={20} />
      </Button>
      <input
        ref={ref}
        type="file"
        accept=".md,.pdf,.doc,.docx,.txt,text/markdown,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/*"
        onChange={onChange}
        multiple
        className="hidden"
      />
    </>
  )
);

FileUpload.displayName = 'FileUpload'; 