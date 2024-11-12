import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getOllamaModels } from '@/lib/ollama';

export async function GET() {
  try {
    revalidatePath('/api/ollama/tags');

    const models = await getOllamaModels({
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error in /api/ollama/tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models', models: [] }, 
      { status: 500 }
    );
  }
} 