import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import MysteryBag from '@/lib/models/MysteryBag';

// GET /api/mystery-bags/admin/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    // Mock response
    return NextResponse.json({
      success: true,
      bag: { _id: id, name: 'Mock Bag', price: 0 }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Get mystery bag error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch mystery bag',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/mystery-bags/admin/[id]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    // Handle FormData
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const collection = formData.get('collection') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const discountPercent = formData.get('discountPercent') as string;
    const stock = formData.get('stock') as string;
    const image = formData.get('image') as File;
    
    console.log('Received mystery bag update FormData:', {
      id, name, collection, description, price, discountPercent, stock,
      imageName: image?.name, imageSize: image?.size
    });
    
    // Mock response
    return NextResponse.json({
      success: true,
      message: 'Mystery bag updated successfully',
      bag: { 
        _id: id, 
        name, 
        collection, 
        description, 
        price: parseFloat(price), 
        discountPercent: parseFloat(discountPercent),
        stock: parseInt(stock),
        image: image?.name 
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('Update mystery bag error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update mystery bag',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/mystery-bags/admin/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 DELETE /api/mystery-bags/admin/[id] - Starting...');
    await connectDB();
    console.log('✅ Database connected');
    
    const { id } = await context.params;
    console.log('🗑️ Deleting mystery bag with ID:', id);
    
    // Find and delete the mystery bag
    const deletedBag = await MysteryBag.findByIdAndDelete(id);
    
    if (!deletedBag) {
      console.log('❌ Mystery bag not found with ID:', id);
      return NextResponse.json({
        success: false,
        message: 'Mystery bag not found'
      }, { status: 404 });
    }
    
    console.log('✅ Mystery bag deleted successfully:', deletedBag._id);
    
    return NextResponse.json({
      success: true,
      message: 'Mystery bag deleted successfully',
      deletedBag
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Delete mystery bag error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete mystery bag',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
