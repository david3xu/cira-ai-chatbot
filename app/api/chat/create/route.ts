import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { supabaseAdmin } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { OllamaService } from '@/lib/features/ai/services/ollamaService';
import { fromApiCase } from '@/types/api/transformers';

const newChatSchema = z.object({
  model: z.string().min(1, 'Model is required'),
  dominationField: z.string().min(1, 'Domination field is required').default('Normal Chat'),
  name: z.string().optional(),
  customPrompt: z.string().nullable().optional(),
  metadata: z.record(z.any()).optional(),
  chatId: z.string().uuid('Invalid chat ID format').optional(),
  source: z.enum(['input', 'sidebar']).optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const camelCaseBody = fromApiCase(body);
    const validatedData = await newChatSchema.parseAsync(camelCaseBody);
    
    const models = await OllamaService.getModels(true);
    const modelExists = models.some(m => 
      m.name.startsWith(validatedData.model) || 
      m.name.includes(validatedData.model)
    );
    
    if (!modelExists) {
      return createErrorResponse(`Model ${validatedData.model} not found`, 400);
    }

    const chatId = validatedData.chatId || uuidv4();
    const { error: txError } = await supabaseAdmin.rpc(
      'begin_chat_transaction',
      { chat_id: chatId }
    );

    if (txError) {
      throw new Error(`Failed to start transaction: ${txError.message}`);
    }

    try {
      const { data: chat, error: insertError } = await supabaseAdmin
        .from('chats')
        .insert({
          id: chatId,
          user_id: '00000000-0000-0000-0000-000000000000',
          model: validatedData.model,
          domination_field: validatedData.dominationField,
          name: validatedData.name || 'New Chat',
          custom_prompt: validatedData.customPrompt,
          metadata: validatedData.metadata,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        return createErrorResponse(`Database error: ${insertError.message}`, 500);
      }

      await supabaseAdmin.rpc('commit_chat_transaction', { chat_id: chatId });

      return createSuccessResponse({
        chat: {
          id: chat.id,
          model: chat.model,
          domination_field: chat.domination_field,
          created_at: chat.created_at,
          updated_at: chat.created_at,
          messages: [],
          historyLoaded: true,
          name: chat.name,
          custom_prompt: chat.custom_prompt,
          metadata: chat.metadata
        }
      });
    } catch (error) {
      await supabaseAdmin.rpc('rollback_chat_transaction', { chat_id: chatId });
      throw error;
    }
  } catch (error) {
    console.error('New chat creation error:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse(`Validation error: ${error.message}`, 400);
    }
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create new chat',
      500
    );
  }
} 