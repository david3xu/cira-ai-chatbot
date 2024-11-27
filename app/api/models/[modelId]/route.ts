import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/features/ai/config/openai';

export async function GET(
  request: NextRequest,
  { params }: { params: { modelId: string } }
) {
  try {
    const model = await openai.models.retrieve(params.modelId);
    return NextResponse.json(model);
  } catch (error) {
    console.error('Error retrieving model:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve model' },
      { status: 500 }
    );
  }
} 