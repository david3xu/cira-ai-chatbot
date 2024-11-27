import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  const { chatId, operation } = await req.json();
  
  try {
    const { data, error } = await supabaseAdmin.rpc(
      `${operation}_chat_transaction`,
      { chat_id: chatId }
    );

    if (error) throw error;
    return createSuccessResponse({ transaction: data });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Transaction operation failed',
      500
    );
  }
} 