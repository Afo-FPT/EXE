import { NextRequest, NextResponse } from 'next/server';
import { signup, signin, googleLogin } from '@/lib/auth';

// POST /api/signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await signup(body);
    
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
