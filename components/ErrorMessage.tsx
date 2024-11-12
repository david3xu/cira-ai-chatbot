import React from 'react';

interface ErrorMessageProps {
  message: string | null;
  retry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, retry }) => {
  return (
    <div className="flex flex-col items-start w-[250px] text-sm">
      <div className="text-red-500 mb-2">
        {message || 'An error occurred'}
      </div>
      {retry && (
        <button
          onClick={retry}
          className="text-white hover:text-gray-300 underline text-xs"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage; 