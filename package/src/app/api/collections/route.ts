import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Collection from '@/lib/models/Collection';

// GET /api/collections
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const collections = await Collection.find({ isActive: true })
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      collections
    }, { status: 200 });
    
  } catch (error) {
    console.error('Get collections error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch collections',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/collections
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Handle FormData
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const coverImage = formData.get('coverImage') as File;
    
    console.log('📝 Received collection FormData:', {
      name, description,
      coverImageName: coverImage?.name, coverImageSize: coverImage?.size,
      coverImageType: coverImage?.type
    });
    
    // Create new collection
    let coverImageBase64 = '';
    if (coverImage && coverImage.size > 0) {
      console.log('🖼️ Processing cover image...');
      const arrayBuffer = await coverImage.arrayBuffer();
      coverImageBase64 = `data:${coverImage.type};base64,${Buffer.from(arrayBuffer).toString('base64')}`;
      console.log('✅ Cover image processed, length:', coverImageBase64.length);
    } else {
      console.log('⚠️ No cover image provided or empty file');
    }
    
    console.log('💾 Creating collection with data:', {
      name, description,
      hasCoverImage: !!coverImageBase64,
      coverImageLength: coverImageBase64.length
    });
    
    const newCollection = new Collection({
      name,
      description,
      coverImage: coverImageBase64
    });
    
    await newCollection.save();
    console.log('✅ Collection saved to database:', newCollection._id);
    
    return NextResponse.json({
      success: true,
      message: 'Collection created successfully',
      collection: newCollection
    }, { status: 201 });
    
  } catch (error) {
    console.error('Create collection error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create collection',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
