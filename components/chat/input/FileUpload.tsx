"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { useFileUploader } from '@/lib/hooks/useFileUploader'
import { Progress } from '@/components/ui/progress'
import { TrashIcon } from 'lucide-react'

export function FileUpload() {
  const { uploadedFiles, uploadFiles, removeFile, isUploading, progress } = useFileUploader()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      await uploadFiles([file])
    }
  }

  return (
    <div 
      className="relative p-4 border-2 border-dashed rounded-lg"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadFiles([file])
        }}
        accept=".txt,.pdf,.doc,.docx"
      />
      
      {isUploading ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Uploading...</p>
          <Progress value={progress.percentage} />
        </div>
      ) : (
        <Button 
          variant="outline" 
          onClick={() => inputRef.current?.click()}
        >
          Choose file or drag & drop
        </Button>
      )}

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between">
              <span className="text-sm truncate">{file.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file.id)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 