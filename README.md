# 🇵🇪 Vende Ya

**El marketplace social del Perú. Subastas en vivo, compra ya, vende ya.**

Plataforma híbrida que combina un Marketplace Social (estilo Facebook Marketplace) con Subastas en Vivo en Streaming + Compra Inmediata (estilo eBay Shop Live / TikTok Live). Optimizada para el mercado peruano: PEN (S/.), Yape, Plin, PagoEfectivo, envíos Olva/Shalom/Marvisur.

---

## ✨ Features del MVP (Core Bootstrap)

- 🎥 **Subastas en vivo** con stream low-latency (Cloudflare Stream) y bidding en tiempo real (Socket.io / Supabase Realtime).
- 💰 **Bidding en tiempo real**: pujas instantáneas, anti-snipe (extiende 15s si pujan en últimos 30s), historial, Buy Now.
- 🤖 **AI Edge Layer**: moderación de chat (DeepSeek-V4) + asistente de ventas (Qwen-2.5-72B) con pre-filtro de reglas a costo cero.
- 💬 **Chat en vivo** sobre el stream con reacciones flotantes, mensajes del bot, eventos de puja, y flags de moderación.
- 📱 **Mobile-first**: bottom nav, FAB, safe-area iOS, touch targets 44px+. Desktop: top nav + grid 3 columnas + split-pane 60/40 en vivo.
- 🎨 **Design System propio**: paleta Salsa (rojo-naranja) + Lima (verde) + Plin (morado), tipografía Bricolage Grotesque para titulares.
- 🛡️ **RLS en Supabase**: cada tabla con datos de usuario tiene Row Level Security. `place_bid()` RPC atómico para evitar race conditions.
- 🌐 **i18n ready**: es-PE primario, en-US fallback, estructurado para migrar a next-intl.

---

## 🏗️ Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) · TypeScript 5 · Tailwind CSS 4 · shadcn/ui · Framer Motion |
| Real-time | Socket.io mini-service (dev) → Supabase Realtime (prod) |
| Database | Prisma + SQLite (dev) → Supabase PostgreSQL con RLS (prod) |
| Auth | Supabase Auth (next-auth disponible como alternativa) |
| Streaming | Cloudflare Stream (low-latency HLS/DASH) |
| Storage | Cloudflare R2 (zero egress fees) |
| AI Edge | DeepSeek-V4 + Qwen-2.5-72B vía z-ai-web-dev-sdk |
| Pagos | Yape · Plin · PagoEfectivo · Tarjetas (plan: Niubiz / Mercado Pago) |
| Envíos | Olva Courier · Shalom · Marvisur · Recojo en tienda |
| Deploy | Vercel (frontend) + Render/Fly (Socket.io) + Supabase (DB/Realtime) + Cloudflare (Stream/R2) |

---

## 🚀 Quick Start (local)

```bash
# 1. Install deps
bun install

# 2. Set up env
cp .env.example .env.local
# Edit .env.local with your Supabase + Cloudflare + AI keys

# 3. Initialize DB (SQLite dev)
bun run db:push

# 4. Start dev server (port 3000)
bun run dev

# 5. (Optional) Start the realtime service in another terminal
bun run realtime
# → Socket.io server on port 3003
```

Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploy en Vercel

1. **Importa el repo** en [vercel.com/new](https://vercel.com/new)
2. **Framework Preset**: Next.js (auto-detectado)
3. **Build Command**: `next build` (ya configurado en `package.json`)
4. **Install Command**: `bun install` (o `npm install`)
5. **Environment Variables** (ver `.env.example` para la lista completa):
   - `DATABASE_URL` — Supabase Postgres pooler URL
   - `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_STREAM_API_TOKEN`
   - `CLOUDFLARE_R2_*` (4 vars)
   - `NEXT_PUBLIC_REALTIME_URL` — URL del Socket.io service desplegado en Render/Fly

Vercel auto-despliega en cada push a `main`.

---

## 📂 Estructura del proyecto

```
vende-ya/
├── docs/
│   └── supabase-schema.sql            # SQL prod con RLS + place_bid() RPC
├── prisma/
│   └── schema.prisma                  # Schema Prisma (SQLite dev / Postgres prod)
├── mini-services/
│   └── auction-realtime/              # Socket.io server (port 3003)
│       ├── index.ts                   # Bidding + chat + reactions + moderation
│       └── package.json
├── public/
│   ├── logo.svg
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # es-PE, fonts, ThemeProvider
│   │   ├── page.tsx                   # Showcase mobile + desktop
│   │   ├── globals.css                # Design tokens (Salsa/Lima/Plin)
│   │   └── api/
│   │       ├── auctions/route.ts
│   │       ├── bids/route.ts
│   │       ├── ai/
│   │       │   ├── moderate-chat/route.ts
│   │       │   ├── sales-assistant/route.ts
│   │       │   └── extract-product/route.ts
│   │       └── r2/signed-upload-url/route.ts
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components
│   │   └── vendeda/
│   │       ├── LiveBiddingContainer.tsx   # ⭐ Centerpiece
│   │       ├── MobileBottomNav.tsx
│   │       ├── DesktopTopNav.tsx
│   │       ├── CategorySidebar.tsx
│   │       ├── QuickAuctionFab.tsx
│   │       ├── cards.tsx              # AuctionCard, ProductCard, LiveStreamCard, SellerChip
│   │       └── theme-provider.tsx
│   ├── lib/
│   │   ├── db.ts                      # Prisma client singleton
│   │   ├── utils.ts                   # cn() helper
│   │   └── vendeda/
│   │       ├── types.ts               # Shared TS types + Socket.io protocol
│   │       ├── constants.ts           # Peruvian market config
│   │       ├── format.ts              # PEN formatting, countdown, time-ago-es
│   │       ├── i18n.ts                # es-PE / en-US dictionary
│   │       ├── socket.ts              # Socket.io client singleton
│   │       ├── ai.ts                  # Moderation + Sales Assistant + Extraction
│   │       └── mock-data.ts           # Demo data (Peruvian sellers + products)
│   └── hooks/
│       ├── use-mobile.ts
│       └── use-toast.ts
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── eslint.config.mjs
└── package.json
```

---

## 🔒 Seguridad

- ✅ RLS en cada tabla con datos de usuario (`profiles`, `products`, `auctions`, `bids`, `live_chat_messages`, `user_ratings`, `payments`, `notifications`)
- ✅ `place_bid()` Postgres function con `FOR UPDATE` lock — atómica, previene race conditions
- ✅ Server-side AI moderation: reglas primero (costo cero), LLM solo para casos ambiguos
- ✅ Signed URLs para R2 (TTL 10 min, single-use)
- ✅ Rate limiting en Socket.io: 20 pujas/min, 30 chats/min, 120 reacciones/min por usuario
- ✅ Anti-fraud: hash de IP + device fingerprint registrados en cada puja

---

## 📈 Roadmap (próximos pasos pro)

Ver [ROADMAP.md](./ROADMAP.md) para el detalle. Resumen:

1. **Auth real con Supabase** (magic link + OTP por WhatsApp — clave para Yape/Plin)
2. **Pagos reales**: integrar Niubiz (tarjetas) + webhook de Yape/Plin
3. **Cloudflare Stream real**: RTMP ingest + grabación automática a R2 como VOD
4. **Búsqueda**: Postgres full-text search + Meilisearch para productos
5. **Notificaciones push**: Web Push API + OneSignal para mobile
6. **Mobile app**: React Native (Expo) reutilizando el backend
7. **Analytics**: Postgres + Metabase para vendedores (conversión, retención, AOV)
8. **Logística**: integración Olva API para tracking automático

---

## 📄 Licencia

MIT — Libre uso. Construido con ❤️ en Lima, Perú.

---

## 🤝 Contribuir

1. Fork el repo
2. Crea un branch: `git checkout -b feature/mi-feature`
3. Commit: `git commit -m 'feat: mi feature'`
4. Push: `git push origin feature/mi-feature`
5. Abre un Pull Request

**Convención de commits**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`
