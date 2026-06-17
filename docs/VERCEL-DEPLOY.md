# 🚀 Vende Ya — Guía de Deploy en Vercel

Guía paso a paso para desplegar Vende Ya en Vercel y solucionar el error 404 NOT_FOUND.

---

## ❓ Por qué ves 404 NOT_FOUND ahora

El error `404 NOT_FOUND` en `https://ende-ya-phi.vercel.app` significa que Vercel no tiene un deployment exitoso asociado a esa URL. Las causas más comunes:

1. **El proyecto Vercel NO está vinculado al repo GitHub** (lo más probable)
2. **El build falló** en Vercel por variables de entorno faltantes
3. **El deployment fue eliminado** o nunca se completó
4. **El nombre del proyecto en Vercel no coincide** con la URL que visitas

A continuación, la solución definitiva.

---

## ✅ Solución: Configura Vercel desde cero (5 minutos)

### Paso 1 — Ve a Vercel e importa el repo

1. Abre [vercel.com/new](https://vercel.com/new)
2. Inicia sesión con GitHub (si no lo has hecho)
3. En la lista de repos, busca **`profastpage/vende-ya`**
4. Haz clic en **Import**

### Paso 2 — Configura el proyecto

Vercel detectará automáticamente que es Next.js. **No necesitas tocar nada** en la pantalla de configuración porque ya tenemos `vercel.json` + `package.json` con todo configurado:

| Campo | Valor (auto-detectado) |
|---|---|
| Framework Preset | Next.js |
| Root Directory | `./` (default) |
| Build Command | `bun run build` (o `npm run build`) |
| Output Directory | `.next` (default) |
| Install Command | `bun install` (o `npm install`) |

### Paso 3 — Variables de entorno

**Importante**: El build funciona SIN variables de entorno (ya lo probamos). Pero para que la app funcione en producción necesitas agregarlas.

Haz clic en **"Environment Variables"** y agrega estas (mínimo para que arranque):

```
DATABASE_URL=file:./db/custom.db
NEXT_PUBLIC_APP_NAME=Vende Ya
NEXT_PUBLIC_DEFAULT_LOCALE=es-PE
NEXT_PUBLIC_DEFAULT_CURRENCY=PEN
```

Las demás (Supabase, Cloudflare, AI) las puedes dejar vacías por ahora — la app usa mock data mientras tanto. Ve `.env.example` para la lista completa.

### Paso 4 — Deploy

1. Haz clic en **Deploy**
2. Espera 1-2 minutos (Vercel ejecuta `bun install` + `prisma generate` + `next build`)
3. Verás tu URL final: `https://vende-ya-xxxx.vercel.app` (el sufijo varía)

### Paso 5 — Verifica

Visita tu URL. Deberías ver la página principal de Vende Ya con:
- Subasta en vivo (con countdown, pujas, chat)
- Vendedores en tendencia
- Streams en vivo
- Marketplace de productos
- Nav flotante de secciones (scroll spy)
- Botones de pago Yape/Plin/PagoEfectivo

---

## 🔧 Auto-deploy en cada push

Una vez vinculado el repo, **cada push a `main` dispara un deploy automático** en Vercel:

```bash
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main
# → Vercel inicia un nuevo deploy automáticamente
```

Puedes ver el progreso en [vercel.com/dashboard](https://vercel.com/dashboard) → tu proyecto → tab "Deployments".

---

## 🐛 Troubleshooting común

### Error: "Build failed" en Vercel

**Síntoma**: El deployment falla con error de build.

**Solución**: Revisa los logs en Vercel. Las causas más frecuentes:

1. **Prisma generate falla** — Asegúrate de que `prisma/schema.prisma` esté commiteado (ya lo está). El `postinstall: prisma generate` se ejecuta automáticamente.

2. **TypeScript errors** — Localmente ejecuta `bun run lint` y `bun run build` antes de pushear.

3. **Missing env vars** — Si tu código requiere una variable en build-time, agrégala en Vercel.

### Error: "404 NOT_FOUND" en la URL

**Síntoma**: Visitas tu URL de Vercel y ves 404.

**Solución**:
1. Verifica que el último deployment esté "Ready" (verde) en Vercel dashboard
2. Si está "Error", revisa los logs
3. Si está "Building", espera 2-3 minutos
4. La URL correcta es la que Vercel te dio al importar el proyecto — no uses URLs de deployments viejos

### Error: Página en blanco / hidratación

**Síntoma**: La página carga pero se ve blanca.

**Solución**: Abre la consola del navegador. Si ves errores de hidratación, suele ser por usar `window` o `localStorage` en el render del server. Nuestro `useScrollSpy` ya está protegido con `typeof window !== 'undefined'`.

### Error: "Module not found: 'socket.io-client'"

**Síntoma**: Build falla con este error.

**Solución**: Ejecuta `bun install` localmente y committea el `bun.lock`. Ya está hecho.

---

## 🎯 URLs de secciones (deep linking)

Gracias al Scroll Spy + Deep Linking que implementamos, cada sección tiene su URL compartible:

| Sección | URL |
|---|---|
| Subasta en vivo | `/#hero` |
| Vendedores top | `/#sellers` |
| Streams en vivo | `/#live-rail` |
| Subastas activas | `/#auctions` |
| Marketplace | `/#products` |
| Arquitectura | `/#architecture` |

**Ejemplo**: `https://tu-app.vercel.app/#auctions` lleva directo a la grilla de subastas activas.

---

## 📊 Monitoreo post-deploy

Después del primer deploy exitoso:

1. **Vercel Analytics** (gratis) — activa en Project Settings → Analytics
2. **Speed Insights** — también gratis, mide Core Web Vitals
3. **Logs en tiempo real** — Vercel dashboard → tu proyecto → tab "Logs"

---

## 🆘 ¿Aún con problemas?

Si después de seguir esta guía sigues viendo 404:

1. Toma screenshot del error completo (URL + mensaje)
2. Toma screenshot del deployment en Vercel dashboard (estado + logs)
3. Compártelo y te ayudo a diagnosticar

El 99% de los casos se resuelven con los pasos 1-4 de arriba.
