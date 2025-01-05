// import { NextResponse } from 'next/server';
// import { getEmbedding } from '@/lib/services/OpenAIService';
// import { databaseActions } from '@/lib/features/chat/actions/storage/databaseActions';

// export async function POST(req: Request) {
//   try {
//     const { content, domination_field } = await req.json();
//     const embedding = await getEmbedding(content);

//     await databaseActions.saveDocument({
//       content,
//       dominationField: domination_field,
//       embedding
//     });

//     return NextResponse.json({ success: true });
//   } catch (error) {
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Failed to save document' },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req: Request) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const query = searchParams.get('query');
//     const dominationField = searchParams.get('domination_field');

//     if (!query) {
//       return NextResponse.json(
//         { error: 'Query parameter required' },
//         { status: 400 }
//       );
//     }

//     const embedding = await getEmbedding(query);
//     const results = await databaseActions.searchDocuments({
//       query,
//       embedding,
//       dominationField: dominationField || 'general',
//       matchCount: 5
//     });

//     return NextResponse.json(results);
//   } catch (error) {
//     return NextResponse.json(
//       { error: error instanceof Error ? error.message : 'Failed to search documents' },
//       { status: 500 }
//     );
//   }
// } 