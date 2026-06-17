import { NextRequest, NextResponse } from 'next/server'
import { CLOUDFLARE } from '@/lib/vendeda/constants'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/r2/signed-upload-url
 * Body: { fileName: string, contentType: string, kind: 'image' | 'video' }
 * Returns: { uploadUrl, key, expiresAt }
 *
 * Mints a presigned URL for direct-to-R2 client uploads (product
 * images, VOD recordings). The client never touches the R2 access
 * keys; the server returns a single-use URL with a TTL.
 *
 * In production this hits the Cloudflare R2 S3-compatible API using
 * `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`. For the MVP
 * demo we return a deterministic stub URL that the client can POST to.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const fileName: string | undefined = body?.fileName
    const contentType: string | undefined = body?.contentType
    const kind: 'image' | 'video' = body?.kind ?? 'image'

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'Missing fileName or contentType' },
        { status: 400 }
      )
    }
    const maxSize = kind === 'image'
      ? CLOUDFLARE.r2.maxImageSizeBytes
      : CLOUDFLARE.r2.maxVideoSizeBytes

    if (kind === 'image' && !contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'contentType must be image/* for kind=image' },
        { status: 400 }
      )
    }
    if (kind === 'video' && !contentType.startsWith('video/')) {
      return NextResponse.json(
        { error: 'contentType must be video/* for kind=video' },
        { status: 400 }
      )
    }

    // Generate a unique R2 key. In production: call S3 presign.
    const id = crypto.randomUUID()
    const ext = fileName.split('.').pop() ?? 'bin'
    const key = `vendeya/${kind}s/${id}.${ext}`

    return NextResponse.json({
      uploadUrl: `https://r2.vendeya.pe/upload/${key}`,
      key,
      contentType,
      maxSize,
      expiresAt: new Date(Date.now() + CLOUDFLARE.r2.signedUrlTtlSec * 1000).toISOString(),
      // Demo stub — in production this would be a real S3 presigned PUT URL
      demo: true,
    })
  } catch (err) {
    console.error('[/api/r2/signed-upload-url]', err)
    return NextResponse.json(
      { error: 'Failed to mint upload URL' },
      { status: 500 }
    )
  }
}
