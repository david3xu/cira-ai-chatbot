"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { useFileUploader } from '@/lib/hooks/useFileUploader'
import { Progress } from '@/components/ui/progress'
import { XIcon } from 'lucide-react'

interface ImageUploadProps {
  onClose: () => void
}

export function ImageUpload({ onClose }: ImageUploadProps) {
  const { uploadFiles, isUploading, progress } = useFileUploader()
  const [preview, setPreview] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Only image files are allowed')
      return
    }

    setPreview(URL.createObjectURL(file))
    await uploadFiles([file])
    onClose()
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Upload Image</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      <div
        className="border-2 border-dashed rounded-lg p-4"
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFileSelect(file)
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileSelect(file)
          }}
        />

        {isUploading ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Uploading...</p>
            <Progress value={progress.percentage} />
          </div>
        ) : preview ? (
          <img 
            src={preview} 
            alt="Preview" 
            className="max-h-48 mx-auto"
          />
        ) : (
          <Button 
            variant="outline" 
            onClick={() => inputRef.current?.click()}
          >
            Choose image or drag & drop
          </Button>
        )}
      </div>
    </div>
  )
} 