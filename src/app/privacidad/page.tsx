'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Shield, ChevronRight } from 'lucide-react'
import {
  StaticPageShell,
  PageHeader,
  staggerContainer,
  staggerItem,
} from '@/components/vendeda/StaticPageShell'
import type { Breadcrumb } from '@/components/vendeda/AppShell'

const breadcrumbs: Breadcrumb[] = [{ label: 'Privacidad' }]

interface TocItem {
  id: string
  title: string
  body: React.ReactNode
}

const SECTIONS: TocItem[] = [
  {
    id: 'datos-recopilados',
    title: '1. Datos que recopilamos',
    body: (
      <>
        <p className="mb-3">Recopilamos las siguientes categorías de información:</p>
        <ul className="space-y-2">
          {[
            <><strong className="text-foreground">Datos de registro:</strong> nombre, usuario, email, celular, foto de perfil.</>,
            <><strong className="text-foreground">Datos de transacciones:</strong> compras, ventas, pujas, mensajes, calificaciones.</>,
            <><strong className="text-foreground">Datos técnicos:</strong> dirección IP, dispositivo, navegador, ubicación aproximada por IP.</>,
            <><strong className="text-foreground">Datos de uso:</strong> páginas visitadas, tiempo en la app, clics, eventos analíticos.</>,
          ].map((item, i) => (
            <li key={i} className="flex gap-3 text-muted-foreground">
              <span className="text-amber-400 shrink-0">●</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3">
          No recopilamos datos biométricos sensibles más allá de la selfie con DNI
          necesaria para la verificación de identidad, la cual se elimina tras 90 días
          de aprobada la verificación.
        </p>
      </>
    ),
  },
  {
    id: 'uso-datos',
    title: '2. Cómo usamos tus datos',
    body: (
      <>
        <p className="mb-3">Tus datos se utilizan estrictamente para:</p>
        <ul className="space-y-2">
          {[
            'Proporcionar el servicio: registro, subastas, pagos, envíos y mensajería.',
            'Verificar tu identidad y prevenir fraude, doble cuenta o uso indebido.',
            'Enviar notificaciones sobre tus subastas, mensajes, pedidos y pagos.',
            'Mejorar la plataforma mediante analytics agregados y anónimos.',
            'Cumplir obligaciones legales ante SUNAT, INDECOPI y autoridades peruanas.',
          ].map((item, i) => (
            <li key={i} className="flex gap-3 text-muted-foreground">
              <span className="text-amber-400 shrink-0">●</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3">
          Nunca usamos tus datos para entrenar modelos de IA con información personal
          identificable. La moderación automática de chat opera en tiempo real y no
          almacena el contenido más allá del historial visible en la conversación.
        </p>
      </>
    ),
  },
  {
    id: 'comparticion',
    title: '3. Compartición de datos',
    body: (
      <>
        <p className="mb-3">Compartimos datos mínimos y necesarios con:</p>
        <ul className="space-y-2">
          {[
            <><strong className="text-foreground">Procesadores de pago</strong> (Yape, Plin, Niubiz): solo monto y referencia.</>,
            <><strong className="text-foreground">Empresas de envío</strong> (Olva, Shalom): nombre, dirección, teléfono.</>,
            <><strong className="text-foreground">Cloudflare</strong>: hosting, CDN y streaming de video.</>,
            <><strong className="text-foreground">Autoridades peruanas</strong> cuando lo exijan por mandato judicial.</>,
          ].map((item, i) => (
            <li key={i} className="flex gap-3 text-muted-foreground">
              <span className="text-amber-400 shrink-0">●</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-3 text-amber-300 font-bold">
          ⚠ Nunca vendemos tus datos personales a terceros con fines comerciales.
        </p>
      </>
    ),
  },
  {
    id: 'derechos',
    title: '4. Tus derechos (Ley 29733)',
    body: (
      <>
        <p className="mb-3">Como titular de tus datos personales, tienes derecho a:</p>
        <ul className="space-y-2">
          {[
            'Acceder a tus datos personales y obtener copia.',
            'Rectificar datos incorrectos o desactualizados.',
            'Solicitar eliminación de tu cuenta y datos asociados.',
            'Oponerte al tratamiento para fines de marketing.',
            'Solicitar portabilidad de tus datos en formato estructurado.',
          ].map((item, i) => (
            <li key={i} className="flex gap-3 text-muted-foreground">
              <span className="text-amber-400 shrink-0">●</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3">
          Ejerce estos derechos desde Configuración → Privacidad, o escribiendo a{' '}
          <a href="mailto:privacidad@vendeya.pe" className="text-amber-400 hover:text-amber-300 underline">
            privacidad@vendeya.pe
          </a>
          . Respondemos en un plazo máximo de 10 días hábiles.
        </p>
      </>
    ),
  },
  {
    id: 'seguridad',
    title: '5. Seguridad',
    body: (
      <>
        Implementamos múltiples capas de seguridad técnica y organizacional para
        proteger tus datos: HTTPS obligatorio en todo el sitio con cifrado TLS 1.3,
        encriptación AES-256 para datos sensibles en reposo, autenticación 2FA
        opcional para usuarios y obligatoria para administradores, Row Level Security
        (RLS) en cada tabla de la base de datos Supabase, y auditorías de seguridad
        trimestrales realizadas por equipos externos certificados. En caso de
        producirse una brecha de seguridad que afecte tus datos, te notificaremos
        por correo electrónico en menos de 72 horas, conforme al estándar ISO 27001.
      </>
    ),
  },
  {
    id: 'cookies',
    title: '6. Cookies',
    body: (
      <>
        Usamos dos tipos de cookies. Las <strong className="text-foreground">esenciales</strong>{' '}
        (sesión, carrito de compras, preferencia de idioma) son necesarias para el
        funcionamiento del sitio y no se pueden desactivar. Las{' '}
        <strong className="text-foreground">opcionales</strong> (analytics, marketing,
        redes sociales) solo se activan con tu consentimiento explícito, que puedes
        dar o retirar desde Configuración → Privacidad → Cookies. Mantenemos un
        registro de tu consentimiento por 12 meses, conforme a la normativa europea
        GDPR aplicable a usuarios europeos que usen la plataforma.
      </>
    ),
  },
  {
    id: 'retencion',
    title: '7. Retención de datos',
    body: (
      <>
        Conservamos tus datos personales mientras tu cuenta esté activa. Al cancelar
        tu cuenta, borramos tus datos personales en un plazo de 30 días, salvo
        aquellos que debamos conservar por obligaciones legales peruanas: facturas
        electrónicas por 7 años (SUNAT), registros contables por 5 años, y registros
        de moderación por 2 años en caso de investigaciones judiciales futuras.
        Después de estos plazos, los datos se eliminan permanentemente de nuestros
        servidores y respaldos.
      </>
    ),
  },
  {
    id: 'menores',
    title: '8. Menores de edad',
    body: (
      <>
        Vende Ya no está dirigido a menores de 18 años. No recopilamos
        conscientemente datos personales de menores de edad. Si detectamos que una
        cuenta pertenece a un menor, la cancelamos inmediatamente y borramos todos
        los datos asociados en un plazo máximo de 72 horas. Si eres padre o tutor y
        detectas que tu menor de edad ha registrado una cuenta, escríbenos a{' '}
        <a href="mailto:privacidad@vendeya.pe" className="text-amber-400 hover:text-amber-300 underline">
          privacidad@vendeya.pe
        </a>{' '}
        para proceder con la eliminación inmediata.
      </>
    ),
  },
  {
    id: 'cambios',
    title: '9. Cambios a esta política',
    body: (
      <>
        Podemos actualizar esta Política de Privacidad ocasionalmente para reflejar
        cambios en nuestras prácticas de manejo de datos o en la legislación peruana.
        Te notificaremos por correo electrónico con al menos 30 días de anticipación
        a la entrada en vigor de cambios significativos. El uso continuado de la
        plataforma después de ese plazo implica la aceptación de la política
        actualizada. Te recomendamos revisar esta página periódicamente.
      </>
    ),
  },
  {
    id: 'contacto',
    title: '10. Contacto',
    body: (
      <>
        <p className="mb-3">Para cualquier consulta relacionada con privacidad:</p>
        <div className="rounded-xl bg-muted border border-border p-4 space-y-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Preguntas de privacidad</span>
            <a href="mailto:privacidad@vendeya.pe" className="text-amber-400 hover:text-amber-300 font-bold">
              privacidad@vendeya.pe
            </a>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Ejercer derechos ARCO</span>
            <a href="mailto:datos@vendeya.pe" className="text-amber-400 hover:text-amber-300 font-bold">
              datos@vendeya.pe
            </a>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Autoridad peruana</span>
            <a href="https://www.mininter.gob.pe" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 font-bold">
              INDECOPI
            </a>
          </div>
        </div>
      </>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <StaticPageShell
      title="Política de privacidad"
      breadcrumbs={breadcrumbs}
      maxWidth="max-w-5xl"
      pageHeader={
        <PageHeader
          title="Política de privacidad"
          subtitle="Cómo recopilamos, usamos y protegemos tus datos personales en Vende Ya Perú, conforme a la Ley N° 29733."
          icon={Shield}
          glow="bg-fuchsia-500"
        />
      }
    >
      <div className="grid lg:grid-cols-[1fr_15rem] gap-8">
        {/* Content */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-4 min-w-0"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-fuchsia-400 animate-pulse" />
            Última actualización: 17 de junio, 2026
          </div>

          {SECTIONS.map((section) => (
            <motion.section
              key={section.id}
              id={section.id}
              variants={staggerItem}
              className="scroll-mt-24 rounded-2xl bg-card/80 border border-border backdrop-blur-sm p-6 md:p-7"
            >
              <h2 className="text-xl md:text-2xl font-black text-foreground font-display mb-3 leading-tight">
                {section.title}
              </h2>
              <div className="text-sm md:text-[15px] text-muted-foreground leading-relaxed space-y-3">
                {section.body}
              </div>
            </motion.section>
          ))}
        </motion.div>

        {/* Sticky TOC (desktop only) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl bg-muted backdrop-blur-xl border border-border p-5">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3">
              Contenido
            </p>
            <nav className="space-y-1">
              {SECTIONS.map((section, i) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-amber-400 hover:bg-muted transition-colors"
                >
                  <span className="text-muted-foreground font-mono text-[10px] mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="leading-snug">{section.title.replace(/^\d+\.\s*/, '')}</span>
                  <ChevronRight className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </StaticPageShell>
  )
}
