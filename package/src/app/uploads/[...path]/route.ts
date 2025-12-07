import { NextRequest } from 'next/server'
import path from 'path'
import { stat, readFile } from 'fs/promises'

// Very small mime map to avoid extra deps
function getMimeType(filePath: string): string {
  const ext = (path.extname(filePath) || '').toLowerCase()
  switch (ext) {
    case '.glb':
    case '.gltf':
      return 'model/gltf-binary'
    case '.fbx':
      return 'application/octet-stream'
    case '.obj':
      return 'text/plain'
    case '.png':
      return 'image/png'
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg'
    case '.webp':
      return 'image/webp'
    default:
      return 'application/octet-stream'
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await context.params
    const segments = pathSegments || []
    // Prevent path traversal
    if (segments.some(seg => seg.includes('..'))) {
      return new Response('Invalid path', { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'public', 'uploads', ...segments)
    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) {
      return new Response('Not Found', { status: 404 })
    }

    const data = await readFile(filePath)
    const contentType = getMimeType(filePath)
    // Ensure BodyInit is a Uint8Array for compatibility with Next Response
    const body = new Uint8Array(data)
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (err) {
    return new Response('Not Found', { status: 404 })
  }
}


