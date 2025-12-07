import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Collection from '@/lib/models/Collection';

// GET /api/collections/active - Get all active collections
export async function GET(request: NextRequest) {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected');
    console.log('📡 Fetching active collections...');

    const collections = await Collection.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    console.log('✅ Active collections found:', collections.length);
    console.log('📊 Collections data:', collections.map(c => ({
      id: c._id,
      name: c.name,
      coverImage: c.coverImage ? 'Has image' : 'No image',
      coverImageLength: c.coverImage?.length || 0
    })));

    return NextResponse.json({
      success: true,
      collections: collections,
      count: collections.length
    });

  } catch (error) {
    console.error('❌ Error fetching active collections:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch collections',
      error: error instanceof Error ? error.message : 'Unknown error',
      collections: []
    }, { status: 500 });
  }
}
