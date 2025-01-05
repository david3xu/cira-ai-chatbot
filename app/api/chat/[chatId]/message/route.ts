// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
// import { cookies } from 'next/headers'
// import { NextResponse } from 'next/server'
// import { databaseActions } from '@/lib/features/chat/actions/storage/databaseActions'

// export async function PATCH(
//   req: Request,
//   { params }: { params: { chatId: string } }
// ) {
//   try {
//     const { message_pair_id, assistant_content } = await req.json()
    
//     await databaseActions.updateMessageStatus(message_pair_id, {
//       assistantContent: assistant_content,
//       status: 'success'
//     })

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
//     return NextResponse.json(
//       { error: errorMessage },
//       { status: 500 }
//     )
//   }
// } 