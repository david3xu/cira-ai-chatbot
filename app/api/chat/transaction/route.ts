import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { supabase } from '@/lib/supabase/client';

export async function POST(req: NextRequest) {
  const { chatId, operation } = await req.json();
  
  try {
    let response;
    switch (operation) {
      case 'begin':
        response = await supabase
          .from('stale_transactions')
          .insert({
            chat_id: chatId,
            status: 'started'
          })
          .select('transaction_id')
          .single();
        break;
      case 'commit':
        response = await supabase
          .from('stale_transactions')
          .update({ 
            status: 'committed',
            cleaned_at: new Date().toISOString()
          })
          .eq('transaction_id', chatId)
          .eq('status', 'started')
          .select()
          .single();
        break;
      case 'rollback':
        response = await supabase
          .from('stale_transactions')
          .update({ 
            status: 'rolled_back',
            cleaned_at: new Date().toISOString()
          })
          .eq('transaction_id', chatId)
          .eq('status', 'started')
          .select()
          .single();
        break;
      default:
        throw new Error('Invalid transaction operation');
    }

    if (response.error) {
      console.error('Transaction error:', response.error);
      throw response.error;
    }
    
    return createSuccessResponse({ 
      transaction: { 
        transaction_id: response.data?.transaction_id || chatId,
        status: response.data?.status || 'unknown'
      }
    });
  } catch (error) {
    console.error('Transaction operation failed:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Transaction operation failed',
      500
    );
  }
} 