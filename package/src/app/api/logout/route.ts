import { NextRequest, NextResponse } from 'next/server';

// POST /api/logout
export async function POST(request: NextRequest) {
  try {
    // Logout is handled on client side by clearing tokens
    // This endpoint is mainly for consistency with the API structure
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Logout error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
