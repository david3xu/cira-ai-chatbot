import { NextRequest } from 'next/server';
import { ChatService } from '@/lib/services/chat/ChatService';
import { createStreamResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { answerQuestion } from '@/lib/features/ai/actions';
import { fetchChatHistory } from '@/lib/features/chat/actions';

export const runtime = 'edge';

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { message, chat_id, message_pair_id, model, domination_field, custom_prompt } = body;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullResponse = '';
          const chatHistory = await fetchChatHistory(chat_id);

          // Save initial message
          await ChatService.saveMessage({
            id: crypto.randomUUID(),
            chatId: chat_id,
            messagePairId: message_pair_id,
            userContent: message,
            assistantContent: '',
            userRole: 'user',
            assistantRole: 'assistant',
            model,
            dominationField: domination_field,
            customPrompt: custom_prompt || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          await answerQuestion({
            message,
            chatHistory,
            model,
            customPrompt: custom_prompt,
            chatId: chat_id,
            onToken: async (token) => {
              if (token) {
                fullResponse += token;
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ token, messageId: message_pair_id })}\n\n`)
                );
              }
            }
          });

          // Update message with full response
          await ChatService.updateMessage(message_pair_id, {
            assistantContent: fullResponse,
            status: 'success'
          });

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, fullResponse, messageId: message_pair_id })}\n\n`)
          );
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    return createStreamResponse(stream);

  } catch (error) {
    console.error('Chat route error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to process chat request',
      500
    );
  }
};