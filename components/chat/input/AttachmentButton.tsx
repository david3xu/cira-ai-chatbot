/**
 * AttachmentButton Component
 * 
 * Handles file attachments with:
 * - File selection
 * - Upload preview
 * - File type validation
 */

"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { useFileUploader } from '@/lib/hooks/useFileUploader'

export function AttachmentButton() {
  const { uploadFiles, isUploading } = useFileUploader()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleClick = () => {
    inputRef.current?.click()
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadFiles([file])
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept=".txt,.pdf,.doc,.docx"
      />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={isUploading}
      >
        {isUploading ? (
          <LoadingIcon className="h-4 w-4 animate-spin" />
        ) : (
          <AttachIcon className="h-4 w-4" />
        )}
      </Button>
    </>
  )
}

function AttachIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  )
}

function LoadingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}
