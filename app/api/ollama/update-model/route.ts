import { NextResponse } from 'next/server';
// import { Ollama } from 'ollama';
import { supabase } from '@/lib/supabase';

// const OLLAMA_SERVER_URL = process.env.NEXT_PUBLIC_OLLAMA_SERVER_URL || 'http://localhost:11434';

// const ollama = new Ollama({
//   host: OLLAMA_SERVER_URL
// });

export async function POST(request: Request) {
  try {
    const { model } = await request.json();
    
    if (!model) {
      return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
    }

    // Update directly in Supabase
    const { error: supabaseError } = await supabase
      .from('chat_history')
      .update({ model: model })
      .is('chat_id', null);

    if (supabaseError) {
      throw new Error('Failed to update model in database');
    }

    return NextResponse.json({ 
      success: true,
      message: 'Model updated successfully',
      model 
    });
  } catch (error) {
    console.error('Error updating model:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update model' }, 
      { status: 500 }
    );
  }
} 