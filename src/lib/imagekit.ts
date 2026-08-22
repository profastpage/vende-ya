/**
 * ImageKit Optimizer Utility
 * Automatically converts images to WebP/AVIF and compresses them for fast loading.
 */

const IMAGEKIT_ENDPOINT = 'https://ik.imagekit.io/fastpagepro'

export function getOptimizedImageUrl(originalUrl: string, width?: number, height?: number): string {
  if (!originalUrl) return ''
  
  let url = originalUrl.startsWith('http') ? originalUrl : `${IMAGEKIT_ENDPOINT}/${originalUrl}`
  
  // Clean up double slashes if any
  url = url.replace('fastpagepro//', 'fastpagepro/')
  
  // Add WebP/AVIF auto-format (f-auto) and auto-quality (q-auto)
  const transforms = ['tr=f-auto,q-auto']
  if (width) transforms.push(`w-${width}`)
  if (height) transforms.push(`h-${height}`)
  
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${transforms.join(',')}`
}