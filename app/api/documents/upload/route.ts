import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/supabase/types/database.types'

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const formData = await req.formData()
    const file = formData.get('file') as File
    const domination_field = formData.get('domination_field') as string

    if (!file) {
      return new NextResponse('No file provided', { status: 400 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Upload file to Supabase Storage
    const { data: storageData, error: storageError } = await supabase
      .storage
      .from('documents')
      .upload(`${user.id}/${file.name}`, file)

    if (storageError) {
      return new NextResponse(storageError.message, { status: 500 })
    }

    // Get file URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('documents')
      .getPublicUrl(storageData.path)

    return NextResponse.json({ 
      path: storageData.path,
      url: publicUrl,
      domination_field
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An unknown error occurred'
    return new NextResponse(message, { status: 500 })
  }
}
