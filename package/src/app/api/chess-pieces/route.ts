import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ChessPiece from '@/lib/models/ChessPiece';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';

// Increase body size limit for file uploads
// On App Router with request.formData(), Next.js streams the body; no size limit needed here.
// Keeping config out to avoid unintended small size caps from legacy settings.

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
    // model3D can be provided either as a direct URL (string) or a File upload
    const model3DUrlOrFile = (formData.get('model3DFile') as File | null) ?? formData.get('model3D');
    
    // Get multiple images
    const images: File[] = [];
    let imageIndex = 0;
    while (formData.get(`image${imageIndex}`)) {
      const image = formData.get(`image${imageIndex}`) as File;
      if (image && image.size > 0) {
        images.push(image);
      }
      imageIndex++;
    }
    
    console.log('📡 Chess pieces POST request received');
    console.log('📡 Request headers:', Object.fromEntries(request.headers.entries()));
    
    console.log('📝 Received chess piece FormData:', {
      name, type, collection, description,
      imagesCount: images.length,
      imagesInfo: images.map(img => ({
        name: img.name, 
        size: img.size, 
        type: img.type
      }))
    });
    
    // Validate images count
    if (images.length > 4) {
      return NextResponse.json({
        success: false,
        message: 'Tối đa chỉ được thêm 4 ảnh!'
      }, { status: 400 });
    }
    
    // Check image file sizes (increased limit for EC2)
    for (const image of images) {
      const fileSizeMB = image.size / (1024 * 1024);
      console.log(`📁 Image size: ${fileSizeMB.toFixed(2)} MB`);
      
      if (fileSizeMB > 50) {
        console.log('❌ Image too large:', fileSizeMB, 'MB');
        return NextResponse.json({
          success: false,
          message: `Ảnh "${image.name}" quá lớn! Vui lòng chọn ảnh nhỏ hơn 50MB.`,
          fileSize: fileSizeMB
        }, { status: 413 });
      }
    }
    
    // Validate required fields
    if (!name || !type || !collection || !description) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields: name, type, collection, description'
      }, { status: 400 });
    }
    
    console.log('💾 Creating chess piece...');
    
    // Process multiple images
    const imagesBase64: string[] = [];
    if (images.length > 0) {
      console.log('🖼️ Processing chess piece images...');
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const arrayBuffer = await image.arrayBuffer();
        const imageBase64 = `data:${image.type};base64,${Buffer.from(arrayBuffer).toString('base64')}`;
        imagesBase64.push(imageBase64);
        console.log(`✅ Image ${i + 1} processed, length:`, imageBase64.length);
      }
    } else {
      console.log('⚠️ No chess piece images provided');
    }
    
    // Handle model3D: if a file is provided, save it under public/uploads/models
    let model3DPath = '';
    if (model3DUrlOrFile) {
      if (typeof model3DUrlOrFile === 'string') {
        model3DPath = model3DUrlOrFile;
      } else {
        const modelFile = model3DUrlOrFile as File;
        if (modelFile && modelFile.size > 0) {
          const bytes = await modelFile.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'models');
          await mkdir(uploadsDir, { recursive: true });
          const timestamp = Date.now();
          const rand = Math.round(Math.random() * 1e9);
          const ext = path.extname(modelFile.name) || '.glb';
          const filename = `model-${timestamp}-${rand}${ext}`;
          const filePath = path.join(uploadsDir, filename);
          await writeFile(filePath, buffer);
          model3DPath = `/uploads/models/${filename}`;
          console.log('✅ Saved model3D to', model3DPath);
        }
      }
    }

    console.log('💾 Creating chess piece with data:', {
      name, type, collection, description,
      hasModel3D: !!model3DPath,
      imagesCount: imagesBase64.length,
      totalImagesLength: imagesBase64.reduce((sum, img) => sum + img.length, 0)
    });

    const newChessPiece = new ChessPiece({
      name,
      type,
      collection,
      description,
      model3D: model3DPath,
      images: imagesBase64
    });
    
    console.log('💾 Saving chess piece to database...');
    await newChessPiece.save();
    console.log('✅ Chess piece saved successfully:', newChessPiece._id);
    console.log('📊 Saved chess piece data:', {
      _id: newChessPiece._id,
      name: newChessPiece.name,
      type: newChessPiece.type,
      collection: newChessPiece.collection,
      hasModel3D: !!newChessPiece.model3D,
      imagesCount: newChessPiece.images.length
    });
    
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
