import { ChatService } from '@/lib/services/chat/ChatService';

export async function PATCH(req: Request) {
  try {
    const { messagePairId, assistantContent, status } = await req.json();
    await ChatService.updateMessage(messagePairId, { assistantContent, status });
    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500 }
    );
  }
}
