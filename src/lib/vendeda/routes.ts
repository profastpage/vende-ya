/**
 * VENDE YA — Navigation routes
 * Centralized so we can rename URLs in one place.
 */
export const ROUTES = {
  // Public
  home: '/',
  live: '/en-vivo',
  marketplace: '/marketplace',
  search: '/buscar',
  login: '/login',
  registro: '/registro',
  // Authenticated
  dashboard: '/dashboard',
  vender: '/vender',
  notificaciones: '/notificaciones',
  mensajes: '/mensajes',
  perfil: '/perfil',
  configuracion: '/configuracion',
  pagos: '/pagos',
  envios: '/envios',
  // Dynamic
  auction: (id: string) => `/subastas/${id}`,
  product: (id: string) => `/productos/${id}`,
  seller: (username: string) => `/vendedores/${username}`,
  stream: (id: string) => `/en-vivo/${id}`,
  category: (slug: string) => `/marketplace?cat=${slug}`,
  // Legal
  terminos: '/terminos',
  privacidad: '/privacidad',
  soporte: '/soporte',
  faq: '/faq',
} as const

export type RouteKey = keyof typeof ROUTES
