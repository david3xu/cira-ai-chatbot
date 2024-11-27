import { NextResponse } from 'next/server';
import { checkOllamaHealth } from '@/lib/features/ai/services/ollama';

export async function GET() {
  try {
    const isHealthy = await checkOllamaHealth();
    
    if (!isHealthy) {
      return NextResponse.json(
        { status: 'error', message: 'Ollama server is not responding' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { status: 'ok', message: 'Ollama server is healthy' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 