import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/supabase/types/database.types'
import { getTextChunks, getEmbeddings } from '@/lib/features/document/utils/textProcessing'
import { STORAGE_CONFIG, DOCUMENT_DEFAULTS, LARGE_FILE_THRESHOLD } from '@/lib/features/document/config/constants'
import { DocumentError } from '@/lib/types/document'

/**
 * Sanitizes a filename by removing special characters and spaces
 */
function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_'); // Replace multiple underscores with single
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })

  try {
    // Check if bucket exists, if not create it
    const { data: buckets } = await supabase
      .storage
      .listBuckets()
    
    const documentsBucket = buckets?.find(bucket => bucket.name === STORAGE_CONFIG.BUCKET_NAME)
    
    if (!documentsBucket) {
      const { error: createBucketError } = await supabase
        .storage
        .createBucket(STORAGE_CONFIG.BUCKET_NAME, {
          public: true,
          fileSizeLimit: STORAGE_CONFIG.MAX_FILE_SIZE
        })
      
      if (createBucketError) {
        throw new DocumentError(
          'Error creating storage bucket',
          'BUCKET_CREATION_FAILED',
          500
        )
      }
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const domination_field = formData.get('domination_field') as string || DOCUMENT_DEFAULTS.DOMINATION_FIELD
    const source = formData.get('source') as string || DOCUMENT_DEFAULTS.SOURCE
    const author = formData.get('author') as string || DOCUMENT_DEFAULTS.AUTHOR

    if (!file) {
      throw new DocumentError('No file provided', 'FILE_REQUIRED', 400)
    }

    // Validate file type
    const isMarkdown = file.type === 'text/markdown' || file.name.toLowerCase().endsWith('.md');
    const isPdf = file.type === 'application/pdf';
    
    if (!isMarkdown && !isPdf) {
      throw new DocumentError(
        'Invalid file type. Only Markdown (.md) and PDF files are accepted.',
        'INVALID_FILE_TYPE',
        400
      )
    }

    // Validate file size
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      throw new DocumentError(
        `File size exceeds maximum limit of ${STORAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`,
        'FILE_TOO_LARGE',
        400
      )
    }

    // Upload file to Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from(STORAGE_CONFIG.BUCKET_NAME)
      .upload(`${domination_field}/${sanitizeFileName(file.name)}`, file)

    if (storageError) {
      throw new DocumentError(
        'Error uploading file to storage',
        'STORAGE_UPLOAD_FAILED',
        500
      )
    }

    // Process large files differently if needed
    const needsChunking = file.size > LARGE_FILE_THRESHOLD
    let chunks = []
    let embeddings = []

    if (needsChunking) {
      chunks = await getTextChunks(file)
      embeddings = await getEmbeddings(chunks)
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        path: storageData?.path,
        size: file.size,
        type: isPdf ? 'application/pdf' : 'text/markdown',
        chunks: needsChunking ? chunks.length : 0,
        embeddings: needsChunking ? embeddings.length : 0
      }
    })

  } catch (error) {
    if (error instanceof DocumentError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
