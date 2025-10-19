import { NextRequest, NextResponse } from 'next/server';
import { googleLogin } from '@/lib/auth';

// POST /api/google-login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await googleLogin(body);
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Google login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
