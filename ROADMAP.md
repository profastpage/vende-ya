# 🗺️ Vende Ya — Roadmap

Plan de evolución del MVP al producto profesional.

---

## ✅ Fase 0 — MVP Core Bootstrap (entregado)

- [x] Schema Supabase + Prisma (11 tablas + RLS + `place_bid()` RPC)
- [x] Design System (Salsa/Lima/Plin, mobile-first, dark mode)
- [x] `LiveBiddingContainer` con bidding en tiempo real (Socket.io)
- [x] Chat en vivo con AI moderación (reglas + LLM fallback)
- [x] Marketplace feed + categorías + tarjetas
- [x] API routes (auctions, bids, AI, R2)
- [x] i18n es-PE primario, en-US fallback
- [x] Mock data con vendedores peruanos realistas

---

## 🚧 Fase 1 — Producción lista para usuarios reales (1-2 semanas)

### Auth & Identidad
- [ ] **Supabase Auth** con magic link por email + OTP por WhatsApp
  - Validación de número peruano (regex `9\d{8}`)
  - Verificación obligatoria antes de pujar/vender
- [ ] **Onboarding de vendedor**: KYC ligero (DNI + selfie) vía Reniec API o proveedor
- [ ] **Sessions** persistentes con refresh tokens
- [ ] **Roles**: comprador, vendedor, moderador, admin

### Pagos reales
- [ ] **Niubiz** para tarjetas (Visa/Mastercard/Diners) — SDK oficial
- [ ] **Yape / Plin** con QR dinámico + webhook de confirmación
  - Generar QR por monto exacto en el cierre de subasta
  - Polling cada 5s + webhook de Yape/Plin para verificación
- [ ] **PagoEfectivo** (CIP) para pagos en efectivo en agencias
- [ ] **Escrow ligero**: el pago se retiene hasta confirmar recepción (o 7 días auto-release)
- [ ] **Reembolsos** con dispute flow básico

### Cloudflare Stream real
- [ ] Crear `live_input` por stream via API
- [ ] Generar RTMP/SRT ingest URL para OBS / Streamlabs
- [ ] Playback via `<Stream />` player de Cloudflare o hls.js
- [ ] **Grabación automática** → subir VOD a R2 al finalizar
- [ ] Webhook de Cloudflare → `/api/webhooks/cloudflare-stream`

### R2 Storage
- [ ] Upload directo cliente → R2 con presigned URL (API ya creada)
- [ ] Compresión + resize automático de imágenes con Cloudflare Images
- [ ] CDN con cache 30 días para VODs

### Real-time production
- [ ] Migrar Socket.io a **Supabase Realtime** (postgres_changes)
- [ ] Mantener Socket.io solo para presence (viewer count, typing)
- [ ] Backpressure: batch broadcasts cada 100ms para subastas con +500 watchers

---

## 🚀 Fase 2 — Crecimiento (3-4 semanas)

### Búsqueda & Discoverability
- [ ] **Postgres FTS** sobre `products.title` + `description` (es-PE tokenizer)
- [ ] **Meilisearch** para búsqueda instantánea (< 50ms) con typos
- [ ] **Filtros avanzados**: precio, condición, departamento, método de pago, envío
- [ ] **Tags normalizados**: talla, color, marca (enum + autocomplete)
- [ ] **Búsqueda por imagen** (CLIP embeddings) — futuro

### Notificaciones
- [ ] **Web Push API** para subastas siguiendo (inicia/termina/te superan)
- [ ] **Email** (Resend) para confirmaciones de compra, pagos, envíos
- [ ] **WhatsApp Business API** (via 360dialog o Twilio) para recordatorios
- [ ] **In-app notifications** con badge en tiempo real (tabla `notifications` ya existe)

### Social
- [ ] **Follow/unfollow** (tabla `follows` ya existe)
- [ ] **Feed personalizado** por follows + categorías preferidas
- [ ] **Compartir** producto/subasta en WhatsApp con deep link
- [ ] **Reseñas** con fotos (extender `user_ratings`)
- [ ] **Badges**: Vendedor Top, Envío Rápido, Mejor Precio

### Mobile PWA
- [ ] **Manifest** + Service Worker para instalación en home screen
- [ ] **Push notifications** nativas (no requiere app store)
- [ ] **Offline-first** para catálogo (Cache API)

---

## 🌟 Fase 3 — Escala (1-2 meses)

### Mobile App
- [ ] **React Native (Expo)** reutilizando el backend (Supabase + API routes)
- [ ] Push nativas vía Expo Notifications
- [ ] Camera para subir productos con extracción AI
- [ ] Yape/Plin deep links nativos

### Analytics & Insights
- [ ] **Postgres + Metabase** para dashboards de vendedores:
  - Conversión (views → bids → sales)
  - AOV (Average Order Value)
  - Retención de compradores
  - Best-selling categories
- [ ] **Event tracking** (PostHog self-hosted) para funnel analysis
- [ ] **A/B testing** framework para CTA, precio inicial, duración de subasta

### Logística
- [ ] **Olva API** integración: generar label + tracking automático
- [ ] **Shalom** + **Marvisur** APIs similares
- [ ] **Recojo en tienda**: mapa de puntos autorizados
- [ ] **Cálculo de shipping** por peso + dimensión + zona

### AI Enhancements
- [ ] **Pricing suggester**: LLM analiza mercado histórico y sugiere precio inicial + incremento
- [ ] **Detección de fraudes**: score por usuario (perfil nuevo + tarjeta nueva + monto alto)
- [ ] **Auto-tagging** de productos desde imagen (CLIP + LLM)
- [ ] **Chatbot de venta** más avanzado: maneja objeciones, sugiere tallas, cierra trato
- [ ] **Traducción automática** es→en para productos turísticos (Cusco, artesanal)

### Performance
- [ ] **Edge functions** (Cloudflare Workers) para moderación AI (< 50ms global)
- [ ] **Streaming SSR** para feed (Next.js 16 streaming)
- [ ] **Image optimization** con Cloudflare Images (AVIF + WebP)
- [ ] **Database read replicas** en Supabase para marketplace reads

---

## 💼 Fase 4 — Business (2-3 meses)

### Monetización
- [ ] **Comisión por venta** (5-8% configurable por categoría)
- [ ] **Vende Ya Pro**: suscripción mensual S/. 29 para vendedores con +50 ventas/mes
  - Subastas destacadas, analytics avanzados, soporte prioritario
- [ ] **Promocionados**: boost en feed por S/. 5-50 (CPM o CPC)
- [ ] **Yape/Plin kickback**: negociar comisión reversa con BCP/Interbank

### Compliance
- [ ] **Facturación electrónica** SUNAT (XML + PDF + CDR)
- [ ] **RUC** validation en onboarding de vendedor
- [ ] **Libro de ventas** exportable para vendedores
- [ ] **Data protection**: cumplimiento Ley 29733 (Protección de Datos Personales Perú)

### Confianza & Seguridad
- [ ] **Fondo de protección al comprador** (hasta S/. 500)
- [ ] **Mediación de disputas** con SLA de 48h
- [ ] **Verificación de identidad** obligatoria para vendedores con >S/. 1000 en ventas
- [ ] **Detección de shill bidding** (pujas falsas del propio vendedor) via ML

---

## 🔮 Fase 5 — Visión (6+ meses)

### Categorías verticales
- [ ] **Vende Ya Autos** (con histórico de precios, inspección)
- [ ] **Vende Ya Inmuebles** (alquiler temporal + venta)
- [ ] **Vende Ya Servicios** (profesionales freelance)
- [ ] **Vende Ya Cursos** (educación online, live workshops)

### Cross-border
- [ ] **Expansión LATAM**: Colombia, México, Ecuador (misma base de código, solo config)
- [ ] **Multi-moneda**: COP, MXN, USD con conversión automática
- [ ] **Envíos internacionales** via DHL/FedEx

### Live Commerce Innovations
- [ ] **Co-hosted streams** (dos vendedores en un stream)
- [ ] **Flash auctions** (30 segundos, sin countdown visible, sorpresa)
- [ ] **Bundle auctions** (compra un lote de productos)
- [ ] **Drop auctions** (edición limitada, hora fija, alta demanda)

---

## 📊 Métricas north star

| Métrica | Meta Fase 1 | Meta Fase 3 | Meta Fase 5 |
|---|---|---|---|
| MAU (Monthly Active Users) | 1,000 | 50,000 | 500,000 |
| GMV (Gross Merchandise Value) | S/. 100K/mes | S/. 5M/mes | S/. 50M/mes |
| Subastas activas/día | 50 | 500 | 5,000 |
| Tasa de conversión (view → bid) | 8% | 12% | 15% |
| Tiempo promedio en vivo | 4 min | 7 min | 10 min |
| Take rate (comisión efectiva) | 3% | 5% | 6.5% |

---

## 🛠️ Stack técnico futuro considerado

- **Edge**: Cloudflare Workers para AI moderation global (< 50ms)
- **DB read replicas**: Supabase read replicas en multi-región
- **Queue**: Upstash Redis para jobs (envío de emails, webhooks)
- **Search**: Meilisearch self-hosted o Typesense Cloud
- **Observability**: Sentry + Axiom (logs) + Vercel Analytics
- **CI/CD**: GitHub Actions con preview deploys + E2E tests (Playwright)

---

_Última actualización: 2026-06-17_
_Mantenido por: Equipo Vende Ya_
