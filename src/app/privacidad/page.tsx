'use client'

import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'

const breadcrumbs: Breadcrumb[] = [{ label: 'Privacidad' }]

export default function PrivacyPage() {
  return (
    <AppShell title="Política de privacidad" breadcrumbs={breadcrumbs} maxWidth="max-w-3xl">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Última actualización: 17 de junio, 2026</p>

        <Section title="1. Datos que recopilamos">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Recopilamos: (a) datos que nos proporcionas al registrarte: nombre, usuario, email,
            celular, foto de perfil; (b) datos de transacciones: compras, ventas, pujas, mensajes;
            (c) datos técnicos: IP, dispositivo, navegador, ubicación aproximada; (d) datos de
            uso: páginas visitadas, tiempo en la app, clics.
          </p>
        </Section>

        <Section title="2. Cómo usamos tus datos">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para: (a) proporcionar el servicio (registro, subastas, pagos, envíos); (b) verificar
            tu identidad y prevenir fraude; (c) enviar notificaciones sobre tus subastas, mensajes
            y pedidos; (d) mejorar la plataforma (analytics agregados); (e) cumplir obligaciones
            legales ante SUNAT y autoridades peruanas.
          </p>
        </Section>

        <Section title="3. Compartición de datos">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Compartimos datos mínimos con: (a) procesadores de pago (Yape, Plin, Niubiz) — solo
            el monto y referencia; (b) empresas de envío (Olva, Shalom) — nombre, dirección,
            teléfono; (c) Cloudflare (hosting, CDN, streaming); (d) autoridades peruanas cuando
            lo exijan por ley. <strong>Nunca vendemos tus datos a terceros.</strong>
          </p>
        </Section>

        <Section title="4. Tus derechos (Ley 29733)">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tienes derecho a: (a) acceder a tus datos personales; (b) rectificar datos
            incorrectos; (c) solicitar eliminación de tu cuenta y datos asociados; (d) oponerte
            al tratamiento para fines de marketing; (e) portabilidad de tus datos. Ejerce estos
            derechos desde Configuración o escribiendo a privacidad@vendeya.pe.
          </p>
        </Section>

        <Section title="5. Seguridad">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Usamos: HTTPS en todo el sitio, encriptación AES-256 para datos sensibles,
            autenticación 2FA opcional, Row Level Security en la base de datos, y auditorías
            de seguridad trimestrales. En caso de brecha de seguridad, te notificaremos en
            menos de 72 horas.
          </p>
        </Section>

        <Section title="6. Cookies">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Usamos cookies esenciales (sesión, carrito) y opcionales (analytics, marketing).
            Puedes controlar las cookies opcionales desde Configuración. Las cookies esenciales
            son necesarias para el funcionamiento del sitio.
          </p>
        </Section>

        <Section title="7. Retención de datos">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Conservamos tus datos mientras tu cuenta esté activa. Al cancelarla, borramos tus
            datos personales en 30 días, salvo los que debamos conservar por obligaciones legales
            (facturas por 7 años, registros contables).
          </p>
        </Section>

        <Section title="8. Menores">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Vende Ya no está dirigido a menores de 18 años. No recopilamos conscientemente datos
            de menores. Si detectamos una cuenta de menor, la cancelamos y borramos los datos.
          </p>
        </Section>

        <Section title="9. Cambios a esta política">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Te notificaremos 30 días antes de cambios significativos. El uso continuado implica
            aceptación de la política actualizada.
          </p>
        </Section>

        <Section title="10. Contacto">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para preguntas sobre privacidad: <strong>privacidad@vendeya.pe</strong><br />
            Para ejercer tus derechos: <strong>datos@vendeya.pe</strong><br />
            Para denuncias ante la autoridad: <strong>https://minsa.gob.pe</strong> (autoridad
            peruana de protección de datos).
          </p>
        </Section>
      </div>
    </AppShell>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold font-display mb-1">{title}</h2>
      {children}
    </div>
  )
}
