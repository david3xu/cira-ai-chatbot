import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { OllamaService } from '@/lib/features/ai/services/ollamaService';
import { fromApiCase } from '@/types/api/transformers';

const newChatSchema = z.object({
  model: z.string().min(1, 'Model is required').refine(val => val !== 'null', {
    message: 'Invalid model value'
  }),
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

    // Begin transaction - Updated to use direct table operations
    const { data: txData, error: txError } = await supabase
      .from('stale_transactions')
      .insert({
        chat_id: chatId,
        status: 'started'
      })
      .select('transaction_id')
      .single();

    if (txError) {
      console.error('Transaction error:', txError);
      return createErrorResponse(
        `Failed to start transaction: ${txError.message}`, 
        500
      );
    }

    if (!txData?.transaction_id) {
      console.error('Invalid transaction response:', txData);
      return createErrorResponse('Failed to start transaction', 500);
    }

    try {
      // Verify chat doesn't exist if creating new
      if (!validatedData.chatId) {
        const { data: existingChat } = await supabase
          .from('chats')
          .select('id')
          .eq('id', chatId)
          .single();

        if (existingChat) {
          throw new Error('Chat already exists');
        }
      }

      // Insert or update chat
      const { data: chat, error: insertError } = await supabase
        .from('chats')
        .upsert({
          id: chatId,
          model: validatedData.model,
          domination_field: validatedData.dominationField,
          name: validatedData.name || 'New Chat',
          custom_prompt: validatedData.customPrompt,
          metadata: validatedData.metadata || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Commit transaction - Updated to use direct table operations
      const { error: commitError } = await supabase
        .from('stale_transactions')
        .update({ 
          status: 'committed',
          cleaned_at: new Date().toISOString()
        })
        .eq('transaction_id', txData.transaction_id)
        .eq('status', 'started');

      if (commitError) {
        throw commitError;
      }

      return createSuccessResponse({
        chat: {
          id: chatId,
          model: chat.model,
          domination_field: chat.domination_field,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
          messages: [],
          historyLoaded: true,
          name: chat.name,
          custom_prompt: chat.custom_prompt,
          metadata: chat.metadata
        }
      });
    } catch (error) {
      // Rollback transaction - Updated to use direct table operations
      if (txData.transaction_id) {
        await supabase
          .from('stale_transactions')
          .update({ 
            status: 'rolled_back',
            cleaned_at: new Date().toISOString()
          })
          .eq('transaction_id', txData.transaction_id)
          .eq('status', 'started');
      }
      throw error;
    }
  } catch (error) {
    console.error('Chat creation error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to create chat',
      error instanceof z.ZodError ? 400 : 500
    );
  }
} 