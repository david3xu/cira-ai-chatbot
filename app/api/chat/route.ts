import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { DEFAULT_PROMPT } from '@/lib/features/ai/config/constants';

// Use environment variables
const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEFAULT_USER_ID;

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    let userId = DEFAULT_USER_ID;

    // Get request body
    const body = await req.json();
    console.log('Request body:', body);

    // Destructure with default values
    const {
      model,
      name = 'New Chat',
      dominationField,
      customPrompt
    } = body;
    
    // Validate required fields
    if (!model) {
      return NextResponse.json(
        { error: 'Model is required' },
        { status: 400 }
      );
    }

    if (!dominationField) {
      return NextResponse.json(
        { error: 'Domination field is required' },
        { status: 400 }
      );
    }

    // Use default prompt if none provided
    const finalPrompt = customPrompt || DEFAULT_PROMPT;
    
    console.log('Using model:', model);
    console.log('Using domination field:', dominationField);
    console.log('Using custom prompt:', finalPrompt, customPrompt ? '(user provided)' : '(default)');

    const { data: chat, error: rpcError } = await supabase.rpc('create_chat', {
      p_user_id: userId,
      p_name: name,
      p_model: model,
      p_domination_field: dominationField,
      p_custom_prompt: finalPrompt
    });

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      return NextResponse.json(
        { error: 'Failed to create chat' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: chat });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    let userId = DEFAULT_USER_ID;

    const { data: chats, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chats' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: chats });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
