// import { NextRequest } from 'next/server';
// import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';
// import { databaseActions } from '@/lib/features/chat/actions/storage/databaseActions';

// export async function POST(req: NextRequest) {
//   try {
//     const rawData = await req.json();
//     const data = transformMessageRequest(rawData);

//     await databaseActions.saveMessage({
//       chatId: data.chatId,
//       content: data.content,
//       role: 'user',
//       messagePairId: data.messagePairId,
//       model: data.model,
//       dominationField: data.dominationField,
//       customPrompt: data.customPrompt,
//       status: data.status
//     });

//     return createSuccessResponse({ message: 'Message saved successfully' });
//   } catch (error) {
//     return createErrorResponse(
//       error instanceof Error ? error.message : 'Failed to process message'
//     );
//   }
// }

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const chatId = searchParams.get('chatId');

//     if (!chatId) {
//       return createErrorResponse('Chat ID is required', 400);
//     }

//     const messages = await databaseActions.getChatHistory(chatId);
//     return createSuccessResponse({ messages });
//   } catch (error) {
//     return createErrorResponse(
//       error instanceof Error ? error.message : 'Failed to fetch messages',
//       500
//     );
//   }
// }

