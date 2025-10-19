import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import MysteryBag from '@/lib/models/MysteryBag';

// GET /api/mystery-bags/admin
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/mystery-bags/admin - Starting...');
    await connectDB();
    console.log('✅ Database connected');
    
    const mysteryBags = await MysteryBag.find()
      .populate('collection', 'name')
      .sort({ createdAt: -1 });
    
    console.log('📦 Found admin mystery bags:', mysteryBags.length);
    console.log('📦 Admin mystery bags data:', mysteryBags);
    
    return NextResponse.json({
      success: true,
      data: mysteryBags
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Get admin mystery bags error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch mystery bags',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
