import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ChessPiece from '@/lib/models/ChessPiece';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

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
    const model3D = (formData.get('model3DFile') as File) || (formData.get('model3D') as unknown as File);
    
    const updateData: any = {
      name,
      type,
      collection,
      description,
      price: parseFloat(price),
      discountPercent: parseFloat(discountPercent),
      stock: parseInt(stock)
    };
    
    if (model3D && (model3D as File).size > 0) {
      const bytes = await (model3D as File).arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'models');
      await mkdir(uploadsDir, { recursive: true });
      const timestamp = Date.now();
      const randomSuffix = Math.round(Math.random() * 1e9);
      const ext = path.extname((model3D as File).name) || '.glb';
      const filename = `model-${timestamp}-${randomSuffix}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      await writeFile(filePath, buffer);
      updateData.model3D = `/uploads/models/${filename}`;
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
