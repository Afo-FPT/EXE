import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Collection from '@/lib/models/Collection';

// GET /api/collections/public
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/collections/public - Starting...');
    console.log('🔍 Request URL:', request.url);
    console.log('🔍 Request method:', request.method);
    
    await connectDB();
    console.log('✅ Database connected');
    
    const collections = await Collection.find({ isActive: true })
      .sort({ createdAt: -1 });
    
    console.log('📚 Found collections:', collections.length);
    console.log('📚 Collections data:', collections);
    
    return NextResponse.json({
      success: true,
      data: collections
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Get public collections error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch collections',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}
