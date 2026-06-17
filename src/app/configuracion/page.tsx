'use client'

import * as React from 'react'
import { User, Bell, Lock, Globe, Palette, Trash2, Save } from 'lucide-react'
import { AppShell, type Breadcrumb } from '@/components/vendeda/AppShell'
import { AuthGuard } from '@/components/vendeda/AuthGuard'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { MOCK_PROFILES } from '@/lib/vendeda/mock-data'
import { initials } from '@/lib/vendeda/format'
import { PERU_DEPARTMENTS } from '@/lib/vendeda/constants'

const breadcrumbs: Breadcrumb[] = [{ label: 'Configuración' }]

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
  const [saving, setSaving] = React.useState(false)

  const handleSave = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast({ title: '✅ Cambios guardados', description: 'Tu perfil fue actualizado.' })
  }

  return (
    <AuthGuard>
    <AppShell title="Configuración" breadcrumbs={breadcrumbs} maxWidth="max-w-3xl">
      {/* Profile */}
      <Card className="p-5 mb-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-salsa-500" /> Información personal
        </h3>
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatarUrl ?? undefined} alt={name} />
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
          <div>
            <Button variant="outline" size="sm">Cambiar foto</Button>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG. Máx 2MB.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Usuario</Label>
            <Input id="username" value={'@' + user.username} disabled className="h-11" />
            <p className="text-[10px] text-muted-foreground">No se puede cambiar</p>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio" rows={2} value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntale a la comunidad sobre ti"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept">Departamento</Label>
            <select
              id="dept" value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-11 rounded-md border bg-background px-3 text-sm"
            >
              {PERU_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-5 mb-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-salsa-500" /> Notificaciones
        </h3>
        <div className="space-y-3">
          <ToggleRow label="Pujas y subastas" desc="Cuando te superan o ganas" checked={notifBids} onChange={setNotifBids} />
          <ToggleRow label="Mensajes" desc="Cuando recibes un mensaje nuevo" checked={notifMessages} onChange={setNotifMessages} />
          <ToggleRow label="Streams en vivo" desc="Cuando un vendedor que sigues comienza" checked={notifLive} onChange={setNotifLive} />
          <ToggleRow label="Promociones" desc="Ofertas y novedades de Vende Ya" checked={notifMarketing} onChange={setNotifMarketing} />
        </div>
      </Card>

      {/* Security */}
      <Card className="p-5 mb-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-salsa-500" /> Seguridad
        </h3>
        <div className="space-y-3">
          <ToggleRow label="Autenticación 2FA" desc="Verificación por SMS al iniciar sesión" checked={twoFA} onChange={setTwoFA} />
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-sm font-medium">Cambiar contraseña</p>
              <p className="text-xs text-muted-foreground">Última cambio hace 3 meses</p>
            </div>
            <Button variant="outline" size="sm">Cambiar</Button>
          </div>
        </div>
      </Card>

      {/* Language */}
      <Card className="p-5 mb-4">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-4 w-4 text-salsa-500" /> Idioma y región
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Idioma</Label>
            <select className="w-full h-11 rounded-md border bg-background px-3 text-sm">
              <option>Español (Perú)</option>
              <option>English (US)</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>Moneda</Label>
            <select className="w-full h-11 rounded-md border bg-background px-3 text-sm">
              <option>S/. PEN (Sol peruano)</option>
              <option>$ USD (Dólar)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Save */}
      <div className="flex gap-2 mb-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-salsa-500 hover:bg-salsa-600 text-white h-12"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      {/* Danger zone */}
      <Card className="p-5 border-destructive/30">
        <h3 className="font-semibold mb-2 text-destructive flex items-center gap-2">
          <Trash2 className="h-4 w-4" /> Zona peligrosa
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Al eliminar tu cuenta, se borrarán todos tus productos, subastas, mensajes y datos permanentemente.
        </p>
        <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/5">
          Eliminar cuenta
        </Button>
      </Card>
    </AppShell>
    </AuthGuard>

  )
}

function ToggleRow({
  label, desc, checked, onChange,
}: {
  label: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
