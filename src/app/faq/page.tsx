'use client'

import * as React from 'react'
import { Search, ChevronRight } from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

const breadcrumbs: Breadcrumb[] = [{ label: 'FAQ' }]

const FAQS = [
  {
    cat: 'Compras',
    items: [
      { q: '¿Cómo pujar en una subasta?', a: 'Ingresa a la subasta en vivo desde la home o la sección "En vivo". Verás el precio actual, el mínimo incremento y un botón "Pujar ahora". Escribe tu monto (debe ser mayor al precio actual + incremento mínimo) y presiona el botón. La puja se transmite en tiempo real a todos los watchers. Si te superan, te notificamos. Si ganas, te contacta el vendedor para coordinar pago y envío.' },
      { q: '¿Puedo retractarme de una puja?', a: 'No. Las pujas son compromisos legales de compra. Una vez que pujas, asumes la obligación de pagar si resultas ganador. Si no pagas en 24h, pierdes la subasta, el segundo mejor postor puede ganar, y tu cuenta puede recibir una advertencia.' },
      { q: '¿Qué es "Comprar ya"?', a: 'Algunas subastas tienen un precio "Comprar ya" que te permite ganar la subasta inmediatamente sin esperar a que termine. Es útil si realmente quieres el producto y no quieres arriesgarte a que te superen.' },
      { q: '¿Cómo pago si gano?', a: 'Recibirás un mensaje del vendedor con el monto total (producto + envío). Puedes pagar con Yape, Plin, PagoEfectivo o tarjeta. El pago se retiene en escrow hasta que confirmes la recepción del producto.' },
    ],
  },
  {
    cat: 'Ventas',
    items: [
      { q: '¿Cómo publico un producto?', a: 'Toca el botón "+" en el menú inferior (móvil) o "Vender" en el top nav (desktop). Elige entre: Subasta rápida, Subastar en vivo, o Extraer con IA (describe tu producto y la IA arma el listing automáticamente).' },
      { q: '¿Cuánto cobra Vende Ya?', a: '5% de comisión sobre el precio final de cada venta exitosa, descontada automáticamente del pago que recibes. Los vendedores Pro (suscripción S/. 29/mes) pagan 3%. No hay cargo por publicar productos ni por pujar.' },
      { q: '¿Cuándo recibo mi dinero?', a: 'El pago se acredita en tu cuenta de Yape/Plin/banco en 24-48 horas después de que el comprador confirma la recepción del producto. Si no hay confirmación en 7 días, se libera automáticamente.' },
      { q: '¿Qué pasa si el comprador no paga?', a: 'Tienes 24h para esperar el pago. Si no llega, puedes reabrir la subasta (asignando al segundo mejor postor) o cancelar. Reporta al comprador para que reciba una advertencia.' },
    ],
  },
  {
    cat: 'Envíos',
    items: [
      { q: '¿Qué empresas de envío puedo usar?', a: 'Olva Courier, Shalom, Marvisur, o permitir recojo en tienda. Eliges al publicar el producto. El comprador paga el envío salvo que indiques "Envío gratis".' },
      { q: '¿Quién paga el envío?', a: 'Por defecto el comprador. El costo se calcula por peso, dimensión y zona. Si quieres destacar tu producto, puedes ofrecer "Envío gratis" asumiendo tú el costo.' },
      { q: '¿Qué hago si el producto se pierde en el envío?', a: 'El reclamo se gestiona directamente con la empresa transportista. Vende Ya no es responsable, pero te asistimos con la documentación necesaria. Recomendamos usar tracking y seguro cuando el producto supere S/. 200.' },
    ],
  },
  {
    cat: 'Cuenta y seguridad',
    items: [
      { q: '¿Cómo verifico mi cuenta?', a: 'Ve a Configuración → Seguridad → Verificar identidad. Necesitas: foto frontal de tu DNI, selfie con el DNI, y un número de celular validado por SMS. La verificación tarda 24-48h y te da el badge ✓ en tu perfil.' },
      { q: '¿Puedo tener múltiples cuentas?', a: 'No. Una persona = una cuenta. Si detectamos cuentas duplicadas, las suspendemos. Si necesitas una cuenta de empresa, regístrate como Vendedor Pro con RUC.' },
      { q: '¿Cómo activo 2FA?', a: 'Configuración → Seguridad → Autenticación 2FA. Te pediremos un número de celular válido. Cada inicio de sesión requerirá un código SMS adicional a tu contraseña.' },
      { q: '¿Cómo elimino mi cuenta?', a: 'Configuración → Zona peligrosa → Eliminar cuenta. Tienes 30 días para revertir. Después, todos tus datos se borran permanentemente salvo los obligatorios por ley (facturas por 7 años).' },
    ],
  },
]

export default function FAQPage() {
  const [query, setQuery] = React.useState('')
  const [activeCat, setActiveCat] = React.useState<string>(FAQS[0].cat)

  const filteredFaqs = React.useMemo(() => {
    if (!query) return FAQS
    return FAQS.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.q.toLowerCase().includes(query.toLowerCase()) ||
          item.a.toLowerCase().includes(query.toLowerCase())
      ),
    })).filter((cat) => cat.items.length > 0)
  }, [query])

  return (
    <AppShell title="Preguntas frecuentes" breadcrumbs={breadcrumbs} maxWidth="max-w-3xl">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Busca una pregunta..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-12"
        />
      </div>

      {!query && (
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {FAQS.map((cat) => (
            <button
              key={cat.cat}
              onClick={() => setActiveCat(cat.cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeCat === cat.cat ? 'bg-salsa-500 text-white' : 'bg-muted text-foreground'
              }`}
            >
              {cat.cat}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {filteredFaqs
          .filter((cat) => query || cat.cat === activeCat)
          .map((cat) =>
            cat.items.map((item, i) => (
              <Card key={`${cat.cat}-${i}`} className="overflow-hidden">
                <details className="group">
                  <summary className="cursor-pointer p-4 flex items-center justify-between hover:bg-muted/30">
                    <span className="text-sm font-medium pr-3">{item.q}</span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                </details>
              </Card>
            ))
        )}
        {filteredFaqs.length === 0 && (
          <Card className="p-8 text-center text-muted-foreground">
            Sin resultados para "{query}"
          </Card>
        )}
      </div>
    </AppShell>
  )
}
