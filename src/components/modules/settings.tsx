'use client'

import { useState } from 'react'
import { useSettings } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Building2, Globe, Bell, Palette, Shield, Database, Mail, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export function SettingsModule() {
  const { data: settings } = useSettings()
  const qc = useQueryClient()
  const [form, setForm] = useState<Record<string, string>>(settings || {})
  const [lastSettings, setLastSettings] = useState(settings)
  // Adjust local form when settings change (React-recommended render-phase update)
  if (settings && settings !== lastSettings) {
    setLastSettings(settings)
    setForm({ ...settings })
  }

  const handleSave = async () => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success('Settings saved successfully')
      qc.invalidateQueries({ queryKey: ['settings'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    } else {
      toast.error('Failed to save settings')
    }
  }

  return (
    <div>
      <PageHeader
        title="System Settings"
        subtitle="Configure school preferences and options"
        extra={<Button onClick={handleSave}>Save Changes</Button>}
      />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general"><Building2 className="h-4 w-4 mr-1 inline" />General</TabsTrigger>
          <TabsTrigger value="academic"><Calendar className="h-4 w-4 mr-1 inline" />Academic</TabsTrigger>
          <TabsTrigger value="notification"><Bell className="h-4 w-4 mr-1 inline" />Notifications</TabsTrigger>
          <TabsTrigger value="backup"><Database className="h-4 w-4 mr-1 inline" />Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">School Information</CardTitle>
              <CardDescription>Basic school details used across the system</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-sm">School Name</Label>
                <Input value={form.school_name || ''} onChange={(e) => setForm({ ...form, school_name: e.target.value })} className="mt-1.5" />
              </div>
              <div className="sm:col-span-2">
                <Label className="text-sm">Address</Label>
                <Input value={form.school_address || ''} onChange={(e) => setForm({ ...form, school_address: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Phone</Label>
                <Input value={form.school_phone || ''} onChange={(e) => setForm({ ...form, school_phone: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Email</Label>
                <Input type="email" value={form.school_email || ''} onChange={(e) => setForm({ ...form, school_email: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Currency Symbol</Label>
                <Input value={form.currency || ''} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Language</Label>
                <Select value={form.language || 'en'} onValueChange={(v) => setForm({ ...form, language: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Emerald', color: 'bg-emerald-500' },
                  { name: 'Sky', color: 'bg-sky-500' },
                  { name: 'Violet', color: 'bg-violet-500' },
                  { name: 'Rose', color: 'bg-rose-500' },
                ].map((t) => (
                  <button key={t.name} className="rounded-lg border-2 border-transparent hover:border-primary p-3 flex flex-col items-center gap-2 transition-colors">
                    <div className={`h-10 w-10 rounded-full ${t.color}`} />
                    <span className="text-xs">{t.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Academic Year</CardTitle>
              <CardDescription>Configure the current academic session</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-sm">Academic Year</Label>
                <Input value={form.academic_year || ''} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Session Start Month</Label>
                <Select defaultValue="september">
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="september">September</SelectItem>
                    <SelectItem value="august">August</SelectItem>
                    <SelectItem value="july">July</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Working Days</Label>
                <div className="flex gap-1 mt-1.5">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <button key={i} className={`h-9 w-9 rounded-md text-xs font-medium ${i < 5 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Promote without exam</Label>
                <Switch defaultChecked={false} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Grading System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { grade: 'A+', min: 90, color: 'bg-emerald-100 text-emerald-700' },
                  { grade: 'A', min: 80, color: 'bg-emerald-100 text-emerald-700' },
                  { grade: 'B+', min: 70, color: 'bg-sky-100 text-sky-700' },
                  { grade: 'B', min: 60, color: 'bg-sky-100 text-sky-700' },
                  { grade: 'C', min: 50, color: 'bg-amber-100 text-amber-700' },
                  { grade: 'F', min: 0, color: 'bg-rose-100 text-rose-700' },
                ].map((g) => (
                  <div key={g.grade} className="flex items-center justify-between rounded-lg border p-3">
                    <Badge className={g.color}>{g.grade}</Badge>
                    <span className="text-sm text-muted-foreground">{g.min}% and above</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email & SMS Settings</CardTitle>
              <CardDescription>Configure notification delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Email notifications</Label>
                  <p className="text-xs text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">SMS notifications</Label>
                  <p className="text-xs text-muted-foreground">Send notifications via SMS</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Push notifications</Label>
                  <p className="text-xs text-muted-foreground">Browser push notifications</p>
                </div>
                <Switch defaultChecked={false} />
              </div>
              <div className="border-t pt-4">
                <Label className="text-sm">SMTP Server</Label>
                <Input placeholder="smtp.gmail.com" className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm">Port</Label>
                  <Input type="number" placeholder="587" className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-sm">Encryption</Label>
                  <Select defaultValue="tls">
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Database Backup</CardTitle>
              <CardDescription>Backup and restore system data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Last backup</p>
                  <p className="text-xs text-muted-foreground">Today at 02:00 AM</p>
                </div>
                <Button variant="outline" size="sm">Download backup</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Auto backup</p>
                  <p className="text-xs text-muted-foreground">Daily backup at 2 AM</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="text-sm font-medium">Storage used</p>
                  <p className="text-xs text-muted-foreground">128 MB of 1 GB</p>
                </div>
                <div className="w-24 bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '12%' }} />
                </div>
              </div>
              <Button variant="outline" className="w-full">Create backup now</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
