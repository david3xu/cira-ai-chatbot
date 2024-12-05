import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const response = NextResponse.next()

  // Add CSP headers
  const cspHeader = `
    default-src 'self';
    connect-src 'self' 
      http://127.0.0.1:54321
      http://127.0.0.1:*
      http://localhost:*
      ws://localhost:*
      https://*.supabase.co
      https://*.supabase.net
      ${process.env.NEXT_PUBLIC_SUPABASE_URL}
      ${process.env.NEXT_PUBLIC_OLLAMA_SERVER_URL}
      ${process.env.NEXT_PUBLIC_BASE_URL};
    script-src 'self' 'unsafe-eval' 'unsafe-inline';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self' data:;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    worker-src 'self' blob:;
  `.replace(/\s{2,}/g, ' ').trim()

  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/* (API routes)
     * 2. /_next/* (Next.js internals)
     * 3. /fonts/* (inside public directory)
     * 4. /images/* (inside public directory)
     * 5. all root files inside public (e.g. /favicon.ico)
     */
    '/((?!api|_next|fonts|images|[\\w-]+\\.\\w+).*)',
  ],
}
