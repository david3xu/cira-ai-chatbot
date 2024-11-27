import { NextRequest } from 'next/server';
import { z } from 'zod';
// import { withValidation } from '@/lib/middleware/validation';
import { createStreamResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { answerQuestion } from '@/lib/features/ai/actions';
import { fetchChatHistory } from '@/lib/features/chat/actions';
import { supabaseAdmin } from '@/lib/supabase/client';
import { DatabaseHealthService } from '@/lib/services/database/HealthCheckService';

export const runtime = 'edge';

// Schema for chat creation
const createChatSchema = z.object({
  model: z.string().min(1, 'Model is required'),
  domination_field: z.string().default('Normal Chat'),
  name: z.string().nullable(),
  user_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  custom_prompt: z.string().nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
  messages: z.array(z.any()).optional(),
});

// Schema for message sending
const messageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  chat_id: z.string().uuid('Invalid chat ID'),
  message_pair_id: z.string().uuid('Invalid message pair ID'),
  model: z.string().min(1, 'Model is required'),
  domination_field: z.string().default('Normal Chat'),
  custom_prompt: z.string().nullable().optional()
});

export const POST = async (req: NextRequest) => {
  console.log('Received chat request:', {
    body: await req.clone().json(),
    method: req.method,
    url: req.url
  });

  try {
    const body = await req.json();
    console.log('Received request body:', body);

    // Determine if this is a message or chat creation request
    const isMessageRequest = 'message' in body && 'chat_id' in body;
    const schema = isMessageRequest ? messageSchema : createChatSchema;
    const result = schema.safeParse(body);

    if (!result.success) {
      console.error('Validation errors:', result.error.format());
      return createErrorResponse(
        `Validation error: ${result.error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    type MessageData = z.infer<typeof messageSchema>;
    type CreateChatData = z.infer<typeof createChatSchema>;
    const validatedData = result.data as MessageData | CreateChatData;

    if (!isMessageRequest) {
      throw new Error('Invalid request type');
    }

    const validatedMessage = validatedData as MessageData;

    const { 
      message, 
      chat_id, 
      message_pair_id,
      model,
      domination_field,
      custom_prompt,
    } = validatedMessage;
  
    const encoder = new TextEncoder();

    // 1. Begin Database Transaction
    const { data: transaction, error: transactionError } = await supabaseAdmin.rpc(
      'begin_chat_transaction',
      { chat_id: chat_id }
    );

    if (transactionError) {
      throw new Error(`Transaction error: ${transactionError.message}`);
    }

    // 2. Store User Message
    const { data: messageData, error: messageError } = await supabaseAdmin.rpc(
      'store_chat_message',
      {
        message_data: {
          id: crypto.randomUUID(),
          chat_id: chat_id,
          message_pair_id: message_pair_id,
          user_content: message,
          assistant_content: '',
          user_role: 'user',
          assistant_role: 'assistant',
          domination_field: domination_field,
          model: model,
          custom_prompt: custom_prompt || null,
          chat_topic: null,
          image_url: null,
          metadata: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        operation: 'insert'
      }
    );

    if (messageError) {
      // Rollback transaction on error
      await supabaseAdmin.rpc('rollback_chat_transaction', { chat_id: chat_id });
      throw new Error(`Message storage error: ${messageError.message}`);
    }

    // After message storage
    console.log('Message stored:', {
      messageData,
      chatId: chat_id,
      messagePairId: message_pair_id
    });

    // 3. Create Streaming Response
    const stream = new ReadableStream({
      async start(controller) {
        console.log('Stream started');
        try {
          let fullResponse = '';
          const chatHistory = await fetchChatHistory(chat_id || '');
          const encoder = new TextEncoder();

          await answerQuestion({
            message: message || '',
            chatHistory,
            model,
            customPrompt: custom_prompt || undefined,
            chatId: chat_id || '',
            onToken: async (token) => {
              console.log('Streaming token:', { token, messageId: message_pair_id });
              if (token) {
                fullResponse += token;
                const chunk = encoder.encode(
                  `data: ${JSON.stringify({ token, messageId: message_pair_id })}\n\n`
                );
                controller.enqueue(chunk);
              }
            }
          });

          // Send completion signal with full response
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ 
                done: true, 
                fullResponse,
                messageId: message_pair_id 
              })}\n\n`
            )
          );
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      }
    });

    // Add explicit commit after successful operations
    const { error: commitError } = await supabaseAdmin.rpc(
      'commit_chat_transaction', 
      { chat_id: chat_id }
    );

    return createStreamResponse(stream);

  } catch (error) {
    console.error('Chat route error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to process chat request',
      500
    );
  }
};