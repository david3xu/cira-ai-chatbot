import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Database } from '@/supabase/types/database.types'

export async function GET(req: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) throw error
    return NextResponse.json({ session })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new NextResponse(errorMessage, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { action, ...params } = await req.json()

    let data, error

    switch (action) {
      case 'signIn':
        ({ data, error } = await supabase.auth.signInWithPassword(params))
        break
      case 'signUp':
        ({ data, error } = await supabase.auth.signUp(params))
        break
      case 'signOut':
        ({ error } = await supabase.auth.signOut())
        break
      default:
        throw new Error('Invalid action')
    }

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return new NextResponse(errorMessage, { status: 500 })
  }
} 