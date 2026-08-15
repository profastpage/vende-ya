import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://vende-ya-phi.vercel.app';

/**
 * /robots.txt — allows search engines to crawl public pages only.
 * Authenticated / seller-private paths are disallowed.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/marketplace', '/en-vivo', '/subastas', '/vendedores', '/productos', '/faq', '/soporte'],
        disallow: [
          '/dashboard',
          '/wallet',
          '/pagos',
          '/vender',
          '/envios',
          '/mensajes',
          '/notificaciones',
          '/perfil',
          '/configuracion',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
