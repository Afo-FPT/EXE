import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

// PUT /api/orders/[id]/payment
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { paymentStatus } = await request.json();
    const { id } = await context.params;
    
    // Mock response for now
    return NextResponse.json({
      success: true,
      message: 'Payment status updated successfully',
      order: { _id: id, paymentStatus }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Update payment status error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update payment status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
