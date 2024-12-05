import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withValidation } from '@/lib/middleware/validation';
import { createSuccessResponse } from '@/lib/utils/apiUtils';
import { supabase } from '@/lib/supabase/client';

const nameUpdateSchema = z.object({
  chatId: z.string().uuid('Invalid chat ID format'),
  name: z.string().min(1).max(255)
});

export const POST = withValidation(
  nameUpdateSchema,
  async (validatedData: z.infer<typeof nameUpdateSchema>) => {
    const { data: chat, error } = await supabase
      .from('chats')
      .update({ 
        name: validatedData.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedData.chatId)
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to update chat name');
    }

    return createSuccessResponse({
      message: 'Chat name updated successfully',
      chat
    });
  }
); 