// import { NextResponse } from 'next/server';
// import { databaseActions } from '@/lib/features/chat/actions/storage/databaseActions';

// export async function GET(
//   request: Request,
//   { params }: { params: { fileId: string } }
// ) {
//   try {
//     const file = await databaseActions.getFile(params.fileId);
//     return NextResponse.json(file);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to fetch file' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: Request,
//   { params }: { params: { fileId: string } }
// ) {
//   try {
//     await databaseActions.deleteFile(params.fileId);
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Failed to delete file' },
//       { status: 500 }
//     );
//   }
// }