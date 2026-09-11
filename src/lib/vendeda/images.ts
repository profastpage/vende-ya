/**
 * Safe Image Utilities for Vende Ya
 * Prevents broken image icons, bracket URLs (e.g. '['), and ensures clean fallbacks.
 */

export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1080&auto=format&fit=crop&q=80'
export const DEFAULT_STREAM_COVER = 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1080&auto=format&fit=crop&q=80'
export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'

/**
 * Safely parses images from product data which could be:
 * - A stringified JSON array: '["https://..."]'
 * - A JavaScript array of strings: ['https://...']
 * - A raw single URL string: 'https://...'
 * - Null or undefined
 *
 * Always returns a non-empty array of valid image URL strings.
 */
export function safeProductImages(images: unknown): string[] {
  if (!images) {
    return [DEFAULT_PRODUCT_IMAGE]
  }

  // If already an array
  if (Array.isArray(images)) {
    const valid = images.filter(
      (img): img is string =>
        typeof img === 'string' &&
        img.trim().length > 3 &&
        !img.trim().startsWith('[') &&
        !img.trim().endsWith(']')
    )
    return valid.length > 0 ? valid : [DEFAULT_PRODUCT_IMAGE]
  }

  // If it's a string
  if (typeof images === 'string') {
    const trimmed = images.trim()

    // Try parsing if it looks like a JSON array
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(
            (img): img is string =>
              typeof img === 'string' &&
              img.trim().length > 3 &&
              !img.trim().startsWith('[')
          )
          if (valid.length > 0) return valid
        }
      } catch {
        // Continue to fallback checks
      }
    }

    // Direct URL check
    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:') ||
      trimmed.startsWith('/')
    ) {
      return [trimmed]
    }
  }

  return [DEFAULT_PRODUCT_IMAGE]
}

/**
 * Returns the primary (first) image URL safely.
 * Guaranteed to never return '[' or empty string.
 */
export function safeMainImage(images: unknown): string {
  const list = safeProductImages(images)
  return list[0] || DEFAULT_PRODUCT_IMAGE
}

/**
 * Safe stream cover thumbnail extractor.
 * Automatically checks custom cover, YouTube thumbnail, Twitch preview, or default.
 */
export function safeStreamCover(stream: {
  thumbnailUrl?: string | null
  youtubeLiveId?: string | null
  streamProviderId?: string | null
  streamProvider?: string | null
  kickUsername?: string | null
}): string {
  if (
    stream.thumbnailUrl &&
    typeof stream.thumbnailUrl === 'string' &&
    stream.thumbnailUrl.trim().length > 5 &&
    !stream.thumbnailUrl.startsWith('[')
  ) {
    return stream.thumbnailUrl.trim()
  }

  const ytId = stream.youtubeLiveId || (stream.streamProvider === 'YOUTUBE' ? stream.streamProviderId : null)
  if (ytId && typeof ytId === 'string' && ytId.trim().length === 11) {
    return `https://img.youtube.com/vi/${ytId.trim()}/hqdefault.jpg`
  }

  return DEFAULT_STREAM_COVER
}
