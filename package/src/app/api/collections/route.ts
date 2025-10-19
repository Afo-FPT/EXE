import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
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
    
    console.log('Received collection FormData:', {
      name, description,
      coverImageName: coverImage?.name, coverImageSize: coverImage?.size
    });
    
    // Create new collection
    const newCollection = new Collection({
      name,
      description,
      coverImage: coverImage?.name || ''
    });
    
    await newCollection.save();
    
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
