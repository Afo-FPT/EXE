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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// Generate order number
function generateOrderNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${year}${month}${day}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Creating new order...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Parse request body
    const orderData = await request.json();
    console.log('📦 Order data received:', {
      customer: orderData.customer,
      itemsCount: orderData.items?.length || 0,
      totalAmount: orderData.finalAmount
    });

    // Validate required fields
    if (!orderData.customer || !orderData.shipping || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required order data' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = generateOrderNumber();
    console.log('🔢 Generated order number:', orderNumber);

    // Create order
    const order = new Order({
      orderNumber,
      customer: orderData.customer,
      shipping: orderData.shipping,
      payment: orderData.payment,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      totalItems: orderData.totalItems,
      totalDiscount: orderData.totalDiscount,
      finalAmount: orderData.finalAmount,
      notes: orderData.notes || '',
      status: 'pending',
    });

    // Save to database
    const savedOrder = await order.save();
    console.log('✅ Order saved successfully:', savedOrder.orderNumber);

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        orderNumber: savedOrder.orderNumber,
        id: savedOrder._id,
        status: savedOrder.status,
        totalAmount: savedOrder.finalAmount,
        createdAt: savedOrder.createdAt,
      }
    });

  } catch (error) {
    console.error('❌ Error creating order:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching orders...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    // Build query
    let query: any = {};
    if (userId) query['customer.userId'] = userId;
    if (status) query.status = status;

    // Fetch orders
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    console.log('✅ Found orders:', orders.length);

    return NextResponse.json({
      success: true,
      data: orders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: order.customer,
        shipping: order.shipping,
        payment: order.payment,
        items: order.items,
        totalAmount: order.totalAmount,
        totalItems: order.totalItems,
        totalDiscount: order.totalDiscount,
        finalAmount: order.finalAmount,
        status: order.status,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
      pagination: {
        page: 1,
        limit: 50,
        total: orders.length,
        totalPages: 1,
      }
    });

  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}