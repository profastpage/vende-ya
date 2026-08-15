'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, ChevronRight } from 'lucide-react'
import {
  StaticPageShell,
  PageHeader,
  staggerContainer,
  staggerItem,
} from '@/components/vendeda/StaticPageShell'
import type { Breadcrumb } from '@/components/vendeda/AppShell'

const breadcrumbs: Breadcrumb[] = [{ label: 'Términos' }]

interface TocItem {
  id: string
  title: string
  body: React.ReactNode
}

const SECTIONS: TocItem[] = [
  {
    id: 'aceptacion',
    title: '1. Aceptación de los términos',
    body: (
      <>
        Al registrarte y usar Vende Ya, aceptas estos Términos y nuestra{' '}
        <Link href="/privacidad" className="text-amber-400 hover:text-amber-300 underline">
          Política de Privacidad
        </Link>
        . Si no estás de acuerdo con alguna cláusula, no debes usar la plataforma.
        Vende Ya es operado por Vende Ya SAC, RUC 20601234567, con domicilio fiscal
        en Av. Javier Prado 1234, San Isidro, Lima, Perú. El acceso a la app implica
        la aceptación expresa y sin reservas de todos los términos aquí descritos.
      </>
    ),
  },
  {
    id: 'quien-puede-usar',
    title: '2. Quién puede usar Vende Ya',
    body: (
      <>
        Debes tener al menos 18 años de edad y capacidad legal para celebrar contratos
        válidos en el territorio peruano. Debes proporcionar información veraz al
        registrarte y mantenerla actualizada si cambia. Cada persona puede tener una
        sola cuenta activa; no se permiten cuentas duplicadas, falsas o automatizadas
        (bots) destinadas a manipular precios. Las cuentas corporativas requieren
        registro como Vendedor Pro con RUC vigente en SUNAT.
      </>
    ),
  },
  {
    id: 'subastas',
    title: '3. Subastas y compras',
    body: (
      <>
        Al pujar en una subasta, asumes un compromiso legal de pago si resultas
        ganador. Las pujas no se pueden retractar una vez confirmadas por el sistema.
        El vendedor se compromete a enviar el producto al ganador en un plazo máximo de
        48 horas tras la verificación del pago. Si el ganador no paga en 24 horas, la
        subasta se puede reabrir o asignar al segundo mejor postor. Las subastas en
        vivo son grabadas y el historial de pujas se conserva por 7 años como evidencia
        en caso de disputas.
      </>
    ),
  },
  {
    id: 'comisiones',
    title: '4. Comisiones',
    body: (
      <>
        Vende Ya cobra una comisión del 5% sobre el precio final de cada venta
        exitosa, descontada automáticamente del pago al vendedor. Los vendedores Pro
        (suscripción S/. 29/mes) pagan 3% de comisión. No hay cargo por publicar
        productos, pujar, ni por las transacciones fallidas. La comisión se calcula
        sobre el precio del producto, sin incluir el costo de envío. Las refacturas
        por ajustes se emiten dentro de los 5 días hábiles posteriores al cierre.
      </>
    ),
  },
  {
    id: 'pagos',
    title: '5. Pagos',
    body: (
      <>
        Aceptamos Yape, Plin, PagoEfectivo y tarjetas Visa/Mastercard procesadas por
        Niubiz. Los pagos se retienen en una cuenta de escrow regulada hasta que el
        comprador confirma la recepción del producto o hasta 7 días después de la
        entrega, lo que ocurra primero. En caso de disputa, Vende Ya actúa como
        mediador neutral y puede retener los fondos por hasta 30 días adicionales
        mientras se resuelve el caso. Los reembolsos totales o parciales se emiten
        al mismo método de pago original.
      </>
    ),
  },
  {
    id: 'envios',
    title: '6. Envíos',
    body: (
      <>
        Los vendedores eligen las empresas de envío disponibles para cada producto
        (Olva, Shalom, Marvisur o recojo en tienda). El costo de envío lo paga el
        comprador salvo que el vendedor indique "envío gratis" en la publicación.
        Vende Ya no es responsable directo por pérdidas, daños o demoras durante el
        envío; esas reclamaciones se gestionan directamente con la empresa
        transportista según sus propios términos. Recomendamos al comprador grabar la
        apertura del paquete como evidencia en caso de reclamación.
      </>
    ),
  },
  {
    id: 'prohibiciones',
    title: '7. Prohibiciones',
    body: (
      <>
        <p className="mb-3">No está permitido lo siguiente dentro de la plataforma:</p>
        <ul className="space-y-2">
          {[
            'Vender productos falsificados, robados o ilegales (incluye réplicas no declaradas).',
            'Usar pujas falsas para inflar precios (shill bidding), ni coordinar con otros postores.',
            'Compartir enlaces a plataformas competidoras (MercadoLibre, Amazon, etc.) en chats en vivo.',
            'Acosar, insultar o amenazar a otros usuarios dentro o fuera de la app.',
            'Extraer datos de la plataforma mediante scraping, bots o automatizaciones.',
          ].map((rule, i) => (
            <li key={i} className="flex gap-3 text-zinc-300">
              <span className="text-amber-400 font-black shrink-0">{i + 1}.</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3">
          El incumplimiento resulta en suspensión temporal o cancelación definitiva de
          la cuenta sin derecho a reembolso de comisiones pagadas.
        </p>
      </>
    ),
  },
  {
    id: 'responsabilidad',
    title: '8. Responsabilidad',
    body: (
      <>
        Vende Ya es una plataforma que conecta compradores y vendedores independientes.
        No somos parte de las transacciones entre usuarios ni garantizamos la calidad,
        legalidad o autenticidad de los productos publicados. Cada vendedor es
        responsable individual de la calidad y legalidad de sus productos. Ofrecemos
        un fondo de protección al comprador de hasta S/. 500 por transacción en casos
        de fraude demostrado, sujeto a revisión caso por caso por nuestro equipo de
        confianza y seguridad.
      </>
    ),
  },
  {
    id: 'cancelacion',
    title: '9. Cancelación de cuenta',
    body: (
      <>
        Puedes cancelar tu cuenta en cualquier momento desde Configuración → Zona
        peligrosa → Eliminar cuenta. Tienes 30 días para revertir la cancelación;
        después, todos tus datos personales se borran permanentemente. Vende Ya puede
        suspender o cancelar cuentas que infrinjan estos Términos sin previo aviso.
        La cancelación no exime el pago de obligaciones pendientes (compras no
        pagadas, comisiones devengadas, multas por incumplimiento).
      </>
    ),
  },
  {
    id: 'ley',
    title: '10. Ley aplicable',
    body: (
      <>
        Estos Términos se rigen por las leyes de la República del Perú, en particular
        el Código Civil y la Ley de Protección al Consumidor (Código de Protección y
        Defensa del Consumidor, Ley N° 29571). Cualquier disputa que no se resuelva
        amistosamente se someterá a la jurisdicción de los juzgados civiles del
        distrito judicial de Lima Cercado. Las partes renuncian expresamente a
        cualquier otro fuero que pudiera corresponderles.
      </>
    ),
  },
  {
    id: 'cambios',
    title: '11. Cambios a estos términos',
    body: (
      <>
        Podemos actualizar estos Términos ocasionalmente para reflejar cambios en la
        legislación peruana, en nuestros servicios o por requerimientos de
        reguladores. Te notificaremos por correo electrónico y dentro de la app con al
        menos 30 días de anticipación a la entrada en vigor de los cambios
        significativos. El uso continuado de la plataforma después de ese plazo
        implica la aceptación tácita de los términos actualizados.
      </>
    ),
  },
]

export default function TermsPage() {
  return (
    <StaticPageShell
      title="Términos y condiciones"
      breadcrumbs={breadcrumbs}
      maxWidth="max-w-5xl"
      pageHeader={
        <PageHeader
          title="Términos y condiciones"
          subtitle="Las reglas que rigen el uso de Vende Ya Perú. Léelos con calma; si tienes dudas, escríbenos a legal@vendeya.pe."
          icon={FileText}
          glow="bg-amber-500"
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
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            Última actualización: 17 de junio, 2026
          </div>

          {SECTIONS.map((section) => (
            <motion.section
              key={section.id}
              id={section.id}
              variants={staggerItem}
              className="scroll-mt-24 rounded-2xl bg-zinc-900/80 border border-white/5 backdrop-blur-sm p-6 md:p-7"
            >
              <h2 className="text-xl md:text-2xl font-black text-white font-display mb-3 leading-tight">
                {section.title}
              </h2>
              <div className="text-sm md:text-[15px] text-zinc-300 leading-relaxed space-y-3">
                {section.body}
              </div>
            </motion.section>
          ))}

          <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-fuchsia-500/10 border border-white/10 p-6 text-center">
            <p className="text-sm text-zinc-300">
              Para preguntas sobre estos Términos, escríbenos a{' '}
              <a
                href="mailto:legal@vendeya.pe"
                className="text-amber-400 hover:text-amber-300 underline font-bold"
              >
                legal@vendeya.pe
              </a>
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Atendemos consultas legales en un plazo máximo de 5 días hábiles.
            </p>
          </div>
        </motion.div>

        {/* Sticky TOC (desktop only) */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-3">
              Contenido
            </p>
            <nav className="space-y-1">
              {SECTIONS.map((section, i) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="group flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs text-zinc-400 hover:text-amber-400 hover:bg-white/5 transition-colors"
                >
                  <span className="text-zinc-600 font-mono text-[10px] mt-0.5">
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
