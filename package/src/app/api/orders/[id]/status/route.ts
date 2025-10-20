import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

// Order Schema
const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: {
    userId: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  shipping: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
  },
  payment: {
    method: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' },
    paidAt: { type: Date },
    transactionId: { type: String },
  },
  items: [{
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    productImage: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  totalDiscount: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  notes: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  confirmedAt: { type: Date },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// PUT /api/orders/[id]/status
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔄 Updating order status...');
    
    await connectDB();
    console.log('✅ Connected to database');
    
    const { status, adminNotes } = await request.json();
    const { id } = await context.params;
    
    console.log('📦 Order ID:', id);
    console.log('📦 New status:', status);
    console.log('📦 Admin notes:', adminNotes);
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid status value'
      }, { status: 400 });
    }
    
    // Update order status
    const updateData: any = {
      status,
      updatedAt: new Date(),
      adminNotes: adminNotes || '',
    };
    
    // Add timestamp based on status
    switch (status) {
      case 'confirmed':
        updateData.confirmedAt = new Date();
        break;
      case 'shipped':
        updateData.shippedAt = new Date();
        break;
      case 'delivered':
        updateData.deliveredAt = new Date();
        break;
      case 'cancelled':
        updateData.cancelledAt = new Date();
        break;
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedOrder) {
      return NextResponse.json({
        success: false,
        message: 'Order not found'
      }, { status: 404 });
    }
    
    console.log('✅ Order status updated successfully:', updatedOrder.orderNumber);
    
    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        _id: updatedOrder._id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        updatedAt: updatedOrder.updatedAt,
        adminNotes: updatedOrder.adminNotes,
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Update order status error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update order status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
