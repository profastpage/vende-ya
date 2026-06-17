/**
 * VENDE YA — i18n
 * -----------------------------------------------------------------
 * The primary market is Peru (es-PE). The strings are structured for
 * clean migration to `next-intl` message catalogs. For now we keep a
 * typed dictionary to avoid runtime lookup errors and to give type
 * safety on translation keys.
 *
 * Migration path: replace `t(key)` body with `useTranslations(key)`
 * from next-intl and move `STRINGS` to /messages/es-PE.json + /messages/en-US.json.
 */
import { DEFAULT_LOCALE } from './constants'
import type { Locale } from './types'

type Dict = Record<string, string>

const ES_PE: Dict = {
  'app.name': 'Vende Ya',
  'app.tagline': 'Subastas en vivo. Compra ya. Vende ya.',

  'nav.feed': 'Inicio',
  'nav.live': 'En vivo',
  'nav.create': 'Vender',
  'nav.notifications': 'Alertas',
  'nav.profile': 'Perfil',

  'fab.quickAuction': 'Subasta rápida',
  'fab.goLive': 'Ir en vivo',

  'marketplace.title': 'Marketplace',
  'marketplace.search': 'Buscar productos, vendedores, marcas...',
  'marketplace.filter.all': 'Todo',
  'marketplace.filter.live': 'En subasta',
  'marketplace.filter.new': 'Recién publicado',
  'marketplace.trending': 'Tendencias en vivo',
  'marketplace.empty': 'No encontramos productos. Prueba con otra categoría.',

  'auction.live': 'EN VIVO',
  'auction.starting': 'Inicio',
  'auction.currentBid': 'Puja actual',
  'auction.nextBid': 'Próxima puja',
  'auction.bidNow': 'Pujar ahora',
  'auction.buyNow': 'Comprar ya',
  'auction.bidders': 'postores',
  'auction.endsIn': 'Termina en',
  'auction.ended': 'Subasta finalizada',
  'auction.won': '¡Ganaste!',
  'auction.sold': 'Vendido',
  'auction.outbid': 'Te superaron',
  'auction.bidPlaced': 'Puja realizada',
  'auction.bidFailed': 'No se pudo pujar. Intenta de nuevo.',
  'auction.increment': 'Incremento mínimo',
  'auction.yourBid': 'Tu puja',
  'auction.bidHistory': 'Historial',
  'auction.watchers': 'observando',
  'auction.reserve': 'Precio reserva',

  'stream.live': 'EN VIVO',
  'stream.viewers': 'espectadores',
  'stream.startLive': 'Iniciar transmisión',
  'stream.endLive': 'Finalizar',
  'stream.seller': 'Vendedor',
  'stream.follow': 'Seguir',
  'stream.following': 'Siguiendo',
  'stream.share': 'Compartir',
  'stream.like': 'Me gusta',
  'stream.sendReaction': 'Reaccionar',
  'stream.placeholder': 'El vendedor comienza en breve...',

  'chat.placeholder': 'Escribe un mensaje...',
  'chat.send': 'Enviar',
  'chat.flagged': 'Mensaje oculto por moderación automática',
  'chat.seller': 'VENDEDOR',
  'chat.pinned': 'FIJADO',

  'payment.yape': 'Yape',
  'payment.plin': 'Plin',
  'payment.pagoefectivo': 'PagoEfectivo',
  'payment.card': 'Tarjeta',
  'payment.transfer': 'Transferencia',
  'payment.pay': 'Pagar',
  'payment.total': 'Total',

  'product.condition.new': 'Nuevo',
  'product.condition.likeNew': 'Usado - como nuevo',
  'product.condition.good': 'Usado - bueno',
  'product.condition.acceptable': 'Usado - aceptable',
  'product.shippingFrom': 'Envía desde',
  'product.shipsNationwide': 'Envío a todo Perú',
  'product.pickup': 'Recojo disponible',

  'profile.followers': 'Seguidores',
  'profile.sales': 'Ventas',
  'profile.rating': 'Calificación',
  'profile.verified': 'Verificado',
  'profile.reviews': 'Reseñas',

  'common.loading': 'Cargando...',
  'common.error': 'Algo salió mal',
  'common.retry': 'Reintentar',
  'common.cancel': 'Cancelar',
  'common.confirm': 'Confirmar',
  'common.save': 'Guardar',
  'common.close': 'Cerrar',
  'common.seeAll': 'Ver todo',
  'common.viewAll': 'Ver todos',
}

const EN_US: Dict = {
  'app.name': 'Vende Ya',
  'app.tagline': 'Live auctions. Buy now. Sell now.',

  'nav.feed': 'Home',
  'nav.live': 'Live',
  'nav.create': 'Sell',
  'nav.notifications': 'Alerts',
  'nav.profile': 'Profile',

  'fab.quickAuction': 'Quick auction',
  'fab.goLive': 'Go live',

  'marketplace.title': 'Marketplace',
  'marketplace.search': 'Search products, sellers, brands...',
  'marketplace.filter.all': 'All',
  'marketplace.filter.live': 'In auction',
  'marketplace.filter.new': 'Just listed',
  'marketplace.trending': 'Trending live',
  'marketplace.empty': 'No products found. Try another category.',

  'auction.live': 'LIVE',
  'auction.starting': 'Starts',
  'auction.currentBid': 'Current bid',
  'auction.nextBid': 'Next bid',
  'auction.bidNow': 'Bid now',
  'auction.buyNow': 'Buy now',
  'auction.bidders': 'bidders',
  'auction.endsIn': 'Ends in',
  'auction.ended': 'Auction ended',
  'auction.won': 'You won!',
  'auction.sold': 'Sold',
  'auction.outbid': 'Outbid',
  'auction.bidPlaced': 'Bid placed',
  'auction.bidFailed': 'Bid failed. Try again.',
  'auction.increment': 'Min increment',
  'auction.yourBid': 'Your bid',
  'auction.bidHistory': 'History',
  'auction.watchers': 'watching',
  'auction.reserve': 'Reserve price',

  'stream.live': 'LIVE',
  'stream.viewers': 'viewers',
  'stream.startLive': 'Start stream',
  'stream.endLive': 'End',
  'stream.seller': 'Seller',
  'stream.follow': 'Follow',
  'stream.following': 'Following',
  'stream.share': 'Share',
  'stream.like': 'Like',
  'stream.sendReaction': 'React',
  'stream.placeholder': 'Seller starts shortly...',

  'chat.placeholder': 'Type a message...',
  'chat.send': 'Send',
  'chat.flagged': 'Message hidden by auto-moderation',
  'chat.seller': 'SELLER',
  'chat.pinned': 'PINNED',

  'payment.yape': 'Yape',
  'payment.plin': 'Plin',
  'payment.pagoefectivo': 'PagoEfectivo',
  'payment.card': 'Card',
  'payment.transfer': 'Bank transfer',
  'payment.pay': 'Pay',
  'payment.total': 'Total',

  'product.condition.new': 'New',
  'product.condition.likeNew': 'Used - like new',
  'product.condition.good': 'Used - good',
  'product.condition.acceptable': 'Used - acceptable',
  'product.shippingFrom': 'Ships from',
  'product.shipsNationwide': 'Ships nationwide',
  'product.pickup': 'Pickup available',

  'profile.followers': 'Followers',
  'profile.sales': 'Sales',
  'profile.rating': 'Rating',
  'profile.verified': 'Verified',
  'profile.reviews': 'Reviews',

  'common.loading': 'Loading...',
  'common.error': 'Something went wrong',
  'common.retry': 'Retry',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.save': 'Save',
  'common.close': 'Close',
  'common.seeAll': 'See all',
  'common.viewAll': 'View all',
}

const DICTS: Record<Locale, Dict> = {
  'es-PE': ES_PE,
  'en-US': EN_US,
}

/** Translate a key in the given locale. Falls back to es-PE then the key itself. */
export function t(key: string, locale: Locale = DEFAULT_LOCALE): string {
  return DICTS[locale]?.[key] ?? ES_PE[key] ?? key
}
