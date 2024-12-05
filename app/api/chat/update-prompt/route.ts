import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withValidation } from '@/lib/middleware/validation';
import { createSuccessResponse } from '@/lib/utils/apiUtils';
import { supabase } from '@/lib/supabase/client';

const promptUpdateSchema = z.object({
  chatId: z.string().uuid('Invalid chat ID format'),
  customPrompt: z.string().nullable()
});

export const POST = withValidation(
  promptUpdateSchema,
  async (validatedData: z.infer<typeof promptUpdateSchema>) => {
    const { data: chat, error } = await supabase
      .from('chats')
      .update({ 
        custom_prompt: validatedData.customPrompt,
        updated_at: new Date().toISOString()
      })
      .eq('id', validatedData.chatId)
      .select('*')
      .single();

    if (error) {
      throw new Error('Failed to update chat prompt');
    }

    return createSuccessResponse({
      message: 'Prompt updated successfully',
      chat
    });
  }
);
