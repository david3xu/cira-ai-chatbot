import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/supabase/types/database.types'

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { url, path, domination_field } = await req.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Fetch document content
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch document')
    }
    const content = await response.text()

    // Generate embedding using OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: content.substring(0, 8000) // OpenAI token limit
      }),
    })

    if (!embeddingResponse.ok) {
      throw new Error('Failed to generate embedding')
    }

    const { data: [{ embedding }] } = await embeddingResponse.json()

    // Save document with embedding
    const { error: insertError } = await supabase
      .from('documents')
      .insert({
        content,
        embedding,
        domination_field: domination_field || 'general',
        user_id: user.id,
        source: 'upload',
        url,
        source_id: path
      })

    if (insertError) {
      throw new Error(insertError.message)
    }

    return new NextResponse('OK')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return new NextResponse(message, { status: 500 })
  }
}
