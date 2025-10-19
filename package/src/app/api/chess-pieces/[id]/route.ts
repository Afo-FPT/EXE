import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ChessPiece from '@/lib/models/ChessPiece';

// GET /api/chess-pieces/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    const chessPiece = await ChessPiece.findById(id);
    
    if (!chessPiece) {
      return NextResponse.json({
        success: false,
        message: 'Chess piece not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      chessPiece
    }, { status: 200 });
    
  } catch (error) {
    console.error('Get chess piece error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch chess piece',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/chess-pieces/[id]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const collection = formData.get('collection') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const discountPercent = formData.get('discountPercent') as string;
    const stock = formData.get('stock') as string;
    const model3D = formData.get('model3D') as File;
    
    const updateData: any = {
      name,
      type,
      collection,
      description,
      price: parseFloat(price),
      discountPercent: parseFloat(discountPercent),
      stock: parseInt(stock)
    };
    
    if (model3D && model3D.size > 0) {
      updateData.model3D = model3D.name;
    }
    
    const updatedChessPiece = await ChessPiece.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedChessPiece) {
      return NextResponse.json({
        success: false,
        message: 'Chess piece not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Chess piece updated successfully',
      chessPiece: updatedChessPiece
    }, { status: 200 });
    
  } catch (error) {
    console.error('Update chess piece error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update chess piece',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/chess-pieces/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    const deletedChessPiece = await ChessPiece.findByIdAndDelete(id);
    
    if (!deletedChessPiece) {
      return NextResponse.json({
        success: false,
        message: 'Chess piece not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Chess piece deleted successfully'
    }, { status: 200 });
    
  } catch (error) {
    console.error('Delete chess piece error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete chess piece',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
