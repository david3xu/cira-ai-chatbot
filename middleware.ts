import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Accept any request with default token
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
}
