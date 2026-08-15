'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ReportarInfraccionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    reporterEmail: '',
    targetSellerId: '',
    targetOrderOrStreamId: '',
    infringedBrand: '',
    evidenceUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/copyright-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo enviar el reporte');

      toast({
        title: 'Reporte enviado',
        description:
          'Nuestro equipo de moderación lo revisará en las próximas 24 horas.',
      });
      router.push('/');
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Reportar Infracción de Propiedad Intelectual
            </h1>
            <p className="text-sm text-muted-foreground">
              Programa Verifica · Vende Ya Perú
            </p>
          </div>
        </div>

        <Card className="mb-4 border-orange-200 bg-orange-50">
          <CardContent className="pt-6 text-sm text-orange-900">
            <p className="font-semibold mb-2">📋 Antes de reportar</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Solo reporta si eres el titular de la marca o su representante legal.</li>
              <li>Incluye evidencia clara (URL del producto, capturas, registro de marca).</li>
              <li>Falsos reportes pueden resultar en acciones legales contra el reportante.</li>
              <li>Vende Ya actuará en menos de 24h hábiles sobre tu reporte.</li>
            </ul>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Detalles del reporte</CardTitle>
              <CardDescription>
                Completa el formulario con la mayor cantidad de detalle posible.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reporterEmail">Tu email *</Label>
                <Input
                  id="reporterEmail"
                  type="email"
                  required
                  value={form.reporterEmail}
                  onChange={(e) => setForm({ ...form, reporterEmail: e.target.value })}
                  placeholder="abogado@marca.com.pe"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetSellerId">ID del vendedor *</Label>
                  <Input
                    id="targetSellerId"
                    required
                    value={form.targetSellerId}
                    onChange={(e) => setForm({ ...form, targetSellerId: e.target.value })}
                    placeholder="usr_xxx o username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="infringedBrand">Marca infringida *</Label>
                  <Input
                    id="infringedBrand"
                    required
                    value={form.infringedBrand}
                    onChange={(e) => setForm({ ...form, infringedBrand: e.target.value })}
                    placeholder="Nike, Adidas, Samsung..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetOrderOrStreamId">
                  URL o ID del producto/stream infractor *
                </Label>
                <Input
                  id="targetOrderOrStreamId"
                  required
                  value={form.targetOrderOrStreamId}
                  onChange={(e) => setForm({ ...form, targetOrderOrStreamId: e.target.value })}
                  placeholder="https://vendeya.pe/productos/xxx o stream ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="evidenceUrl">URL de evidencia (opcional)</Label>
                <Input
                  id="evidenceUrl"
                  type="url"
                  value={form.evidenceUrl}
                  onChange={(e) => setForm({ ...form, evidenceUrl: e.target.value })}
                  placeholder="https://drive.google.com/... o URL de captura"
                />
                <p className="text-xs text-muted-foreground">
                  Link a capturas, registro SUNAT de la marca, contrato de representación, etc.
                </p>
              </div>

              <Textarea
                readOnly
                value={`Al enviar este reporte, declaro bajo juramento que:\n\n1. Soy el titular legítimo de la marca "${form.infringedBrand || '[marca]'}" o su representante legal autorizado.\n2. La información proporcionada es veraz y tengo pruebas de la infracción.\n3. Acepto que Vende Ya actúe de buena fe para retirar el contenido reportado.\n4. Entiendo que falsos reportes pueden resultar en acciones legales contra mí.`}
                className="bg-muted/50 text-xs h-32"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" type="button" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar reporte
              </Button>
            </CardFooter>
          </Card>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Vende Ya actúa como intermediario neutro bajo el principio Safe Harbor.
          Para disputas complejas, contacta a{' '}
          <a
            href="mailto:legal@vendeya.pe"
            className="underline hover:text-foreground"
          >
            legal@vendeya.pe
          </a>
          .
        </p>
      </div>
    </div>
  );
}
