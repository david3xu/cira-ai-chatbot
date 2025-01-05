import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { handleError } from '@/lib/utils/error';

export async function POST(req: Request) {
  try {
    const { messagePairId } = await req.json();

    if (!messagePairId) {
      return NextResponse.json(
        { error: 'Message pair ID is required' },
        { status: 400 }
      );
    }

    // Update both user and assistant messages atomically
    const { error } = await supabase
      .rpc('cancel_message_pair', {
        p_message_pair_id: messagePairId,
        p_reason: 'User cancelled'
      });

    if (error) {
      console.error('Failed to update aborted messages:', error);
      throw error;
    }

    // Send success response
    return NextResponse.json({
      success: true,
      message: 'Stream cancelled successfully'
    });

  } catch (error) {
    console.error('Abort handler error:', error);
    return NextResponse.json(
      { error: handleError(error).message },
      { status: 500 }
    );
  }
} 