import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withValidation } from '@/lib/middleware/validation';
import { createSuccessResponse } from '@/lib/utils/apiUtils';
import { supabase } from '@/lib/supabase/client';

const modelUpdateSchema = z.object({
  chatId: z.string().uuid('Invalid chat ID format'),
  model: z.string().min(1, 'Model name is required')
});

export const POST = withValidation(modelUpdateSchema, async (validatedData) => {
  try {
    // Only update the chat's model setting
    const { data: updatedChat, error: chatError } = await supabase
      .from('chats')
      .update({ 
        model: validatedData.model,
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedData.chatId)
      .select('*')
      .single();

    if (chatError) throw chatError;

    // Get existing messages to preserve their models
    const { data: messages, error: messagesError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('chat_id', validatedData.chatId);

    if (messagesError) throw messagesError;

    return createSuccessResponse({
      message: 'Model updated successfully',
      chat: {
        ...updatedChat,
        messages: messages || []
      },
      model: validatedData.model
    });
  } catch (error) {
    console.error('Error updating model:', error);
    throw error;
  }
}); 