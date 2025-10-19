import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import MysteryBag from '@/lib/models/MysteryBag';
import Collection from '@/lib/models/Collection';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET /api/mystery-bags
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/mystery-bags - Starting...');
    await connectDB();
    console.log('✅ Database connected');
    
    const mysteryBags = await MysteryBag.find({ isActive: true })
      .populate('collection', 'name')
      .sort({ createdAt: -1 });
    
    console.log('📦 Found mystery bags:', mysteryBags.length);
    console.log('📦 Mystery bags data:', mysteryBags);
    
    return NextResponse.json({
      success: true,
      data: mysteryBags
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Get mystery bags error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch mystery bags',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/mystery-bags
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/mystery-bags - Starting...');
    await connectDB();
    console.log('✅ Database connected');
    
    // Handle FormData
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const collection = formData.get('collection') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const discountPercent = formData.get('discountPercent') as string;
    const stock = formData.get('stock') as string;
    const image = formData.get('image') as File;
    
    console.log('Received FormData:', {
      name, collection, description, price, discountPercent, stock,
      imageName: image?.name, imageSize: image?.size
    });
    
    // Handle file upload
    let imagePath = '';
    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
      await mkdir(uploadsDir, { recursive: true });
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomSuffix = Math.round(Math.random() * 1E9);
      const fileExtension = path.extname(image.name);
      const filename = `product-${timestamp}-${randomSuffix}${fileExtension}`;
      
      // Write file
      const filePath = path.join(uploadsDir, filename);
      await writeFile(filePath, buffer);
      
      imagePath = `/uploads/products/${filename}`;
      console.log(`✅ File uploaded: ${imagePath}`);
    }
    
    // Find or create collection
    let collectionDoc = await Collection.findOne({ 
      name: { $regex: new RegExp(`^${collection}$`, 'i') } 
    });
    
    if (!collectionDoc) {
      collectionDoc = await Collection.create({
        name: collection,
        description: `Bộ sưu tập ${collection}`,
        coverImage: '/uploads/collections/default-collection.jpg',
        isActive: true
      });
      console.log(`✅ Created new collection: ${collection}`);
    }
    
    // Create new mystery bag
    const newMysteryBag = new MysteryBag({
      name,
      collection: collectionDoc._id,
      description,
      price: parseFloat(price),
      discountPercent: parseFloat(discountPercent),
      stock: parseInt(stock),
      image: imagePath
    });
    
    console.log('💾 Saving mystery bag:', newMysteryBag);
    await newMysteryBag.save();
    console.log('✅ Mystery bag saved successfully:', newMysteryBag._id);
    
    // Populate collection before returning
    await newMysteryBag.populate('collection', 'name');
    
    return NextResponse.json({
      success: true,
      message: 'Mystery bag created successfully',
      data: newMysteryBag
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create mystery bag error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create mystery bag',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
