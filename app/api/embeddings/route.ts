import { NextRequest, NextResponse } from 'next/server';
import { EmbeddingService } from '@/lib/features/ai/services/embeddingService';

export async function POST(req: NextRequest) {
  try {
    const { input, model = "all-minilm" } = await req.json();

    if (!input) {
      return NextResponse.json(
        { error: 'Missing required input parameter' }, 
        { status: 400 }
      );
    }

    const embeddingResponse = await EmbeddingService.createEmbedding(input);

    return NextResponse.json(embeddingResponse);
  } catch (error) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate embedding', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
} 