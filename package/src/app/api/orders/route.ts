import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

// GET /api/orders
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Mock data for orders
    const mockOrders: any[] = [];
    
    return NextResponse.json({
      success: true,
      orders: mockOrders,
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
