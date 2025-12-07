import { put } from '@vercel/blob';

// Client-side upload trực tiếp lên Vercel Blob (không qua serverless function)
export async function uploadToVercelBlob(file, collection = 'default') {
  try {
    console.log('🚀 Client-side upload to Vercel Blob:', {
      fileName: file.name,
      fileSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      collection: collection
    });

    // Validate file type
    const allowedExtensions = ['glb', 'gltf', 'obj', 'fbx', 'dae'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new Error(`File type not supported. Allowed types: ${allowedExtensions.join(', ')}`);
    }
    
    // Vercel Blob can handle much larger files (up to 100MB)
    if (file.size > 100 * 1024 * 1024) {
      throw new Error('File too large. Max size: 100MB for 3D models.');
    }

    // Generate organized filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const filename = `models/${collection}/model3d-${timestamp}-${randomId}.${fileExtension}`;
    
    console.log(`📤 Uploading to blob: ${filename}`);
    
    // Upload directly to Vercel Blob (client-side)
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
      addRandomSuffix: false,
    });

    console.log(`✅ Upload successful: ${blob.url}`);
    
    return {
      success: true,
      url: blob.url,
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      collection: collection,
      downloadUrl: blob.downloadUrl
    };

  } catch (error) {
    console.error('❌ Client-side blob upload error:', error);
    
    let errorMessage = 'Upload failed';
    
    if (error instanceof Error) {
      if (error.message.includes('413') || error.message.includes('too large')) {
        errorMessage = 'File too large. Please compress your 3D model or use a smaller file.';
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = error.message;
      }
    }
    
    throw new Error(errorMessage);
  }
}
