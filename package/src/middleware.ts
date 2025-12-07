import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const contentLength = request.headers.get('content-length');
    
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      console.log(`📏 Request size: ${sizeInMB.toFixed(2)} MB`);
      
      // Allow up to 50MB - temporarily increase to 100MB for testing
      if (sizeInMB > 100) {
        console.log('❌ Request too large:', sizeInMB, 'MB');
        return NextResponse.json({
          success: false,
          message: 'Request quá lớn! Vui lòng chọn file nhỏ hơn 100MB.',
          size: sizeInMB
        }, { status: 413 });
      }
    }
  }
  
  return NextResponse.next();
}

// Limit middleware to API routes only
export const config = {
  matcher: ['/api/:path*'],
};
