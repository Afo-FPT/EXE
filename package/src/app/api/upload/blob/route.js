import { put } from '@vercel/blob';

export const runtime = 'edge';

// Enhanced Vercel Blob upload for large 3D models
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const collection = formData.get('collection') || 'default';
    
    if (!file) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'No file provided' 
      }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    console.log(`📁 File info: ${file.name}, size: ${file.size} bytes, collection: ${collection}`);
    
    // Validate file type
    const allowedExtensions = ['glb', 'gltf', 'obj', 'fbx', 'dae'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return new Response(JSON.stringify({ 
        success: false,
        error: `File type not supported. Allowed types: ${allowedExtensions.join(', ')}` 
      }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    // File size limit for EC2 (increased from Vercel's limit)
    if (file.size > 100 * 1024 * 1024) { // 100MB
      return new Response(JSON.stringify({ 
        success: false,
        error: 'File too large. Max size: 100MB. Please compress your 3D model or use a smaller file.' 
      }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Generate organized filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const filename = `models/${collection}/model3d-${timestamp}-${randomId}.${fileExtension}`;
    
    console.log(`📤 Uploading to blob: ${filename}`);
    
    // Upload to Vercel Blob with optimized settings
    const blob = await put(filename, file, {
      access: 'public',
      contentType: file.type || 'application/octet-stream',
      addRandomSuffix: false, // We're handling naming ourselves
    });

    console.log(`✅ Upload successful: ${blob.url}`);
    
    return new Response(JSON.stringify({
      success: true,
      url: blob.url,
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type,
      collection: collection,
      downloadUrl: blob.downloadUrl
    }), {
      headers: { 'content-type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Blob upload error:', error);
    
    // Enhanced error handling
    let errorMessage = 'Upload failed';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('413') || error.message.includes('too large')) {
        errorMessage = 'File too large. Please compress your 3D model or use a smaller file.';
        statusCode = 413;
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage = 'Network error. Please check your connection and try again.';
        statusCode = 408;
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: statusCode,
      headers: { 'content-type': 'application/json' }
    });
  }
}


