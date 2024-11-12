import { NextRequest, NextResponse } from 'next/server';
import { Ollama } from 'ollama'

const OLLAMA_SERVER_URL = process.env.NEXT_PUBLIC_OLLAMA_SERVER_URL || 'http://localhost:11434'

const ollama = new Ollama({
  host: OLLAMA_SERVER_URL
})

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = "mxbai-embed-large:latest" } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing required prompt parameter' }, 
        { status: 400 }
      );
    }

    const embeddingResponse = await ollama.embeddings({
      model,
      prompt,
    });

    if (!embeddingResponse.embedding || !Array.isArray(embeddingResponse.embedding)) {
      console.error('Invalid Ollama response:', embeddingResponse);
      throw new Error('Invalid embedding response from Ollama');
    }

    return NextResponse.json({ embedding: embeddingResponse.embedding });
  } catch (error) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      { error: 'Failed to generate embedding', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}
