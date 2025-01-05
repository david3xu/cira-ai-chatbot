import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/supabase/types/database.types';
import { ChatError, ErrorCodes } from '@/lib/types/errors';
import { answerQuestion } from '@/lib/features/ai/actions/answerQuestion';
import { transformDatabaseMessage } from '@/lib/utils/messageTransformer';
import { DEFAULT_SESSION } from '@/lib/config/auth';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { content, options } = await req.json();
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  try {
    // Validate required fields
    if (!options?.messagePairId) {
      throw new ChatError(
        'Message pair ID is required',
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Get user from session or use default
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.warn('Session error, using default user:', sessionError);
    }

    // Use session user or fall back to default user
    const user = session?.user || DEFAULT_SESSION.user;

    // Get chat messages
    const { data: dbMessages, error: chatError } = await supabase
      .from('chat_history')
      .select('*')
      .eq('chat_id', options.chatId)
      .order('created_at', { ascending: true });

    if (chatError) throw chatError;

    // Transform database messages to ChatMessage type
    const chatMessages = dbMessages?.map(msg => transformDatabaseMessage(msg)) || [];

    // Create a TransformStream for streaming
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Keep track of accumulated content
    let accumulatedContent = '';

    console.log('🔄 [stream] Processing message with options:', {
      model: options.model,
      dominationField: options.dominationField,
      hasCustomPrompt: !!options.customPrompt,
      customPromptPreview: options.customPrompt ? `${options.customPrompt.slice(0, 50)}...` : null,
      customPromptLength: options.customPrompt?.length || 0
    });

    // Process AI response with streaming
    answerQuestion({
      messages: chatMessages,
      onToken: async (token) => {
        try {
          // Accumulate tokens
          accumulatedContent += token;

          // Write accumulated content to stream
          await writer.write(encoder.encode(`data: ${JSON.stringify({ content: accumulatedContent })}\n\n`));

          // Update message in database periodically (optional)
          await supabase
            .from('chat_history')
            .update({ 
              assistant_content: accumulatedContent,
              status: 'streaming'
            })
            .eq('message_pair_id', options.messagePairId)
            .eq('assistant_role', 'assistant');
        } catch (error) {
          console.error('Error in onToken:', error);
        }
      },
      chatId: options.chatId || options.messagePairId,
      model: options.model,
      dominationField: options.dominationField,
      customPrompt: options.customPrompt
    }).then(async (response) => {
      // If we got a chat topic, update the chat name
      if (response.chat_topic && options.chatId) {
        console.log('🏷️ Updating chat name with topic:', response.chat_topic);
        const { error: updateError } = await supabase
          .from('chats')
          .update({ name: response.chat_topic })
          .eq('id', options.chatId);

        if (updateError) {
          console.error('Failed to update chat name:', updateError);
        }
      }

      // Send final message with complete content
      await writer.write(encoder.encode(`data: ${JSON.stringify({ content: accumulatedContent, chat_topic: response.chat_topic, status: 'success' })}\n\n`));
      await writer.close();
    }).catch(async (error) => {
      console.error('❌ Error processing request:', error);
      
      // Update message status on error
      if (options?.messagePairId) {
        await supabase
          .from('chat_history')
          .update({ status: 'failed' })
          .eq('message_pair_id', options.messagePairId);
      }

      // Send error message
      await writer.write(encoder.encode(`data: ${JSON.stringify({ error: error.message, status: 'failed' })}\n\n`));
      await writer.close();
    });

    // Return streaming response
    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('❌ Error processing request:', error);
    
    // Update message status on error
    if (options?.messagePairId) {
      await supabase
        .from('chat_history')
        .update({ status: 'failed' })
        .eq('message_pair_id', options.messagePairId);
    }

    if (error instanceof ChatError) {
      throw error;
    }
    throw new ChatError(
      'Stream processing failed',
      ErrorCodes.STREAM_ERROR,
      { messagePairId: options.messagePairId }
    );
  }
} 
