import { SetStateAction } from 'react';

export const handleError = (error: unknown, setError: (value: SetStateAction<string | null>) => void) => {
  console.error('Error:', error);
  
  if (error instanceof Error) {
    setError(error.message);
  } else if (typeof error === 'string') {
    setError(error);
  } else {
    setError('An unexpected error occurred');
  }
}; 