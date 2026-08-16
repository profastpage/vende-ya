'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, XCircle, QrCode, ShieldAlert } from 'lucide-react';
import {
  calculateSplit,
  formatPEN,
  type OrderSource,
  type PaymentMethod,
} from '@/lib/vendeda/payments';
import { useAuth } from '@/components/vendeda/AuthProvider';
import { ROUTES } from '@/lib/vendeda/routes';

interface CheckoutBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  price: number;
  source: OrderSource;
  sellerId: string;
  /** buyerId is taken from the JWT verified by the server. Optional prop kept for backward compat. */
  buyerId?: string;
  /** Si se pasa, dispara el envío Shalom al confirmar el pago */
  shipment?: {
    originAgencyId: string;
    destinationAgencyId: string;
    senderDni: string;
    senderName: string;
    senderPhone: string;
    receiverDni: string;
    receiverName: string;
    receiverPhone: string;
    packageDescription: string;
    weightKg: number;
    declaredValue: number;
  };
}

type PaymentUiMethod = 'yape' | 'plin' | 'card';
type OrderStatus = 'idle' | 'success' | 'error' | 'unauthenticated';

const METHOD_LABEL: Record<
  PaymentUiMethod,
  { label: string; emoji: string; activeClass: string }
> = {
  yape: {
    label: 'Yape',
    emoji: '🔮',
    activeClass: 'border-purple-500 bg-purple-950/40 text-purple-400',
  },
  plin: {
    label: 'Plin',
    emoji: '🌀',
    activeClass: 'border-teal-500 bg-teal-950/40 text-teal-400',
  },
  card: {
    label: 'Tarjeta',
    emoji: '💳',
    activeClass: 'border-amber-500 bg-amber-950/40 text-amber-400',
  },
};

export default function CheckoutBottomSheet({
  isOpen,
  onClose,
  productId,
  productName,
  price,
  source,
  sellerId,
  shipment,
}: CheckoutBottomSheetProps) {
  const router = useRouter();
  const { authedFetch, user, isDemoMode } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<PaymentUiMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);
  // Sprint 2-A: QR dinámico retornado por Mercado Pago
  const [qrData, setQrData] = useState<{ qrCode?: string; qrCodeBase64?: string; deepLink?: string } | null>(null);

  // Cálculo del split Modo A
  const split = calculateSplit({ totalAmount: price, source });

  const handleConfirmPayment = async () => {
    if (!paymentMethod) return;
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const payload: Record<string, unknown> = {
        // NOTE: buyerId is intentionally NOT sent — the server takes it
        // from the verified JWT in the Authorization header.
        sellerId,
        productId,
        source,
        totalAmount: price,
        paymentMethod: paymentMethod === 'card' ? 'credit_card' : (paymentMethod as PaymentMethod),
        gatewayToken: `tok_sandbox_${Math.random().toString(36).substring(2, 12)}`,
      };
      if (shipment) payload.shipment = shipment;

      const response = await authedFetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // 401 — not authenticated
      if (response.status === 401) {
        setOrderStatus('unauthenticated');
        return;
      }

      const data = await response.json();
      if (response.ok && data.success) {
        setOrderId(data.orderId);
        if (data.shipment?.trackingCode) {
          setTrackingCode(data.shipment.trackingCode);
        }
        // Sprint 2-A: guardar QR devuelto por Mercado Pago
        if (data.gateway?.qrCodeBase64 || data.gateway?.qrCode) {
          setQrData({
            qrCode: data.gateway.qrCode,
            qrCodeBase64: data.gateway.qrCodeBase64,
            deepLink: data.gateway.deepLink,
          });
        }
        setOrderStatus('success');
      } else {
        setErrorMessage(data.error || 'No se pudo procesar el pago.');
        setOrderStatus('error');
      }
    } catch (e) {
      setErrorMessage(
        e instanceof Error ? e.message : 'Hubo un problema con la pasarela o la wallet del vendedor.'
      );
      setOrderStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setOrderStatus('idle');
    setPaymentMethod(null);
    setErrorMessage('');
    setOrderId(null);
    setTrackingCode(null);
    setQrData(null);
    onClose();
  };

  const goToLogin = () => {
    handleClose();
    router.push(`${ROUTES.login}?redirect=/dashboard`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black z-50 pointer-events-auto"
            aria-hidden
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-card border-t border-border rounded-t-3xl z-50 p-6 pb-8 text-foreground max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            {/* Barra de arrastre */}
            <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full mx-auto mb-5" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>

            {/* Pantalla: no autenticado */}
            {orderStatus === 'unauthenticated' && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="text-center py-6"
              >
                <ShieldAlert className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-amber-400 mb-2">
                  Inicia sesión para comprar
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
                  Para procesar tu pago de forma segura necesitamos verificar tu identidad.
                  {isDemoMode ? ' El modo demo no permite pagos reales.' : ''}
                </p>
                <button
                  type="button"
                  onClick={goToLogin}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/10"
                >
                  Ir a iniciar sesión
                </button>
                <button
                  type="button"
                  onClick={() => setOrderStatus('idle')}
                  className="w-full mt-2 bg-muted hover:bg-accent text-foreground font-bold py-3 rounded-xl text-sm transition-all"
                >
                  Volver
                </button>
              </motion.div>
            )}

            {orderStatus === 'idle' && (
              <>
                <h3 id="checkout-title" className="text-xl font-bold mb-1">
                  ⚡ Checkout Express
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Compra segura con protección Vende Ya · Modo A
                </p>

                {/* Resumen del producto + split Modo A */}
                <div className="bg-muted rounded-2xl p-4 mb-5 border border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                      {productName}
                    </span>
                    <span className="text-lg font-black text-amber-400">
                      {formatPEN(price)}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground flex justify-between mb-2">
                    <span>
                      Tipo:{' '}
                      <b className="text-foreground uppercase">
                        {source === 'live_stream' ? 'En vivo' : 'Marketplace'}
                      </b>
                    </span>
                    <span>
                      Comisión:{' '}
                      <b className="text-foreground">{split.platformCommissionRate}%</b>
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <div className="text-muted-foreground">Plataforma</div>
                      <div className="text-amber-400 font-semibold">
                        -{formatPEN(split.platformCommissionAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Pasarela + IGV</div>
                      <div className="text-rose-400 font-semibold">
                        -{formatPEN(split.gatewayFeeWithIgv)}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Neto vendedor</div>
                      <div className="text-emerald-400 font-semibold">
                        {formatPEN(split.sellerNetAmount)}
                      </div>
                    </div>
                  </div>
                  {shipment && (
                    <div className="mt-2 text-[10px] text-muted-foreground">
                      Envío: <b className="text-foreground">Shalom agencia → agencia</b>
                    </div>
                  )}
                </div>

                {/* Indicador de sesión activa */}
                {user && !isDemoMode ? (
                  <div className="flex items-center gap-2 text-[10px] text-emerald-400 mb-4 bg-emerald-950/30 border border-emerald-900/50 rounded-lg px-3 py-2">
                    <CheckCircle2 className="h-3 w-3" />
                    Sesión verificada como <b className="font-mono">{user.email}</b>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-[10px] text-amber-400 mb-4 bg-amber-950/30 border border-amber-900/50 rounded-lg px-3 py-2">
                    <ShieldAlert className="h-3 w-3" />
                    Necesitas iniciar sesión para completar la compra
                  </div>
                )}

                {/* Métodos de pago */}
                <h4 className="text-sm font-bold text-foreground mb-3">
                  Selecciona tu método de pago:
                </h4>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {(Object.keys(METHOD_LABEL) as PaymentUiMethod[]).map((m) => {
                    const info = METHOD_LABEL[m];
                    const isActive = paymentMethod === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                          isActive
                            ? info.activeClass
                            : 'border-border bg-muted hover:bg-accent'
                        }`}
                        aria-pressed={isActive}
                      >
                        <span className="text-xl mb-1" aria-hidden>
                          {info.emoji}
                        </span>
                        <span className="text-xs font-bold">{info.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Vista dinámica del método de pago */}
                <AnimatePresence mode="wait">
                  {paymentMethod === 'yape' && (
                    <motion.div
                      key="yape"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-purple-950/20 border border-purple-900/50 rounded-2xl p-4 mb-6 text-center"
                    >
                      <p className="text-xs text-purple-300 mb-2">
                        Escanea el QR con la app de Yape para confirmar el pago
                      </p>
                      <div className="w-32 h-32 bg-white mx-auto rounded-xl flex items-center justify-center text-slate-800 font-bold shadow-lg">
                        <QrCode className="h-16 w-16" />
                      </div>
                      <p className="text-[10px] text-purple-400 mt-2">
                        Monto exacto: {formatPEN(price)}
                      </p>
                    </motion.div>
                  )}

                  {paymentMethod === 'plin' && (
                    <motion.div
                      key="plin"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-teal-950/20 border border-teal-900/50 rounded-2xl p-4 mb-6 text-center"
                    >
                      <p className="text-xs text-teal-300 mb-2">
                        Escanea el QR con la app de Plin para confirmar el pago
                      </p>
                      <div className="w-32 h-32 bg-white mx-auto rounded-xl flex items-center justify-center text-slate-800 font-bold shadow-lg">
                        <QrCode className="h-16 w-16" />
                      </div>
                      <p className="text-[10px] text-teal-400 mt-2">
                        Monto exacto: {formatPEN(price)}
                      </p>
                    </motion.div>
                  )}

                  {paymentMethod === 'card' && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-muted/80 rounded-2xl p-4 mb-6 space-y-3"
                    >
                      <p className="text-[11px] text-muted-foreground">
                        💳 Pago encriptado de un solo toque (Tarjeta Tokenizada vía Mercado Pago)
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Al continuar, serás redirigido al checkout seguro de Mercado Pago.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botón de confirmación */}
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  disabled={!paymentMethod || isProcessing}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:hover:bg-amber-500 text-slate-950 font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center text-sm"
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Procesando pago seguro...
                    </span>
                  ) : (
                    `Pagar ${formatPEN(price)} ahora`
                  )}
                </button>
              </>
            )}

            {/* Pantalla de éxito */}
            {orderStatus === 'success' && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="text-center py-6"
              >
                <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                <h3 className="text-2xl font-black text-emerald-400 mb-2">
                  ¡Compra Exitosa!
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
                  El dinero fue distribuido y el código de guía de Shalom se está generando.
                </p>
                {orderId && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Orden <span className="font-mono">{orderId}</span>
                  </p>
                )}
                {qrData?.qrCodeBase64 && (
                  <div className="bg-white p-2 rounded-xl mb-4 mx-auto w-fit">
                    <img
                      src={qrData.qrCodeBase64}
                      alt="QR de pago"
                      className="w-40 h-40"
                    />
                    {qrData.deepLink && (
                      <a
                        href={qrData.deepLink}
                        className="block mt-2 text-xs font-bold text-slate-950 bg-amber-500 px-3 py-1.5 rounded-lg"
                      >
                        Abrir app Yape/Plin →
                      </a>
                    )}
                  </div>
                )}
                {trackingCode && (
                  <div className="bg-muted rounded-xl p-4 mb-6">
                    <p className="text-xs text-muted-foreground mb-1">Código de seguimiento Shalom</p>
                    <p className="font-mono text-amber-400 text-lg break-all">{trackingCode}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full bg-muted hover:bg-accent text-foreground font-bold py-3 rounded-xl text-sm transition-all"
                >
                  Volver al En Vivo
                </button>
              </motion.div>
            )}

            {/* Pantalla de error */}
            {orderStatus === 'error' && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="text-center py-6"
              >
                <XCircle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-rose-500 mb-2">
                  Error en la Transacción
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto mb-6">
                  {errorMessage ||
                    'Hubo un problema con la pasarela o la wallet del vendedor no está conectada.'}
                </p>
                <button
                  type="button"
                  onClick={() => setOrderStatus('idle')}
                  className="w-full bg-muted hover:bg-accent text-foreground font-bold py-3 rounded-xl text-sm transition-all"
                >
                  Reintentar Pago
                </button>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
