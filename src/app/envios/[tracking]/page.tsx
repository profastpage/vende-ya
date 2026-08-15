'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { Truck, Package, MapPin, CheckCircle2, Clock, Loader2, AlertCircle } from 'lucide-react';
import { AppShell } from '@/components/vendeda/AppShell';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPEN } from '@/lib/vendeda/format';
import { cn } from '@/lib/utils';

interface ShipmentData {
  shipment: {
    id: string;
    trackingCode: string | null;
    originAgencyId: string;
    destinationAgencyId: string;
    senderDni: string;
    receiverDni: string;
    shippingCost: number;
    shipmentStatus: string;
    pdfLabelUrl: string | null;
    createdAt: string;
    updatedAt: string;
    order: {
      id: string;
      totalAmount: number;
      paymentStatus: string;
      paymentMethod: string;
    };
  };
}

const STATUS_STEPS = [
  { key: 'pending_dropoff', label: 'Pendiente de entrega', icon: Clock, color: 'amber' },
  { key: 'in_transit', label: 'En tránsito', icon: Truck, color: 'blue' },
  { key: 'ready_for_pickup', label: 'Listo para recoger', icon: MapPin, color: 'purple' },
  { key: 'delivered', label: 'Entregado', icon: CheckCircle2, color: 'green' },
];

export default function TrackingPage() {
  const params = useParams<{ tracking: string }>();
  const trackingCode = decodeURIComponent(params.tracking);

  const { data, isLoading, error } = useShipmentTracking(trackingCode);

  return (
    <AppShell
      title="Seguimiento de envío"
      breadcrumbs={[{ label: 'Envíos', href: '/envios' }, { label: trackingCode }]}
      maxWidth="max-w-3xl"
      showBack
    >
      {isLoading ? (
        <Card className="p-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </Card>
      ) : error ? (
        <Card className="p-6 border-rose-200 bg-rose-50">
          <div className="flex items-center gap-3 text-rose-700">
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">No se pudo cargar el envío</p>
              <p className="text-sm text-rose-600">{error}</p>
            </div>
          </div>
        </Card>
      ) : data ? (
        <ShipmentView shipment={data.shipment} />
      ) : null}
    </AppShell>
  );
}

function ShipmentView({ shipment }: { shipment: ShipmentData['shipment'] }) {
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === shipment.shipmentStatus);

  return (
    <div className="space-y-4">
      {/* Header con tracking code */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Código de seguimiento Shalom</p>
            <p className="font-mono text-lg font-bold text-salsa-600 break-all">
              {shipment.trackingCode ?? '—'}
            </p>
          </div>
          {shipment.pdfLabelUrl && (
            <a href={shipment.pdfLabelUrl} target="_blank" rel="noopener noreferrer">
              <Badge variant="outline" className="cursor-pointer hover:bg-muted">
                <Package className="h-3 w-3 mr-1" /> Ver guía PDF
              </Badge>
            </a>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Agencia origen</p>
            <p className="font-medium">{shipment.originAgencyId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Agencia destino</p>
            <p className="font-medium">{shipment.destinationAgencyId}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Costo de envío</p>
            <p className="font-medium">{formatPEN(shipment.shippingCost)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Orden</p>
            <p className="font-mono text-xs">#{shipment.order.id.slice(0, 8)}</p>
          </div>
        </div>
      </Card>

      {/* Timeline de estados */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Estado del envío</h3>
        <div className="space-y-4">
          {STATUS_STEPS.map((step, i) => {
            const isDone = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            const isFuture = i > currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-start gap-3">
                <div
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center shrink-0',
                    isDone && 'bg-lima-100 text-lima-700',
                    isCurrent && `bg-${step.color}-100 text-${step.color}-700 ring-2 ring-${step.color}-500`,
                    isFuture && 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 pt-1.5">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isFuture && 'text-muted-foreground',
                      isCurrent && 'font-bold'
                    )}
                  >
                    {step.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Actualizado: {new Date(shipment.updatedAt).toLocaleString('es-PE')}
                    </p>
                  )}
                </div>
                {isDone && (
                  <CheckCircle2 className="h-4 w-4 text-lima-500 mt-3" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Estado de pago */}
      <Card className="p-6">
        <h3 className="font-semibold mb-3">Estado del pago</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Monto total</p>
            <p className="text-lg font-bold">{formatPEN(shipment.order.totalAmount)}</p>
          </div>
          <Badge
            variant={
              shipment.order.paymentStatus === 'released'
                ? 'default'
                : shipment.order.paymentStatus === 'escrow_hold'
                  ? 'secondary'
                  : 'outline'
            }
            className="capitalize"
          >
            {shipment.order.paymentStatus.replace('_', ' ')}
          </Badge>
        </div>
        {shipment.order.paymentStatus === 'escrow_hold' && (
          <p className="text-xs text-muted-foreground mt-2">
            El pago está retenido hasta que se confirme la entrega del paquete.
          </p>
        )}
        {shipment.order.paymentStatus === 'released' && (
          <p className="text-xs text-lima-600 mt-2">
            ✓ Pago liberado al vendedor. ¡Gracias por tu compra!
          </p>
        )}
      </Card>
    </div>
  );
}

/**
 * Hook con polling cada 30 segundos para tracking en tiempo real.
 */
function useShipmentTracking(trackingCode: string) {
  const [data, setData] = React.useState<ShipmentData | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const res = await fetch(
          `/api/shalom/shipments?tracking=${encodeURIComponent(trackingCode)}`
        );
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        const json = await res.json();
        if (active) {
          setData(json);
          setError(null);
        }
      } catch (e) {
        if (active) {
          setError(e instanceof Error ? e.message : 'Error desconocido');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [trackingCode]);

  return { data, error, isLoading };
}
