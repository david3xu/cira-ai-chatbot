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
  // Update chat model in database
  const { error: chatError } = await supabase
    .from('chats')
    .update({ model: validatedData.model })
    .eq('id', validatedData.chatId);

  if (chatError) {
    throw new Error('Failed to update chat model');
  }

  // Update all unprocessed messages in chat_history to use new model
  const { error: messagesError } = await supabase
    .from('chat_history')
    .update({ model: validatedData.model })
    .eq('chat_id', validatedData.chatId);

  if (messagesError) {
    throw new Error('Failed to update message models');
  }

  return createSuccessResponse({
    message: 'Model updated successfully',
    model: validatedData.model
  });
}); 