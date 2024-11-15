import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createNewChat } from '@/actions/chat/createChat';
import { cookies } from 'next/headers';

const defaultModel = process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'llama3.1';

const initRequestSchema = z.object({
  chatId: z.string().uuid(),
  customPrompt: z.string().optional(),
  model: z.string().optional().default(defaultModel),
  dominationField: z.string().optional().default('Normal Chat'),
});

// Adjust rate limiting settings
const INIT_COOLDOWN = 5000; // 5 seconds
const recentInits = new Map<string, number>();

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const sessionId = cookieStore.get('session-id')?.value || 'default';
    
    // Check rate limiting with better cleanup
    const now = Date.now();
    const lastInit = recentInits.get(sessionId);
    
    // Clean up old entries
    Array.from(recentInits.entries()).forEach(([id, timestamp]) => {
      if (now - timestamp > INIT_COOLDOWN) {
        recentInits.delete(id);
      }
    });

    if (lastInit && now - lastInit < INIT_COOLDOWN) {
      return NextResponse.json(
        { success: false, error: 'Please wait before initializing another chat' },
        { status: 429 }
      );
    }

    recentInits.set(sessionId, now);
    
    const body = await request.json();
    const validatedData = initRequestSchema.parse(body);
    
    const newChat = await createNewChat({
      chatId: validatedData.chatId,
      customPrompt: validatedData.customPrompt,
      model: validatedData.model,
      dominationField: validatedData.dominationField || 'Normal Chat'
    });

    return NextResponse.json({ 
      success: true, 
      chat: newChat 
    });
  } catch (error) {
    console.error('Chat initialization error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid initialization data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to initialize chat' },
      { status: 500 }
    );
  }
} 