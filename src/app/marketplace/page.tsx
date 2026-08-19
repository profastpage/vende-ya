import { MarketplaceGrid, MarketplaceProduct } from '@/components/vendeda/MarketplaceGrid'
import { MOCK_PRODUCTS } from '@/lib/vendeda/mock-data'

export default function MarketplacePage() {
  // Convert MOCK_PRODUCTS to MarketplaceProduct format for the new UI
  const products: MarketplaceProduct[] = MOCK_PRODUCTS.map(p => ({
    id: p.id,
    title: p.title,
    price: p.basePrice || 0,
    originalPrice: p.basePrice ? p.basePrice * 1.2 : undefined,
    imageUrl: p.images?.[0] || 'https://via.placeholder.com/300x400',
    isFreeShipping: Math.random() > 0.5,
    stock: p.stock || 0,
    category: 'Electrónica', // Mock category
    seller: {
      displayName: p.sellerId.substring(0, 8),
      isVerified: Math.random() > 0.5
    }
  }))

  return (
    <main className="min-h-screen bg-card">
      <div className="pt-20">
        <div className="px-4 md:px-6 mb-4">
          <h1 className="text-2xl font-black text-foreground">Descubre productos</h1>
        </div>
        <MarketplaceGrid 
          products={products}
          categories={['Electrónica', 'Moda', 'Hogar', 'Deportes', 'Juguetes']}
        />
      </div>
    </main>
  )
}
