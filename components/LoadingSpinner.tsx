import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-[250px] h-10">
      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
      <span className="ml-2 text-white">Loading models...</span>
    </div>
  );
};

export default LoadingSpinner; 