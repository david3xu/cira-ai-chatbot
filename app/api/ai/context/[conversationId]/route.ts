import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withValidation } from '@/lib/middleware/validation';
import { createSuccessResponse } from '@/lib/utils/apiUtils';
import { supabase } from '@/lib/supabase/client';

const conversationContextSchema = z.object({
  context: z.string().min(1, 'Context is required')
});

export const POST = withValidation(conversationContextSchema, async (validatedData, req: NextRequest) => {
  // Extract conversationId from URL
  const conversationId = req.url.split('/').pop();

  // Update conversation with new context
  const { data: chat, error } = await supabase
    .from('chats')
    .update({
      metadata: {
        context: validatedData.context,
        updated_at: new Date().toISOString()
      }
    })
    .eq('id', conversationId || '')
    .select()
    .single();

  if (error) throw error;

  return createSuccessResponse({
    message: 'Context updated successfully',
    chat
  });
});
