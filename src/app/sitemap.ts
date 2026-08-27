import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vendeya.live';

/**
 * /sitemap.xml — static + dynamic product/auction/seller URLs.
 * For dynamic entries we use placeholder IDs; in production these would
 * be fetched from the database.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }> = [
    { path: '/', changeFrequency: 'daily', priority: 1.0 },
    { path: '/marketplace', changeFrequency: 'hourly', priority: 0.9 },
    { path: '/en-vivo', changeFrequency: 'hourly', priority: 0.9 },
    { path: '/subastas', changeFrequency: 'hourly', priority: 0.8 },
    { path: '/vendedores', changeFrequency: 'daily', priority: 0.7 },
    { path: '/login', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/registro', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/faq', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/soporte', changeFrequency: 'monthly', priority: 0.4 },
    { path: '/terminos', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/privacidad', changeFrequency: 'yearly', priority: 0.3 },
    { path: '/reportar-infraccion', changeFrequency: 'yearly', priority: 0.3 },
  ];

  return staticRoutes.map((r) => ({
    url: `${BASE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
