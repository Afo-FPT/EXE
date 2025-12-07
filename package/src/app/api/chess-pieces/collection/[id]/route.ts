import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import ChessPiece from '@/lib/models/ChessPiece';

// GET /api/chess-pieces/collection/[id] - Get chess pieces by collection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected');
    
    const { id: collectionId } = await params;
    
    console.log('📡 Fetching chess pieces for collection:', collectionId);

    // Try to find by collection name first, then by ID
    let chessPieces = await ChessPiece.find({ 
      collection: collectionId,
      isActive: true 
    })
      .sort({ createdAt: -1 })
      .lean();

    // If no results found by ID, try by name
    if (chessPieces.length === 0) {
      console.log('🔍 No chess pieces found by ID, trying by name...');
      chessPieces = await ChessPiece.find({ 
        collection: { $regex: collectionId, $options: 'i' },
        isActive: true 
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    console.log('✅ Chess pieces found:', chessPieces.length);

    return NextResponse.json({
      success: true,
      chessPieces: chessPieces,
      count: chessPieces.length
    });

  } catch (error) {
    console.error('❌ Error fetching chess pieces:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch chess pieces',
      error: error instanceof Error ? error.message : 'Unknown error',
      chessPieces: []
    }, { status: 500 });
  }
}
