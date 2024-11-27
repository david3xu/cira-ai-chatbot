import { useState, useCallback } from 'react';

export function useFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileSelect = useCallback((selectedFile: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      setFileError('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/markdown'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setFileError('File type not supported');
      return;
    }

    setFile(selectedFile);
    setFileError(null);
  }, []);

  const handleFileRemove = useCallback(() => {
    setFile(null);
    setFileError(null);
  }, []);

  return {
    file,
    handleFileSelect,
    handleFileRemove,
    fileError
  };
} 