import React from 'react';

interface ErrorFallbackProps {
  error: Error;
}

export function ErrorFallback({ error }: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
        <p className="text-gray-600">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
} 