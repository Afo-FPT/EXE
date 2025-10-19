import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

// PUT /api/orders/[id]/status
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { status } = await request.json();
    const { id } = await context.params;
    
    // Mock response for now
    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order: { _id: id, status }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Update order status error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update order status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
