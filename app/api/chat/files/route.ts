// import { NextResponse } from 'next/server';
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';
// import { databaseActions } from '@/lib/features/chat/actions/storage/databaseActions';

// export async function POST(req: Request) {
//   try {
//     const supabase = createRouteHandlerClient({ cookies });
//     const formData = await req.formData();
//     const file = formData.get('file') as File;
//     const chatId = formData.get('chatId') as string;

//     if (!file) {
//       return NextResponse.json(
//         { error: 'No file provided' },
//         { status: 400 }
//       );
//     }

//     const { data: { user } } = await supabase.auth.getUser();

//     if (!user) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     // Use databaseActions for file upload
//     const result = await databaseActions.uploadFile(user.id, chatId, file);

//     return NextResponse.json(result);
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     return NextResponse.json(
//       { error: 'Failed to upload file' },
//       { status: 500 }
//     );
//   }
// } 