import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/supabase/types/database.types'

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { model, chatId } = await req.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify the model exists in Ollama
    const modelResponse = await fetch(`http://localhost:11434/v1/models/${model}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!modelResponse.ok) {
      throw new Error(`Invalid model: ${model}`)
    }

    // Update chat model
    const { error } = await supabase
      .from('chats')
      .update({ model })
      .eq('id', chatId)
      .eq('user_id', user.id)

    if (error) {
      throw new Error(error.message)
    }

    return new NextResponse('OK')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new NextResponse(errorMessage, { status: 500 })
  }
}
