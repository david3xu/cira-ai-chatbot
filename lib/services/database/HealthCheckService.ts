import { supabaseAdmin } from '@/lib/supabase/client';

export class DatabaseHealthService {
  static async verifySetup(): Promise<boolean> {
    const { data: isValid, error } = await supabaseAdmin.rpc('verify_database_setup');
    
    if (error) {
      console.error('Database verification failed:', error);
      return false;
    }
    
    return !!isValid;
  }

  static async cleanupTransactions(): Promise<number> {
    const { data: cleanedCount, error } = await supabaseAdmin.rpc('cleanup_stale_transactions');
    
    if (error) {
      console.error('Transaction cleanup failed:', error);
      return 0;
    }
    
    return cleanedCount || 0;
  }

  static async performHealthCheck(): Promise<{
    isHealthy: boolean;
    cleanedTransactions: number;
    errors?: string[];
  }> {
    const errors: string[] = [];
    let isHealthy = true;
    let cleanedTransactions = 0;

    try {
      // Verify database setup
      const setupValid = await this.verifySetup();
      if (!setupValid) {
        errors.push('Database setup verification failed');
        isHealthy = false;
      }

      // Clean up stale transactions
      cleanedTransactions = await this.cleanupTransactions();

    } catch (error) {
      isHealthy = false;
      errors.push(error instanceof Error ? error.message : 'Unknown error during health check');
    }

    return {
      isHealthy,
      cleanedTransactions,
      ...(errors.length > 0 && { errors })
    };
  }
} 