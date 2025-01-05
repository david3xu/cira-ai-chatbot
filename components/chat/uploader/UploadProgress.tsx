'use client'

import React from 'react';
import { useFileUploader } from '@/lib/hooks/useFileUploader';

export function UploadProgress() {
  const { progress } = useFileUploader();

  return (
    <div className="space-y-2">
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Uploading... {progress.percentage}%
      </p>
    </div>
  );
} 