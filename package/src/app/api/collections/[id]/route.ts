import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Collection from '@/lib/models/Collection';

// GET /api/collections/[id]
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    const collection = await Collection.findById(id);
    
    if (!collection) {
      return NextResponse.json({
        success: false,
        message: 'Collection not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      collection
    }, { status: 200 });
    
  } catch (error) {
    console.error('Get collection error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch collection',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// PUT /api/collections/[id]
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    // Handle FormData
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const coverImage = formData.get('coverImage') as File;
    
    console.log('Received collection update FormData:', {
      id, name, description,
      coverImageName: coverImage?.name, coverImageSize: coverImage?.size
    });
    
    const updateData: any = {
      name,
      description
    };
    
    if (coverImage && coverImage.size > 0) {
      updateData.coverImage = coverImage.name;
    }
    
    const updatedCollection = await Collection.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedCollection) {
      return NextResponse.json({
        success: false,
        message: 'Collection not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Collection updated successfully',
      collection: updatedCollection
    }, { status: 200 });
    
  } catch (error) {
    console.error('Update collection error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update collection',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// DELETE /api/collections/[id]
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await context.params;
    
    console.log('🗑️ Attempting to delete collection with ID:', id);
    
    const deletedCollection = await Collection.findByIdAndDelete(id);
    
    console.log('🗑️ Delete result:', deletedCollection);
    
    if (!deletedCollection) {
      console.log('❌ Collection not found for deletion');
      return NextResponse.json({
        success: false,
        message: 'Collection not found'
      }, { status: 404 });
    }
    
    console.log('✅ Collection deleted successfully:', deletedCollection._id);
    
    return NextResponse.json({
      success: true,
      message: 'Collection deleted successfully',
      deletedId: deletedCollection._id
    }, { status: 200 });
    
  } catch (error) {
    console.error('Delete collection error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete collection',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
