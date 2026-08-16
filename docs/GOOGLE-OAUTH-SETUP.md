# 🔐 Guía Paso a Paso: Configurar Inicio de Sesión con Google

Esta guía te lleva desde cero hasta tener el botón "Continuar con Google" funcionando en producción. Sigue los pasos en orden y NO omitas ninguno — Saltarse uno genera errores silenciosos.

---

## 📋 Prerrequisitos

Antes de empezar necesitas:

1. Una cuenta de Google Workspace o Gmail personal (cualquier cuenta Google sirve).
2. Acceso al panel de **Supabase** del proyecto Vende Ya:
   - URL del proyecto: `https://qkfgcynfzhjghtsrmdxs.supabase.co`
   - Login en: <https://supabase.com/dashboard>
3. Acceso al deploy de Vercel (para variables de entorno en producción):
   - <https://vercel.com/vende-ya-phi>

---

## 🚧 Paso 1: Crear el proyecto en Google Cloud Console

1. Entra a <https://console.cloud.google.com/> con tu cuenta Google.
2. En la barra superior haz clic en el **selector de proyectos** (a la izquierda del logo de Google Cloud).
3. Haz clic en **"Proyecto nuevo"** (arriba a la derecha del modal).
4. Completa:
   - **Nombre del proyecto:** `Vende Ya Auth` (o el que prefieras).
   - **Organización:** deja "Sin organización" si es una cuenta personal.
   - **ID del proyecto:** se autogenera, no lo cambies.
5. Haz clic en **"Crear"**. Tarda ~20 segundos.
6. Una vez creado, asegúrate de que esté seleccionado en el selector de proyectos (debe aparecer el nombre en la barra superior).

---

## 🌐 Paso 2: Configurar la Pantalla de Consentimiento de OAuth

Esta pantalla es lo que el usuario ve cuando Google le pide permiso para compartir sus datos con Vende Ya. **Es obligatoria** antes de crear credenciales.

1. En el menú lateral izquierdo, ve a **APIs y servicios → Pantalla de consentimiento de OAuth**.
2. Selecciona **"External"** (Externo) — todos los usuarios deben poder autenticarse. Clic en **"Crear"**.
3. Completa el formulario inicial:

   | Campo | Valor |
   |---|---|
   | **Nombre de la app** | `Vende Ya` |
   | **Correo de asistencia del usuario** | `soporte@vendeya.pe` (tu correo) |
   | **Logo de la app** | Sube `/public/logo.png` (512×512 px recomendado) |
   | **Correo de los desarrolladores** | Tu correo de Google |

4. Haz clic en **"Guardar y continuar"**.
5. Sección **Ámbitos (Scopes)**:
   - Haz clic en **"Add or remove scopes"**.
   - Marca estos tres scopes obligatorios:
     - ✅ `./auth/userinfo.email` — ver tu correo electrónico
     - ✅ `./auth/userinfo.profile` — ver tu info de perfil pública
     - ✅ `openid` — conectarse a tu cuenta de Google
   - Clic en **"Actualizar"** (Update) y luego **"Guardar y continuar"**.
6. Sección **Usuarios de prueba**:
   - Añade tu correo Gmail y el de 2-3 testers más.
   - Mientras la app esté en modo "Testing", SOLO estos correos podrán autenticarse.
   - Clic en **"Guardar y continuar"**.
7. Revisa el resumen y haz clic en **"Volver al panel"**.

> ⚠️ **Importante:** NO publiques la app todavía (la publicaremos en el Paso 6 después de probar).

---

## 🔑 Paso 3: Crear Credenciales OAuth Client ID

1. En el menú lateral izquierdo, ve a **APIs y servicios → Credenciales**.
2. Haz clic en **"+ Crear credenciales"** → **"ID de cliente de OAuth"**.
3. Selecciona **"Aplicación web"** como tipo.
4. Completa:
   - **Nombre:** `Vende Ya — Web Client (Supabase)`
5. En la sección **"Orígenes de JavaScript autorizados"** (Authorized JavaScript origins), añade estos URIs:

   **Localhost (desarrollo):**
   ```
   http://localhost
   http://localhost:3000
   ```

   **Producción (Vercel):**
   ```
   https://vende-ya-phi.vercel.app
   https://vendeya.pe
   ```

6. En la sección **"URIs de redireccionamiento autorizados"** (Authorized redirect URIs), añade:

   **Localhost:**
   ```
   http://localhost:3000/auth/callback
   ```

   **Producción Vercel:**
   ```
   https://vende-ya-phi.vercel.app/auth/callback
   ```

   > **Crítico:** El URI de redirección DEBE ser exactamente `https://<tu-supabase-project>.supabase.co/auth/v1/callback`. Pero como Supabase gestiona el callback internamente, en Google Console solo necesitas registrar el dominio de Supabase + Vercel.

   **Versión correcta (Supabase gestiona el callback):**

   ```
   https://qkfgcynfzhjghtsrmdxs.supabase.co/auth/v1/callback
   ```

   Añádelo a "URIs de redireccionamiento autorizados".

7. Haz clic en **"Crear"**.
8. Aparecerá un modal con dos valores críticos:
   - **ID de cliente:** algo como `123456789-abcdefg...apps.googleusercontent.com`
   - **Secreto del cliente:** un string aleatorio de ~35 caracteres.

   👉 **Copia ambos valores** a un lugar seguro (1Password, Bitwarden, o un vault). NO los subas a Git.

---

## 📦 Paso 4: Activar el provider Google en Supabase

1. Entra a <https://supabase.com/dashboard> y abre el proyecto Vende Ya.
2. En el menú lateral izquierdo, ve a **Authentication → Providers**.
3. Busca **Google** en la lista y haz clic en el toggle para activarlo.
4. Se abrirá un panel de configuración. Rellena:

   | Campo | Valor |
   |---|---|
   | **Client ID** | El ID que copiaste en el Paso 3 |
   | **Client Secret** | El secreto que copiaste en el Paso 3 |
   | **Authorized Client IDs** | (opcional, dejar vacío) |
   | **Skip nonce checking** | Déjalo desactivado |

5. En la sección **"Redirect URLs"** dentro de Supabase, asegúrate de que aparezcan:
   - `http://localhost:3000/**`
   - `https://vende-ya-phi.vercel.app/**`

   Si no están, añádelos con el botón "+ Add URL".

6. Clic en **"Save"** al final de la página.
7. Verás que el toggle de Google cambia a **"Enabled"** (verde).

---

## 🧪 Paso 5: Probar el flujo OAuth en local

1. Asegúrate de que tu archivo `.env.local` tenga las variables de Supabase correctas:

   ```bash
   # .env.local
   NEXT_PUBLIC_SUPABASE_URL="https://qkfgcynfzhjghtsrmdxs.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   ```

2. Inicia el servidor de desarrollo:

   ```bash
   cd /home/z/my-project/repos/vende-ya
   bun run dev
   ```

3. Abre <http://localhost:3000/login> en tu navegador.
4. Haz clic en el botón **"Continuar con Google"** (ícono de Google, botón blanco).
5. Se abrirá una ventana emergente o redirección a Google:
   - Si estás logueado en varias cuentas Google, te pedirá cuál usar.
   - Si la app está en modo "Testing" (Paso 2), solo los correos testers pueden continuar.
6. Acepta los permisos (ver tu email y perfil).
7. Google te redirige a `https://qkfgcynfzhjghtsrmdxs.supabase.co/auth/v1/callback`.
8. Supabase procesa el callback y te redirige a `http://localhost:3000/dashboard`.

✅ **Si llegaste al dashboard y ves tu nombre de usuario Google → la integración funciona.**

❌ Si ves un error, revisa:

- **"Unsupported provider: provider is not enabled"** → Vuelve al Paso 4, asegúrate de haber hecho clic en "Save" y que el toggle esté verde.
- **"redirect_uri_mismatch"** → Revisa que el URI de redirección esté escrito EXACTAMENTE igual en Google Cloud Console y Supabase (sin `/` final, sin `http` vs `https`).
- **"invalid_client"** → El Client ID o Secret tienen un typo. Vuelve al Paso 3 y vuelve a copiarlos.

---

## 🚀 Paso 6: Desplegar a producción (Vercel)

1. Sube tus cambios a `main`:
   ```bash
   git add -A
   git commit -m "feat: tema claro/oscuro + UI fixes"
   git push origin main
   ```
2. Vercel desplegará automáticamente. Espera a que termine el build (~2 min).
3. Verifica la URL de producción: <https://vende-ya-phi.vercel.app>
4. Entra a `/login` y prueba el botón de Google en producción.

> 💡 No necesitas cambiar variables en Vercel — las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` ya están en Vercel y funcionan tanto en dev como en prod.

---

## 🌍 Paso 7: Publicar la app en Google (modo Producción)

Mientras la app esté en modo "Testing", solo los correos testers pueden autenticarse. Para permitir a cualquier usuario Google:

1. Vuelve a Google Cloud Console → **APIs y servicios → Pantalla de consentimiento de OAuth**.
2. Haz clic en **"Publish App"** (Publicar la app).
3. Aparecerá un modal: haz clic en **"Confirm"**.
4. El estado cambia de "Testing" a **"In production"**.
5. Cualquier usuario Google ahora puede autenticarse.

> ⚠️ **Si tu app accede a scopes sensibles** (no es el caso de Vende Ya, que solo pide email+profile+openid), Google podría pedirte un proceso de verificación con logo, política de privacidad, etc. Vende Ya NO requiere verificación porque solo pide scopes básicos.

---

## 🔄 Paso 8: Verificar el flujo end-to-end

1. Entra a <https://vende-ya-phi.vercel.app/login>.
2. Cierra sesión si la tenías abierta.
3. Clic en **"Continuar con Google"**.
4. Completa el flujo OAuth.
5. Verifica que aterrices en `/dashboard` con tu nombre y avatar de Google visibles.
6. Ve a **Supabase → Authentication → Users** y confirma que tu usuario aparece en la lista con:
   - Provider: `google`
   - Email verificado: ✅
   - Metadata: tu nombre y avatar

---

## 🧯 Troubleshooting

### El botón no responde al clic
- Abre la consola del navegador (F12).
- Si ves `Supabase client not initialized`, revisa que `.env.local` tenga `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` correctamente escritas.
- Reinicia el dev server (`Ctrl+C` y `bun run dev` otra vez).

### Error "redirect_uri_mismatch"
- Compara EXACTAMENTE los URIs en:
  - Google Cloud Console → Credenciales → Tu OAuth Client → URIs de redireccionamiento.
  - Supabase → Authentication → URL Configuration → Redirect URLs.
- Deben ser idénticos, incluyendo `http` vs `https`, sin trailing slash.

### Solo funciona en local, no en producción
- En Google Cloud Console, asegúrate de haber añadido `https://vende-ya-phi.vercel.app` a "Orígenes de JavaScript" y "URIs de redireccionamiento".
- En Supabase, añade `https://vende-ya-phi.vercel.app/**` a Site URL y Redirect URLs.

### El usuario se autentica pero no redirige al dashboard
- Revisa el callback en `src/app/auth/callback/route.ts` (si existe) o cómo `AuthProvider.tsx` maneja el redirect.
- El `redirectTo` en `signInWithOAuth` debe ser `window.location.origin + '/dashboard'`.

---

## 📚 Referencias

- **Documentación oficial de Supabase Auth + Google:**
  <https://supabase.com/docs/guides/auth/social-login/auth-google>

- **Documentación de Google Identity:**
  <https://developers.google.com/identity/openid-connect/openid-connect>

- **Política de datos de Google (OAuth):**
  <https://developers.google.com/identity/protocols/oauth2/policies>

---

## ✅ Checklist final

- [ ] Proyecto creado en Google Cloud Console.
- [ ] Pantalla de consentimiento OAuth configurada (modo External).
- [ ] Scopes: `openid`, `userinfo.email`, `userinfo.profile` marcados.
- [ ] ID de cliente OAuth creado (Aplicación web).
- [ ] URI `https://qkfgcynfzhjghtsrmdxs.supabase.co/auth/v1/callback` en "URIs de redireccionamiento autorizados".
- [ ] URI `http://localhost:3000` y `https://vende-ya-phi.vercel.app` en "Orígenes de JavaScript".
- [ ] Client ID y Secret pegados en Supabase → Authentication → Providers → Google.
- [ ] Toggle de Google "Enabled" en Supabase.
- [ ] Probado en localhost:3000/login → llegué al dashboard.
- [ ] App publicada (Paso 7) para permitir usuarios no-testers.
- [ ] Probado en producción (vende-ya-phi.vercel.app) → llegué al dashboard.

¡Listo! El botón "Continuar con Google" ya funciona para todos tus usuarios.
