import { answerQuestion } from '@/lib/features/ai/actions/answerQuestion';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { ChatError, ErrorCodes } from '@/lib/types/errors';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEFAULT_USER_ID;

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { content, options } = await req.json();
    const messagePairId = options.messagePairId || crypto.randomUUID();

    // Use the model from options, fallback to default if not provided
    const selectedModel = options.model;
    console.log('Using model:', selectedModel);

    // Start transaction
    const { data: messages, error } = await supabase.rpc('create_message_pair', {
      p_message_pair_id: messagePairId,
      p_content: content,
      p_model: selectedModel,
      p_domination_field: options.dominationField,
      p_chat_id: params.chatId,
      p_custom_prompt: options.customPrompt,
      p_chat_topic: options.chatTopic
    });

    if (error) {
      throw new ChatError(
        'Failed to save message pair',
        ErrorCodes.DB_ERROR,
        { messagePairId }
      );
    }

    let streamingContent = '';
    
    // Use answerQuestion with streaming
    const response = await answerQuestion({
      messages: messages.map((msg: {
        id: string;
        chat_id?: string;
        message_pair_id: string;
        created_at?: string;
        updated_at?: string;
        user_content: string;
        user_role: string;
        assistant_content: string;
        assistant_role: string;
        domination_field: string;
        model?: string;
        status: string;
      }) => ({
        id: msg.id,
        chatId: msg.chat_id || '',
        messagePairId: msg.message_pair_id,
        createdAt: msg.created_at || new Date().toISOString(),
        updatedAt: msg.updated_at || new Date().toISOString(),
        user_content: msg.user_content,
        user_role: msg.user_role as 'user' | 'system',
        assistant_content: msg.assistant_content,
        assistant_role: msg.assistant_role as 'assistant' | 'system',
        domination_field: msg.domination_field,
        model: msg.model || '',
        status: msg.status as 'sending' | 'success' | 'failed'
      })),
      onToken: async (token) => {
        streamingContent += token;
      },
      chatId: params.chatId,
      model: options.model,
      dominationField: options.dominationField,
      customPrompt: options.customPrompt
    });

    return NextResponse.json({ content: streamingContent });

  } catch (error) {
    if (error instanceof ChatError) {
      throw error;
    }
    throw new ChatError(
      'Stream processing failed',
      ErrorCodes.STREAM_ERROR,
      { chatId: params.chatId }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    let userId = DEFAULT_USER_ID;

    const { data: chat, error } = await supabase
      .from('chats')
      .select('*')
      .eq('id', params.chatId)
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch chat' },
        { status: 500 }
      );
    }

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
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

export async function DELETE(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    // Create a Supabase client with service role key for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    const chatId = params.chatId;
    const defaultUserId = process.env.NEXT_PUBLIC_DEFAULT_USER_ID;
    
    if (!defaultUserId) {
      console.error('NEXT_PUBLIC_DEFAULT_USER_ID not set in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // First verify the chat exists and belongs to default user
    const { data: chat, error: chatFetchError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', defaultUserId)
      .single();

    if (chatFetchError || !chat) {
      console.error('Chat not found:', chatFetchError);
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Delete all messages associated with the chat first
    const { error: messagesError } = await supabase
      .from('chat_history')
      .delete()
      .eq('chat_id', chatId)
      .eq('user_id', defaultUserId);

    if (messagesError) {
      console.error('Failed to delete chat history:', messagesError);
      return NextResponse.json(
        { error: 'Failed to delete chat history' },
        { status: 500 }
      );
    }

    // Then delete the chat itself
    const { error: chatError } = await supabase
      .from('chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', defaultUserId);

    if (chatError) {
      console.error('Failed to delete chat:', chatError);
      return NextResponse.json(
        { error: 'Failed to delete chat' },
        { status: 500 }
      );
    }

    console.log('Successfully deleted chat:', chatId);
    return NextResponse.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 