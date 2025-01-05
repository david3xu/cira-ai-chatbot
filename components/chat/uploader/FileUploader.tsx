'use client'

import React from 'react'
import { UploadProgress } from './UploadProgress'
import { FileList } from './FileList'
import { useFileUploader } from '@/lib/hooks/useFileUploader'

export function FileUploader() {
  const { uploadedFiles, uploadFiles, isUploading } = useFileUploader()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      await uploadFiles([file])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div
      className="rounded-lg border border-dashed p-4"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            uploadFiles([file])
          }
        }}
        accept=".txt,.pdf,.doc,.docx"
      />
      {isUploading ? (
        <UploadProgress />
      ) : (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Drag and drop a file or click to upload
          </p>
          <button
            className="mt-2 text-sm text-primary hover:underline"
            onClick={() => inputRef.current?.click()}
          >
            Select file
          </button>
        </div>
      )}
      {uploadedFiles.length > 0 && <FileList files={uploadedFiles} />}
    </div>
  )
} 