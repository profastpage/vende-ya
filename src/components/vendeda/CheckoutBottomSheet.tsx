'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2, XCircle, QrCode } from 'lucide-react';
import { calculateSplit, formatPEN, type OrderSource, type PaymentMethod } from '@/lib/vendeda/payments';

interface CheckoutBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  price: number;
  source: OrderSource;
  sellerId: string;
  buyerId: string;
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
type OrderStatus = 'idle' | 'success' | 'error';

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
  buyerId,
  shipment,
}: CheckoutBottomSheetProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentUiMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  // Cálculo del split Modo A
  const split = calculateSplit({ totalAmount: price, source });

  const handleConfirmPayment = async () => {
    if (!paymentMethod) return;
    setIsProcessing(true);
    setErrorMessage('');
    try {
      const payload: Record<string, unknown> = {
        buyerId,
        sellerId,
        productId,
        source,
        totalAmount: price,
        paymentMethod: paymentMethod === 'card' ? 'credit_card' : (paymentMethod as PaymentMethod),
        gatewayToken: `tok_sandbox_${Math.random().toString(36).substring(2, 12)}`,
      };
      if (shipment) payload.shipment = shipment;

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        setOrderId(data.orderId);
        if (data.shipment?.trackingCode) {
          setTrackingCode(data.shipment.trackingCode);
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
    onClose();
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
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl z-50 p-6 pb-8 text-white max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            {/* Barra de arrastre */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-5" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>

            {orderStatus === 'idle' && (
              <>
                <h3 id="checkout-title" className="text-xl font-bold mb-1">
                  ⚡ Checkout Express
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Completá tu compra de forma segura y directa
                </p>

                {/* Resumen del producto + split Modo A */}
                <div className="bg-slate-800 rounded-2xl p-4 mb-5 border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300 truncate max-w-[200px]">
                      {productName}
                    </span>
                    <span className="text-lg font-black text-amber-400">
                      {formatPEN(price)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex justify-between mb-2">
                    <span>
                      Tipo:{' '}
                      <b className="text-slate-200 uppercase">
                        {source === 'live_stream' ? 'En vivo' : 'Marketplace'}
                      </b>
                    </span>
                    <span>
                      Comisión:{' '}
                      <b className="text-slate-200">{split.platformCommissionRate}%</b>
                    </span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <div className="text-slate-500">Plataforma</div>
                      <div className="text-amber-400 font-semibold">
                        -{formatPEN(split.platformCommissionAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Pasarela + IGV</div>
                      <div className="text-rose-400 font-semibold">
                        -{formatPEN(split.gatewayFeeWithIgv)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Neto vendedor</div>
                      <div className="text-emerald-400 font-semibold">
                        {formatPEN(split.sellerNetAmount)}
                      </div>
                    </div>
                  </div>
                  {shipment && (
                    <div className="mt-2 text-[10px] text-slate-400">
                      Envío: <b className="text-slate-200">Shalom agencia → agencia</b>
                    </div>
                  )}
                </div>

                {/* Métodos de pago */}
                <h4 className="text-sm font-bold text-slate-300 mb-3">
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
                            : 'border-slate-800 bg-slate-800/50 hover:bg-slate-800'
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
                      className="bg-slate-800/80 rounded-2xl p-4 mb-6 space-y-3"
                    >
                      <p className="text-[11px] text-slate-400">
                        💳 Pago encriptado de un solo toque (Tarjeta Tokenizada vía Mercado Pago)
                      </p>
                      <p className="text-[10px] text-slate-500">
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
                <p className="text-sm text-slate-300 max-w-xs mx-auto mb-4">
                  El dinero fue distribuido y el código de guía de Shalom se está generando.
                </p>
                {orderId && (
                  <p className="text-xs text-slate-500 mb-4">
                    Orden <span className="font-mono">{orderId}</span>
                  </p>
                )}
                {trackingCode && (
                  <div className="bg-slate-800 rounded-xl p-4 mb-6">
                    <p className="text-xs text-slate-400 mb-1">Código de seguimiento Shalom</p>
                    <p className="font-mono text-amber-400 text-lg break-all">{trackingCode}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm transition-all"
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
                <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
                  {errorMessage ||
                    'Hubo un problema con la pasarela o la wallet del vendedor no está conectada.'}
                </p>
                <button
                  type="button"
                  onClick={() => setOrderStatus('idle')}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl text-sm transition-all"
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
