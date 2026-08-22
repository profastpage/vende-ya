/**
 * ImageKit Optimizer Utility
 * Automatically converts images to WebP/AVIF and compresses them for fast loading.
 */

const IMAGEKIT_ENDPOINT = 'https://ik.imagekit.io/fastpagepro'

export function getOptimizedImageUrl(originalUrl: string, width?: number, height?: number): string {
  if (!originalUrl) return ''
  
  // If the URL already comes from ImageKit, we just append transformation params
  // If it's an external URL (like Supabase storage), we can route it through ImageKit
  // For now, assuming the originalUrl is the relative path or direct ImageKit path.
  
  let url = originalUrl.startsWith('http') ? originalUrl : \/\
  
  // Clean up double slashes if any
  url = url.replace('fastpagepro//', 'fastpagepro/')
  
  // Add WebP/AVIF auto-format (f-auto) and auto-quality (q-auto)
  const transforms = ['tr=f-auto,q-auto']
  if (width) transforms.push(w-\)
  if (height) transforms.push(h-\)
  
  const separator = url.includes('?') ? '&' : '?'
  return \\\
}