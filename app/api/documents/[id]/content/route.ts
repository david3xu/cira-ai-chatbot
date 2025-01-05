import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { supabase } from '@/lib/supabase/client';

// GET - Fetch document content
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'text';

    const { data: chunks, error } = await supabase
      .from('document_chunks')
      .select('content, sequence, metadata')
      .eq('document_id', params.id)
      .order('sequence', { ascending: true });

    if (error) throw error;

    let content;
    if (format === 'json') {
      content = chunks;
    } else {
      content = chunks?.map(chunk => chunk.content).join('\n\n');
    }

    return createSuccessResponse({ content });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch document content',
      500
    );
  }
}
