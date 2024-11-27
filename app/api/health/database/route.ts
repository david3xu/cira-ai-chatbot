import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils/apiUtils';

export async function GET(req: NextRequest) {
  try {
    // Check database setup
    const { data: isValid, error: setupError } = await supabaseAdmin.rpc('verify_database_setup');
    
    if (setupError) {
      throw new Error(`Database verification failed: ${setupError.message}`);
    }

    if (!isValid) {
      return createErrorResponse('Database setup is incomplete', 500);
    }

    // Clean up stale transactions
    const { data: cleanedCount, error: cleanupError } = await supabaseAdmin.rpc('cleanup_stale_transactions');
    
    if (cleanupError) {
      throw new Error(`Transaction cleanup failed: ${cleanupError.message}`);
    }

    // Add transaction health check
    const { data: staleTransactions, error: staleError } = await supabaseAdmin
      .from('stale_transactions')
      .select('count')
      .filter('cleaned_at', 'is', null);

    if (staleError) {
      throw new Error(`Failed to check stale transactions: ${staleError.message}`);
    }

    return createSuccessResponse({
      status: 'healthy',
      cleanedTransactions: cleanedCount,
      databaseSetup: isValid
    });

  } catch (error) {
    console.error('Database health check failed:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Database health check failed',
      500
    );
  }
} 