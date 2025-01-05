import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { answerQuestion } from '@/lib/features/ai/actions/answerQuestion';

export async function POST(req: Request) {
  try {
    const { content, options } = await req.json();

    // 1. Save user message
    const { data: message, error: dbError } = await supabase
      .from('chat_history')
      .insert({
        message_pair_id: crypto.randomUUID(),
        user_content: content,
        user_role: 'user',
        status: 'processing',
        model: options?.model,
        domination_field: options?.dominationField
      })
      .select()
      .single();

    if (dbError) throw dbError;

    // 2. Use answerQuestion for better context handling and domain-specific processing
    const response = await answerQuestion({
      messages: [{
        id: message.id,
        chatId: message.chat_id || message.id,
        messagePairId: message.message_pair_id,
        createdAt: message.created_at || new Date().toISOString(),
        updatedAt: message.updated_at || new Date().toISOString(),
        userContent: message.user_content,
        userRole: message.user_role as 'user' | 'system',
        assistantContent: message.assistant_content,
        assistantRole: message.assistant_role as 'assistant' | 'system',
        dominationField: message.domination_field,
        model: message.model || '',
        status: message.status as 'sending' | 'streaming' | 'success' | 'failed'
      }],
      onToken: async () => {}, 
      chatId: message.id,
      model: options?.model,
      dominationField: options?.dominationField,
      customPrompt: options?.customPrompt
    });

    // 3. Update with AI response
    const { error: updateError } = await supabase
      .from('chat_history')
      .update({ 
        assistant_content: response.content,
        assistant_role: 'assistant',
        status: 'completed'
      })
      .eq('id', message.id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: response.content });
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 