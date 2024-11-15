import { NextRequest, NextResponse } from 'next/server';
import { answerQuestion } from '@/actions/ai';
import { fetchChatHistory } from '@/actions/chat/fetchHistory';
import { z } from 'zod';
import { getFullModelName } from '@/lib/modelUtils';
import { ChatMessage } from '@/lib/chat';
import { storeChatMessage } from '@/actions/chat/storeMessage';
import { supabase } from '@/lib/supabase';
import { verifyMessageStorage } from '@/lib/dbVerification';

const encoder = new TextEncoder();

// Request validation schema
const requestSchema = z.object({
  message: z.string().min(1),
  chatId: z.string().uuid(),
  dominationField: z.string().min(1),
  customPrompt: z.string().optional(),
  imageFile: z.string().optional(),
  model: z.string().min(1)
});

export async function POST(req: NextRequest) {
  try {
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

    // Process message and return stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Store user message in background
          storeChatMessage(
            validatedData.chatId,
            'user',
            validatedData.message,
            validatedData.dominationField,
            validatedData.imageFile
          ).catch(console.error);

          // Process AI response
          await answerQuestion({
            message: validatedData.message,
            chatHistory: await fetchChatHistory(validatedData.chatId),
            dominationField: validatedData.dominationField,
            chatId: validatedData.chatId,
            customPrompt: validatedData.customPrompt,
            imageBase64: validatedData.imageFile,
            model: validatedData.model,
            onToken: (token) => {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ token })}\n\n`)
              );
            }
          });

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
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500 }
    );
  }
}