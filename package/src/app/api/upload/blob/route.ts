import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    console.log('📁 Starting blob upload...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'No file provided'
      }, { status: 400 });
    }
    
    console.log('📁 File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // Check file size (Vercel Blob supports up to 500MB)
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 500) {
      return NextResponse.json({
        success: false,
        message: 'File quá lớn! Vui lòng chọn file nhỏ hơn 500MB.',
        fileSize: fileSizeMB
      }, { status: 413 });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    console.log('📁 Uploading to Vercel Blob:', fileName);
    
    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
    });
    
    console.log('✅ File uploaded successfully:', blob.url);
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      blob: {
        url: blob.url,
        filename: fileName,
        size: file.size,
        type: file.type
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Blob upload error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to upload file',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
