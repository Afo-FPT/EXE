import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import ChessPiece from '@/lib/models/ChessPiece';
import { put } from '@vercel/blob';

// Increase body size limit for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500mb', // Vercel Blob supports up to 500MB
    },
  },
};

// GET /api/chess-pieces
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const chessPieces = await ChessPiece.find({ isActive: true })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      chessPieces
    }, { status: 200 });
    
  } catch (error) {
    console.error('Get chess pieces error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch chess pieces',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/chess-pieces
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Handle FormData
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const type = formData.get('type') as string;
    const collection = formData.get('collection') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const discountPercent = formData.get('discountPercent') as string;
    const stock = formData.get('stock') as string;
    const model3D = formData.get('model3D') as File;
    
    console.log('📡 Chess pieces POST request received');
    console.log('📡 Request headers:', Object.fromEntries(request.headers.entries()));
    
    console.log('📝 Received chess piece FormData:', {
      name, type, collection, description, price, discountPercent, stock,
      modelName: model3D?.name, modelSize: model3D?.size
    });
    
    let model3DUrl = '';
    
    // Upload 3D model to Vercel Blob if provided
    if (model3D && model3D.size > 0) {
      const fileSizeMB = model3D.size / (1024 * 1024);
      console.log(`📁 File size: ${fileSizeMB.toFixed(2)} MB`);
      
      if (fileSizeMB > 500) {
        console.log('❌ File too large:', fileSizeMB, 'MB');
        return NextResponse.json({
          success: false,
          message: 'File quá lớn! Vui lòng chọn file nhỏ hơn 500MB.',
          fileSize: fileSizeMB
        }, { status: 413 });
      }
      
      try {
        console.log('📁 Uploading 3D model to Vercel Blob...');
        
        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = model3D.name.split('.').pop();
        const fileName = `chess-piece-${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
        
        // Upload to Vercel Blob
        const blob = await put(fileName, model3D, {
          access: 'public',
        });
        
        model3DUrl = blob.url;
        console.log('✅ 3D model uploaded successfully:', model3DUrl);
        
      } catch (uploadError) {
        console.error('❌ Blob upload error:', uploadError);
        return NextResponse.json({
          success: false,
          message: 'Failed to upload 3D model',
          error: uploadError instanceof Error ? uploadError.message : 'Unknown error'
        }, { status: 500 });
      }
    }
    
    console.log('💾 Creating chess piece...');
    
    // Create new chess piece
    const newChessPiece = new ChessPiece({
      name,
      type,
      collection,
      description,
      price: parseFloat(price),
      discountPercent: parseFloat(discountPercent),
      stock: parseInt(stock),
      model3D: model3DUrl || model3D?.name || ''
    });
    
    console.log('💾 Saving chess piece to database...');
    await newChessPiece.save();
    console.log('✅ Chess piece saved successfully:', newChessPiece._id);
    
    return NextResponse.json({
      success: true,
      message: 'Chess piece created successfully',
      chessPiece: newChessPiece
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create chess piece error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create chess piece',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
