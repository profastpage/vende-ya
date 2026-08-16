'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  User, Bell, Lock, Globe, Trash2, Save, ShieldCheck, AlertTriangle,
} from 'lucide-react'
import { StaticPageShell, DarkToggle } from '@/components/vendeda/StaticPageShell'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import {
  DarkInput, DarkTextarea, DarkLabel, DarkSelect,
  GradientButton, GhostButton, staggerContainer, staggerItem,
} from '@/components/vendeda/StaticPageShell'
import { useToast } from '@/hooks/use-toast'
import { MOCK_PROFILES } from '@/lib/vendeda/mock-data'
import { initials } from '@/lib/vendeda/format'
import { PERU_DEPARTMENTS } from '@/lib/vendeda/constants'
import type { Breadcrumb } from '@/components/vendeda/AppShell'

const breadcrumbs: Breadcrumb[] = [{ label: 'Configuración' }]

const SECTIONS = [
  { id: 'cuenta', icon: User, title: 'Cuenta', accent: 'text-amber-400' },
  { id: 'notificaciones', icon: Bell, title: 'Notificaciones', accent: 'text-rose-400' },
  { id: 'privacidad', icon: Lock, title: 'Privacidad y seguridad', accent: 'text-sky-400' },
  { id: 'preferencias', icon: Globe, title: 'Idioma y región', accent: 'text-fuchsia-400' },
] as const

function ToggleRow({
  label, desc, checked, onChange,
}: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-sm font-bold text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <DarkToggle checked={checked} onChange={onChange} aria-label={label} />
    </div>
  )
}

function SectionCard({
  id, icon: Icon, title, accent, children,
}: {
  id: string
  icon: React.ElementType
  title: string
  accent: string
  children: React.ReactNode
}) {
  return (
    <motion.section
      id={id}
      variants={staggerItem}
      className="rounded-2xl bg-card/80 border border-border backdrop-blur-sm p-5 md:p-6"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="h-9 w-9 rounded-xl bg-muted border border-border flex items-center justify-center">
          <Icon className={`h-4 w-4 ${accent}`} />
        </div>
        <h3 className="font-black text-foreground text-base">{title}</h3>
      </div>
      <div className="space-y-3 divide-y divide-border">{children}</div>
    </motion.section>
  )
}

export default function SettingsPage() {
  const user = MOCK_PROFILES[5]
  const { toast } = useToast()
  const [name, setName] = React.useState(user.displayName)
  const [bio, setBio] = React.useState(user.bio ?? '')
  const [department, setDepartment] = React.useState(user.department ?? 'Lima')
  const [notifBids, setNotifBids] = React.useState(true)
  const [notifMessages, setNotifMessages] = React.useState(true)
  const [notifLive, setNotifLive] = React.useState(true)
  const [notifMarketing, setNotifMarketing] = React.useState(false)
  const [twoFA, setTwoFA] = React.useState(false)
  const [showOnline, setShowOnline] = React.useState(true)
  const [allowTags, setAllowTags] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast({
      title: 'Cambios guardados',
      description: 'Tu perfil fue actualizado correctamente.',
    })
  }

  return (
    <AuthGuard>
      <StaticPageShell
        title="Configuración"
        breadcrumbs={breadcrumbs}
        maxWidth="max-w-3xl"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {/* Profile / Account */}
          <SectionCard id="cuenta" icon={User} title="Información personal" accent="text-amber-400">
            <div className="flex items-center gap-4 pb-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-fuchsia-500 flex items-center justify-center text-foreground font-black text-xl shrink-0">
                {initials(name)}
              </div>
              <div>
                <GhostButton className="h-9 text-xs">Cambiar foto</GhostButton>
                <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG. Máx 2MB.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3 pt-4">
              <div>
                <DarkLabel htmlFor="name">Nombre</DarkLabel>
                <DarkInput
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <DarkLabel htmlFor="username">Usuario</DarkLabel>
                <DarkInput
                  id="username"
                  value={'@' + user.username}
                  disabled
                  className="opacity-60"
                />
                <p className="text-[10px] text-muted-foreground mt-1">No se puede cambiar</p>
              </div>
              <div className="md:col-span-2">
                <DarkLabel htmlFor="bio">Bio</DarkLabel>
                <DarkTextarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntale a la comunidad sobre ti, qué vendes, dónde envías..."
                />
              </div>
              <div>
                <DarkLabel htmlFor="dept">Departamento</DarkLabel>
                <DarkSelect
                  id="dept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  {PERU_DEPARTMENTS.map((d) => (
                    <option key={d} value={d} className="bg-card">
                      {d}
                    </option>
                  ))}
                </DarkSelect>
              </div>
            </div>
          </SectionCard>

          {/* Notifications */}
          <SectionCard id="notificaciones" icon={Bell} title="Notificaciones" accent="text-rose-400">
            <ToggleRow
              label="Pujas y subastas"
              desc="Cuando te superan, ganas o una subasta relevante termina"
              checked={notifBids}
              onChange={setNotifBids}
            />
            <ToggleRow
              label="Mensajes"
              desc="Cuando recibes un mensaje nuevo en tu bandeja"
              checked={notifMessages}
              onChange={setNotifMessages}
            />
            <ToggleRow
              label="Streams en vivo"
              desc="Cuando un vendedor que sigues comienza un stream"
              checked={notifLive}
              onChange={setNotifLive}
            />
            <ToggleRow
              label="Promociones"
              desc="Ofertas y novedades de Vende Ya (máx 1 por semana)"
              checked={notifMarketing}
              onChange={setNotifMarketing}
            />
          </SectionCard>

          {/* Privacy & Security */}
          <SectionCard id="privacidad" icon={Lock} title="Privacidad y seguridad" accent="text-sky-400">
            <ToggleRow
              label="Autenticación 2FA"
              desc="Verificación por SMS adicional al iniciar sesión"
              checked={twoFA}
              onChange={setTwoFA}
            />
            <ToggleRow
              label="Mostrar estado en línea"
              desc="Otros usuarios podrán ver cuando estás activo"
              checked={showOnline}
              onChange={setShowOnline}
            />
            <ToggleRow
              label="Permitir menciones"
              desc="Otros usuarios pueden etiquetarte en mensajes y publicaciones"
              checked={allowTags}
              onChange={setAllowTags}
            />
            <div className="flex items-center justify-between gap-4 pt-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">Cambiar contraseña</p>
                <p className="text-xs text-muted-foreground mt-0.5">Último cambio hace 3 meses</p>
              </div>
              <GhostButton className="h-9 text-xs">Cambiar</GhostButton>
            </div>
            <div className="flex items-center justify-between gap-4 pt-4">
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-lime-400" />
                  Verificar identidad
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Sube tu DNI para obtener el badge ✓</p>
              </div>
              <GhostButton className="h-9 text-xs">Verificar</GhostButton>
            </div>
          </SectionCard>

          {/* Language & Region */}
          <SectionCard id="preferencias" icon={Globe} title="Idioma y región" accent="text-fuchsia-400">
            <div className="grid md:grid-cols-2 gap-3 pt-1">
              <div>
                <DarkLabel>Idioma</DarkLabel>
                <DarkSelect defaultValue="es">
                  <option value="es" className="bg-card">Español (Perú)</option>
                  <option value="en" className="bg-card">English (US)</option>
                </DarkSelect>
              </div>
              <div>
                <DarkLabel>Moneda</DarkLabel>
                <DarkSelect defaultValue="PEN">
                  <option value="PEN" className="bg-card">S/. PEN (Sol peruano)</option>
                  <option value="USD" className="bg-card">$ USD (Dólar)</option>
                </DarkSelect>
              </div>
            </div>
          </SectionCard>

          {/* Save bar */}
          <div className="sticky bottom-4 z-20 flex gap-2">
            <GradientButton
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-12 shadow-xl shadow-fuchsia-500/40"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </GradientButton>
          </div>

          {/* Danger zone */}
          <motion.section
            variants={staggerItem}
            className="rounded-2xl bg-rose-500/5 border-2 border-rose-500/30 p-5 md:p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              </div>
              <h3 className="font-black text-rose-400 text-base">Zona peligrosa</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              Al eliminar tu cuenta, se borrarán permanentemente todos tus productos,
              subastas, mensajes, calificaciones y datos personales. Esta acción{' '}
              <strong className="text-rose-300">no se puede deshacer</strong> después de 30 días.
              Las facturas emitidas se conservarán por 7 años por obligaciones legales de SUNAT.
            </p>
            <div className="flex flex-col md:flex-row gap-2">
              <button
                onClick={() =>
                  toast({
                    title: 'Cuenta suspendida',
                    description: 'Tu cuenta está en modo suspendido por 30 días.',
                    variant: 'destructive',
                  })
                }
                className="inline-flex items-center justify-center gap-2 px-4 h-11 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 font-bold text-sm transition-colors"
              >
                <Trash2 className="h-4 w-4" /> Eliminar cuenta
              </button>
              <button
                onClick={() =>
                  toast({
                    title: 'Solicitud enviada',
                    description: 'Te contactaremos para exportar tus datos.',
                  })
                }
                className="inline-flex items-center justify-center gap-2 px-4 h-11 rounded-xl bg-muted border border-border hover:bg-muted text-muted-foreground font-semibold text-sm transition-colors"
              >
                Exportar mis datos
              </button>
            </div>
          </motion.section>
        </motion.div>
      </StaticPageShell>
    </AuthGuard>
  )
}
