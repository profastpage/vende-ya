import { MarketplaceGrid, MarketplaceProduct } from '@/components/vendeda/MarketplaceGrid'
import { db } from '@/lib/db'

export default async function MarketplacePage() {
  // Fetch real categories and products from Prisma, with fallback to prevent build crashes
  let categories: any[] = []
  let dbProducts: any[] = []

  try {
    const results = await Promise.all([
      db.category.findMany({
        orderBy: { sortOrder: 'asc' },
        take: 20
      }),
      db.product.findMany({
        where: { status: 'active', isLiveOnly: false },
        include: { seller: true, category: true },
        orderBy: { createdAt: 'desc' },
        take: 50
      })
    ])
    categories = results[0]
    dbProducts = results[1]
  } catch (error) {
    console.error("Database connection or table error during build:", error)
    // Silently continue with empty arrays so Vercel can finish compiling
  }

  // Extract category names for the filter pills
  const categoryNames = categories.map(c => c.nameEs)

  // Map to MarketplaceProduct format for the UI
  const products: MarketplaceProduct[] = dbProducts.map(p => {
    // p.images is a JSON array string in this schema, need to parse or fallback
    let imageUrl = 'https://via.placeholder.com/300x400'
    try {
      const parsed = JSON.parse(p.images)
      if (Array.isArray(parsed) && parsed.length > 0) {
        imageUrl = parsed[0]
      } else if (typeof p.images === 'string' && p.images.startsWith('http')) {
        imageUrl = p.images
      }
    } catch {
      if (typeof p.images === 'string' && p.images.startsWith('http')) {
        imageUrl = p.images
      }
    }

    return {
      id: p.id,
      title: p.title,
      price: p.basePrice || 0,
      originalPrice: p.basePrice ? p.basePrice * 1.2 : undefined,
      imageUrl,
      isFreeShipping: p.shippingCost === 0,
      stock: p.stock || 0,
      category: p.category?.nameEs || 'Otros',
      seller: {
        displayName: p.seller.displayName,
        isVerified: p.seller.isVerified
      }
    }
  })

  // Fallback if no products in database yet
  const displayProducts = products.length > 0 ? products : [
    {
      id: 'empty',
      title: '¡Próximamente nuevos productos!',
      price: 0,
      imageUrl: 'https://via.placeholder.com/300x400',
      isFreeShipping: true,
      stock: 0,
      category: 'General',
      seller: {
        displayName: 'Vende Ya Oficial',
        isVerified: true
      }
    }
  ]

  return (
    <div className="min-h-screen bg-card">
      <div className="pt-20">
        <div className="px-4 md:px-6 mb-4">
          <h1 className="text-2xl font-black text-foreground">Descubre productos</h1>
        </div>
        <MarketplaceGrid 
          products={displayProducts}
          categories={categoryNames.length > 0 ? categoryNames : ['General']}
        />
      </div>
    </div>
  )
}
