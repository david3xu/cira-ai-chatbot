import { NextRequest } from 'next/server';
import { createStreamResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { answerQuestion } from '@/lib/features/ai/actions';
import { ChatService } from '@/lib/services/chat/ChatService';
import { ChatMessage } from '@/lib/types/chat/chat';

interface StreamData {
  type: 'token' | 'done' | 'error';
  content?: string;
  error?: string;
  model?: string;
}

interface MessageRequest {
  message: string;
  chatId: string;
  model?: string;
  messagePairId?: string;
  dominationField?: string;
}

export async function POST(req: NextRequest) {
  try {
    let data: MessageRequest;
    
    // Check content type
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data
      const formData = await req.formData();
      data = {
        message: formData.get('message') as string,
        chatId: formData.get('chatId') as string,
        model: formData.get('model') as string,
        messagePairId: formData.get('messagePairId') as string,
        dominationField: formData.get('dominationField') as string
      };
    } else {
      // Handle JSON
      const body = await req.text();
      try {
        data = JSON.parse(body);
      } catch (error) {
        console.error('Failed to parse request body:', body);
        return createErrorResponse('Invalid JSON in request body', 400);
      }
    }

    const { message, chatId, model } = data;

    if (!message || !chatId) {
      return createErrorResponse('Message and chatId are required', 400);
    }

    // Create a TransformStream for streaming
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Function to write SSE formatted data
    const writeToStream = async (data: StreamData) => {
      try {
        await writer.write(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      } catch (error) {
        console.error('Error writing to stream:', error);
      }
    };

    // Start processing in the background
    (async () => {
      try {
        // Get chat history for context
        const { messages } = await ChatService.getChatHistory(chatId);
        
        if (!messages) {
          throw new Error('Failed to fetch chat history');
        }

        // Create initial message with all required fields
        const initialMessage: ChatMessage = {
          userContent: message,
          assistantContent: null,
          model: model || 'default',
          chatId,
          userRole: 'user',
          assistantRole: 'assistant',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'sending',
          id: crypto.randomUUID(),
          messagePairId: data.messagePairId || crypto.randomUUID(),
          dominationField: data.dominationField || 'Normal Chat',
          customPrompt: null,
        };

        // Process the response stream
        const response = await answerQuestion({
          messages: [...messages, initialMessage],
          onToken: async (token: string) => {
            await writeToStream({
              type: 'token',
              content: token,
              model: model || 'default'
            });
          },
          dominationField: data.dominationField || 'Normal Chat',
          chatId,
          model: model || 'default'
        });

        // Signal completion
        await writeToStream({
          type: 'done',
          content: response.content,
          model: model || 'default'
        });

      } catch (error) {
        console.error('Error in streaming:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        await writeToStream({
          type: 'error',
          error: errorMessage,
          model: model || 'default'
        });
      } finally {
        try {
          await writer.close();
        } catch (error) {
          console.error('Error closing writer:', error);
        }
      }
    })();

    // Return the stream response
    return createStreamResponse(stream.readable);
  } catch (error) {
    console.error('Error in send-message route:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to process message',
      500
    );
  }
}