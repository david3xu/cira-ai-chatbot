import { NextResponse } from 'next/server';
import { OllamaService } from '@/lib/features/ai/services/ollamaService';

export async function GET() {
  try {
    const models = await OllamaService.getModels(true);
    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error in /api/ollama/tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' }, 
      { status: 500 }
    );
  }
} 