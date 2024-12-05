import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withValidation } from '@/lib/middleware/validation';
import { createSuccessResponse } from '@/lib/utils/apiUtils';
import { supabase } from '@/lib/supabase/client';

const modelUpdateSchema = z.object({
  model: z.string().min(1, 'Model name is required')
});

export const POST = withValidation(
  modelUpdateSchema, 
  async (validatedData: z.infer<typeof modelUpdateSchema>, req: NextRequest) => {
    // Get chatId from URL params using the req object
    const chatId = req.url.split('/').slice(-2)[0];

    // Update chat model in database
    const { data: updatedChat, error: chatError } = await supabase
      .from('chats')
      .update({ 
        model: validatedData.model,
        updated_at: new Date().toISOString()
      })
      .eq('id', chatId)
      .select('*')
      .single();

    if (chatError) {
      throw new Error('Failed to update chat model');
    }

    // Update all unprocessed messages
    const { error: messagesError } = await supabase
      .from('chat_history')
      .update({ model: validatedData.model })
      .eq('chat_id', chatId);

    if (messagesError) {
      throw new Error('Failed to update message models');
    }

    return createSuccessResponse({
      message: 'Model updated successfully',
      chat: updatedChat,
      model: validatedData.model
    });
  }
); 