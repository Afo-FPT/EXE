import { NextRequest, NextResponse } from 'next/server';

// GET /api/test
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/test - Starting...');
    console.log('🔍 Request URL:', request.url);
    console.log('🔍 Request method:', request.method);
    
    return NextResponse.json({
      success: true,
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasDbUri: !!process.env.DB_URI
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Test API error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Test API failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
