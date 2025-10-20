import { NextRequest, NextResponse } from 'next/server';
import { signin } from '@/lib/auth';

// POST /api/signin
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/signin - Starting...');
    const body = await request.json();
    console.log('📝 Signin request body:', body);
    
    const result = await signin(body);
    console.log('📡 Signin result:', result);
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      console.log('❌ Signin failed:', result.message);
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('❌ Signin error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
