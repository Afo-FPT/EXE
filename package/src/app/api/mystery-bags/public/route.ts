import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import MysteryBag from '@/lib/models/MysteryBag';

// GET /api/mystery-bags/public
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/mystery-bags/public - Starting...');
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
    console.error('❌ Get public mystery bags error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch mystery bags',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
