'use client'

import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'

const breadcrumbs: Breadcrumb[] = [{ label: 'Términos' }]

export default function TermsPage() {
  return (
    <AppShell title="Términos y condiciones" breadcrumbs={breadcrumbs} maxWidth="max-w-3xl">
      <div className="prose prose-sm max-w-none space-y-4 text-foreground">
        <p className="text-sm text-muted-foreground">Última actualización: 17 de junio, 2026</p>

        <Section title="1. Aceptación de los términos">
          Al registrarte y usar Vende Ya, aceptas estos Términos y nuestra Política de Privacidad.
          Si no estás de acuerdo, no uses la plataforma. Vende Ya es operado por Vende Ya SAC,
          RUC 20601234567, con domicilio en Lima, Perú.
        </Section>

        <Section title="2. Quién puede usar Vende Ya">
          Debes tener al menos 18 años y tener capacidad legal para celebrar contratos. Debes
          proporcionar información veraz al registrarte y mantenerla actualizada. Cada persona
          puede tener una sola cuenta. No se permiten cuentas falsas o bots.
        </Section>

        <Section title="3. Subastas y compras">
          Al pujar en una subasta, asumes un compromiso legal de pago si resultas ganador.
          Las pujas no se pueden retractar. El vendedor se compromete a enviar el producto al
          ganador en un plazo máximo de 48 horas tras la verificación del pago. Si el ganador
          no paga en 24 horas, la subasta se puede reabrir o asignar al segundo mejor postor.
        </Section>

        <Section title="4. Comisiones">
          Vende Ya cobra una comisión del 5% sobre el precio final de cada venta exitosa,
          descontada automáticamente del pago al vendedor. Los vendedores Pro (suscripción
          S/. 29/mes) pagan 3% de comisión. No hay cargo por publicar productos ni por pujar.
        </Section>

        <Section title="5. Pagos">
          Aceptamos Yape, Plin, PagoEfectivo y tarjetas Visa/Mastercard. Los pagos se
          retienen en escrow hasta que el comprador confirma la recepción del producto o
          hasta 7 días después de la entrega, lo que ocurra primero. En caso de disputa,
          Vende Ya actúa como mediador.
        </Section>

        <Section title="6. Envíos">
          Los vendedores eligen las empresas de envío disponibles (Olva, Shalom, Marvisur o
          recojo en tienda). El costo de envío lo paga el comprador salvo que el vendedor
          indique "envío gratis". Vende Ya no es responsable por pérdidas o daños durante
          el envío; esas reclamaciones se gestionan directamente con la empresa transportista.
        </Section>

        <Section title="7. Prohibiciones">
          No está permitido: (a) vender productos falsificados, robados o ilegales; (b) usar
          pujas falsas para inflar precios (shill bidding); (c) compartir enlaces a plataformas
          competidoras en los chats en vivo; (d) acosar a otros usuarios; (e) extraer datos
          de la plataforma mediante scraping. El incumplimiento resulta en suspensión o
          cancelación de cuenta sin reembolso.
        </Section>

        <Section title="8. Responsabilidad">
          Vende Ya es una plataforma que conecta compradores y vendedores. No somos parte de
          las transacciones entre usuarios. Cada vendedor es responsable de la calidad y
          legalidad de sus productos. Ofrecemos un fondo de protección al comprador de hasta
          S/. 500 por transacción en casos de fraude demostrado.
        </Section>

        <Section title="9. Cancelación de cuenta">
          Puedes cancelar tu cuenta en cualquier momento desde Configuración. Vende Ya puede
          suspender o cancelar cuentas que infrinjan estos Términos. La cancelación no exime
          el pago de obligaciones pendientes.
        </Section>

        <Section title="10. Ley aplicable">
          Estos Términos se rigen por las leyes de la República del Perú. Cualquier disputa
          se resolverá ante los juzgados de Lima.
        </Section>

        <Section title="11. Cambios a estos términos">
          Podemos actualizar estos Términos ocasionalmente. Te notificaremos 30 días antes
          de que entren en vigor. El uso continuado después de ese plazo implica aceptación.
        </Section>

        <p className="text-sm text-muted-foreground pt-4">
          Para preguntas sobre estos Términos, escríbenos a legal@vendeya.pe
        </p>
      </div>
    </AppShell>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold font-display mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">{children}</p>
    </div>
  )
}
