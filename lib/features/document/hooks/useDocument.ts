import { useState, useCallback } from 'react';
import { uploadDocument } from '../actions/uploadDocument';
import { processDocument } from '../actions/processDocument';

interface UseDocumentReturn {
  isLoading: boolean;
  error: string | null;
  uploadAndProcessDocument: (file: File) => Promise<void>;
  clearError: () => void;
}

export function useDocument(): UseDocumentReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const uploadAndProcessDocument = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const content = await file.text();
      const fileType = file.name.endsWith('.md') ? 'markdown' : 
                      file.name.endsWith('.txt') ? 'text' : 'code';

      const processedDoc = await processDocument({
        content,
        type: fileType
      });

      await uploadDocument({
        file,
        content: processedDoc.content,
        metadata: processedDoc.metadata
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process document');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    uploadAndProcessDocument,
    clearError
  };
} 