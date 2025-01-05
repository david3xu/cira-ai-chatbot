// import { NextResponse } from 'next/server';
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';
// import { databaseActions } from '@/lib/features/chat/actions/storage/databaseActions';

// export async function GET(req: Request) {
//   try {
//     const supabase = createRouteHandlerClient({ cookies });
//     const { data: { user } } = await supabase.auth.getUser();

//     if (!user) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     const settings = await databaseActions.getModelSettings(user.id);
//     return NextResponse.json(settings);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to fetch model settings' },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const supabase = createRouteHandlerClient({ cookies });
//     const { model, temperature, max_tokens } = await req.json();
//     const { data: { user } } = await supabase.auth.getUser();

//     if (!user) {
//       return NextResponse.json(
//         { error: 'Unauthorized' },
//         { status: 401 }
//       );
//     }

//     await databaseActions.updateModelSettings(user.id, {
//       model,
//       temperature,
//       max_tokens
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to update model settings' },
//       { status: 500 }
//     );
//   }
// } 