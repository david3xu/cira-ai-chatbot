import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { supabaseAdmin } from '@/lib/supabase/client';

const chatIdSchema = z.string().uuid('Invalid chat ID format');

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    // Await params validation
    const validatedParams = await Promise.resolve(params);
    const chatId = await chatIdSchema.parseAsync(validatedParams.chatId);

    const { data: messages, error } = await supabaseAdmin
      .from('chat_history')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database query error:', error);
      return createErrorResponse(`Failed to fetch chat history: ${error.message}`, 500);
    }

    return createSuccessResponse({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse(`Validation error: ${error.message}`, 400);
    }
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch chat messages',
      500
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = await chatIdSchema.parseAsync(params.chatId);

    // Delete chat and its messages (cascade delete will handle chat_history)
    const { error } = await supabaseAdmin
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) {
      console.error('Database deletion error:', error);
      return createErrorResponse(`Failed to delete chat: ${error.message}`, 500);
    }

    return createSuccessResponse({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    if (error instanceof z.ZodError) {
      return createErrorResponse(`Validation error: ${error.message}`, 400);
    }
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to delete chat',
      500
    );
  }
} 