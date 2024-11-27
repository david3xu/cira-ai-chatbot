import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DatabaseHealthService } from '@/lib/services/database/HealthCheckService';

export async function databaseHealthMiddleware(
  request: NextRequest,
  next: () => Promise<NextResponse>
) {
  // Skip health check for non-API routes or health check endpoint itself
  if (!request.url.includes('/api/') || request.url.includes('/api/health')) {
    return next();
  }

  try {
    const { isHealthy, errors } = await DatabaseHealthService.performHealthCheck();

    if (!isHealthy) {
      console.error('Database health check failed:', errors);
      return new NextResponse(
        JSON.stringify({ 
          error: 'Database health check failed', 
          details: errors 
        }),
        { 
          status: 503, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    return next();
  } catch (error) {
    console.error('Error in database health middleware:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
} 