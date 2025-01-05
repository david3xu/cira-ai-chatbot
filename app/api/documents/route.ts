import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/supabase/types/database.types'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')
    const domination_field = searchParams.get('domination_field')

    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!query) {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('domination_field', domination_field || 'general')
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return NextResponse.json(data)
    }

    // Perform hybrid search if query exists
    const { data, error } = await supabase.rpc('hybrid_search', {
      query_text: query,
      query_embedding: '',
      match_count: 5,
      in_domination_field: domination_field || 'general'
    })

    if (error) throw new Error(error.message)
    return NextResponse.json(data)
  } catch (error) {
    return new NextResponse(
      error instanceof Error ? error.message : 'An error occurred',
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { content, domination_field } = await req.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { error } = await supabase
      .from('documents')
      .insert({
        content,
        domination_field: domination_field || 'general',
        user_id: user.id
      })

    if (error) throw new Error(error.message)
    return new NextResponse('OK')
  } catch (error) {
    return new NextResponse(
      error instanceof Error ? error.message : 'An error occurred',
      { status: 500 }
    );
  }
}
