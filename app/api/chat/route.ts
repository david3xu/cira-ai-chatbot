import { NextRequest, NextResponse } from 'next/server';
import { answerQuestion } from '@/actions/ai';
import { fetchChatHistory } from '@/actions/chat/fetchHistory';
import { z } from 'zod';
import { getFullModelName } from '@/lib/modelUtils';
import { ChatMessage } from '@/lib/chat';
import { storeMessagePair } from '@/actions/chat/storeMessage';
import { supabase } from '@/lib/supabase';
import { verifyMessageStorage } from '@/lib/dbVerification';

const encoder = new TextEncoder();

// Request validation schema
const requestSchema = z.object({
  message: z.string().min(1),
  chatId: z.string().uuid({
    message: "Invalid chat ID format"
  }),
  dominationField: z.string().min(1),
  customPrompt: z.string().optional(),
  imageFile: z.string().optional(),
  model: z.string().min(1)
}).refine(data => !!data.chatId, {
  message: "Chat ID is required",
  path: ["chatId"]
});

const withErrorHandling = (handler: (req: NextRequest) => Promise<Response>) => {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('Chat API error:', error);
      
      if (error instanceof z.ZodError) {
        return new Response(
          JSON.stringify({
            error: 'Validation error',
            details: error.errors
          }),
          { status: 400 }
        );
      }

      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        }),
        { status: 500 }
      );
    }
  };
};

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const validatedData = requestSchema.parse(body);
  
  // Only proceed if chat exists
  const { data: chatExists } = await supabase
    .from('chats')
    .select('id')
    .eq('id', validatedData.chatId)
    .single();

  if (!chatExists) {
    return new Response(
      JSON.stringify({ error: 'Chat not found' }),
      { status: 404 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      try {
        let fullResponse = '';
        
        // Process AI response
        const response = await answerQuestion({
          message: validatedData.message,
          chatHistory: await fetchChatHistory(validatedData.chatId),
          dominationField: validatedData.dominationField,
          chatId: validatedData.chatId,
          customPrompt: validatedData.customPrompt,
          imageBase64: validatedData.imageFile,
          model: validatedData.model,
          onToken: (token) => {
            fullResponse += token;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
            );
          },
          skipMessageStorage: true
        });

        // Store both messages in a single row
        await storeMessagePair(
          validatedData.chatId,
          validatedData.message,
          fullResponse,
          validatedData.dominationField,
          validatedData.imageFile,
          response.chat_topic,
          validatedData.model
        );

        controller.close();
      } catch (error) {
        console.error('Stream processing error:', error);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            type: 'error'
          })}\n\n`)
        );
      }
    }
  });

  return new Response(stream);
});