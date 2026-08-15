'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, Shield, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/vendeda/AppShell';
import { AuthGuard } from '@/components/vendeda/AuthGuard';
import { useAuth } from '@/components/vendeda/AuthProvider';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/vendeda/routes';

export default function WalletPage() {
  return (
    <AuthGuard>
      <WalletContent />
    </AuthGuard>
  );
}

function WalletContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [linking, setLinking] = React.useState(false);

  const handleLink = async () => {
    setLinking(true);
    try {
      // En producción esto abriría el OAuth de Mercado Pago en una ventana nueva
      // const authUrl = `https://auth.mercadopago.com.pe/authorization?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${CALLBACK}`;
      // window.location.href = authUrl;

      // Por ahora simulamos: registramos una wallet demo en DB
      const res = await fetch('/api/wallet/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gatewaySellerId: `MPL-DEMO-${Date.now()}`,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      toast({
        title: '✓ Billetera vinculada',
        description: 'Tu cuenta de Mercado Pago está conectada (modo demo).',
      });
      router.push(ROUTES.dashboard);
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'No se pudo vincular',
        variant: 'destructive',
      });
    } finally {
      setLinking(false);
    }
  };

  return (
    <AppShell
      title="Mi Billetera"
      breadcrumbs={[{ label: 'Dashboard', href: ROUTES.dashboard }, { label: 'Billetera' }]}
      maxWidth="max-w-3xl"
      showBack
    >
      <div className="space-y-4">
        {/* Status actual */}
        <Card className="p-6 bg-gradient-to-br from-lima-500 to-lima-700 text-white border-0">
          <div className="flex items-center gap-4">
            <Wallet className="h-12 w-12" />
            <div className="flex-1">
              <p className="text-sm text-white/80">Estado de tu cuenta de cobros</p>
              <p className="text-xl font-bold">Mercado Pago</p>
            </div>
            <Badge className="bg-white/20 text-white border-0">Demo</Badge>
          </div>
        </Card>

        {/* Por qué vincular */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-3">¿Por qué vincular tu cuenta?</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-lima-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Recibe pagos automáticamente</p>
                <p className="text-muted-foreground">
                  Cada venta se deposita directamente en tu cuenta Mercado Pago.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-lima-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Split automático de comisiones</p>
                <p className="text-muted-foreground">
                  Vende Ya retiene su comisión (12% en vivo / 8% marketplace) en la fuente.
                  Tú recibes el neto exacto sin trámites.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-lima-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Escrow protegido</p>
                <p className="text-muted-foreground">
                  El pago queda retenido hasta que el comprador reciba su producto. Cero fraudes.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* KYC requerido */}
        <Card className="p-6 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900">Verificación KYC requerida</p>
              <p className="text-sm text-amber-800 mt-1">
                Para activar cobros reales necesitas completar la verificación de identidad
                en Mercado Pago. Esto incluye DNI + selfie y tarda 1-2 días hábiles.
              </p>
              <a
                href="https://www.mercadopago.com.pe/hub/centers/account"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-amber-900 underline font-semibold mt-2 inline-block"
              >
                Completar KYC en Mercado Pago →
              </a>
            </div>
          </div>
        </Card>

        {/* Costos del Modo A */}
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Estructura de costos (Modo A)</h3>
          <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Comisión Vende Ya (en vivo)</span>
              <span className="font-mono">12.00%</span>
            </div>
            <div className="flex justify-between">
              <span>Comisión Vende Ya (marketplace)</span>
              <span className="font-mono">8.00%</span>
            </div>
            <div className="flex justify-between">
              <span>Costo pasarela (3.9% + IGV)</span>
              <span className="font-mono">4.602%</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Neto para ti (en vivo)</span>
              <span className="text-lima-600 font-mono">83.40%</span>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              Ejemplo: venta de S/ 100 → recibes S/ 83.40 (en vivo) o S/ 87.40 (marketplace)
            </p>
          </div>
        </Card>

        {/* CTA */}
        <Card className="p-6">
          <Button
            onClick={handleLink}
            disabled={linking}
            className="w-full h-12 bg-salsa-500 hover:bg-salsa-600 text-white"
          >
            {linking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Vinculando cuenta...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Vincular mi cuenta de Mercado Pago
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Al continuar aceptas los{' '}
            <Link href={ROUTES.terminos} className="underline">
              Términos y Condiciones
            </Link>{' '}
            y la{' '}
            <Link href={ROUTES.privacidad} className="underline">
              Política de Privacidad
            </Link>
            .
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
