// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { NextResponse } from 'next/server'
// import { Database } from '@/supabase/types/database.types'

// export async function GET(
//   req: Request,
//   { params }: { params: { chatId: string; messageId: string } }
// ) {
//   try {
//     const supabase = createRouteHandlerClient<Database>({ cookies })
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return new NextResponse('Unauthorized', { status: 401 })
//     }

//     const { data: message, error } = await supabase
//       .from('chat_history')
//       .select('*')
//       .eq('chat_id', params.chatId)
//       .eq('message_pair_id', params.messageId)
//       .single()

//     if (error) throw error
//     return NextResponse.json(message)
//   } catch (error) {
//     return new NextResponse(error.message, { status: 500 })
//   }
// }

// export async function PATCH(
//   req: Request,
//   { params }: { params: { chatId: string; messageId: string } }
// ) {
//   try {
//     const supabase = createRouteHandlerClient<Database>({ cookies })
//     const { content } = await req.json()
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return new NextResponse('Unauthorized', { status: 401 })
//     }

//     const { error } = await supabase
//       .from('chat_history')
//       .update({ user_content: content })
//       .eq('chat_id', params.chatId)
//       .eq('message_pair_id', params.messageId)
//       .eq('user_id', user.id)

//     if (error) throw error
//     return new NextResponse('OK')
//   } catch (error) {
//     return new NextResponse(error.message, { status: 500 })
//   }
// }

// export async function DELETE(
//   req: Request,
//   { params }: { params: { chatId: string; messageId: string } }
// ) {
//   try {
//     const supabase = createRouteHandlerClient<Database>({ cookies })
//     const { data: { user } } = await supabase.auth.getUser()

//     if (!user) {
//       return new NextResponse('Unauthorized', { status: 401 })
//     }

//     const { error } = await supabase
//       .from('chat_history')
//       .delete()
//       .eq('chat_id', params.chatId)
//       .eq('message_pair_id', params.messageId)
//       .eq('user_id', user.id)

//     if (error) throw error
//     return new NextResponse('OK')
//   } catch (error) {
//     return new NextResponse(error.message, { status: 500 })
//   }
// } 