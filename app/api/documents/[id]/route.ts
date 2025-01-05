import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';
import { supabase } from '@/lib/supabase/client';

const updateSchema = z.object({
  title: z.string().optional(),
  type: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  chatId: z.string().uuid('Invalid chat ID').optional()
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        *,
        document_chunks (
          id,
          content,
          sequence,
          embedding,
          created_at
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;
    if (!document) return createErrorResponse('Document not found', 404);

    return createSuccessResponse({ document });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to fetch document',
      500
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validatedData = await updateSchema.parseAsync(body);

    const { data: document, error } = await supabase
      .from('documents')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return createSuccessResponse({ document });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to update document',
      500
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete document chunks
    await supabase
      .from('document_chunks')
      .delete()
      .eq('document_id', params.id);

    // Delete document metadata
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    // Remove files from storage
    await supabase.storage
      .from('documents')
      .remove([`${params.id}`]);

    return createSuccessResponse({ 
      message: 'Document and associated data deleted successfully' 
    });
  } catch (error) {
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to delete document',
      500
    );
  }
}
