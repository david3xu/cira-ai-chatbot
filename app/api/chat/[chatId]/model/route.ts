import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { supabaseAdmin } from '@/lib/supabase/client';
import { OllamaService } from '@/lib/features/ai/services/ollamaService';

const updateModelSchema = z.object({
  model: z.string().min(1, 'Model is required')
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = params.chatId;
    const body = await req.json();
    const { model } = await updateModelSchema.parseAsync(body);

    // Verify model exists
    const models = await OllamaService.getModels(true);
    const modelExists = models.some(m => 
      m.name.startsWith(model) || 
      m.name.includes(model)
    );
    
    if (!modelExists) {
      return createErrorResponse(`Model ${model} not found`, 400);
    }

    // Update the chat model
    const { error } = await supabaseAdmin
      .from('chats')
      .update({ model })
      .eq('id', chatId);

    if (error) {
      throw new Error(`Failed to update model: ${error.message}`);
    }

    return createSuccessResponse({ 
      message: 'Model updated successfully',
      model 
    });
  } catch (error) {
    console.error('Error updating model:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse(`Validation error: ${error.message}`, 400);
    }
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to update model',
      500
    );
  }
} 