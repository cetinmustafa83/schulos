'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, ChevronRight, ChevronLeft, School, User, Calendar, Database, Rocket, Download, Terminal, Copy } from 'lucide-react'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'
import { useSettings, useCreate } from '@/hooks/use-data'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const STEPS = [
  { key: 'welcome', icon: Rocket, title: { tr: 'Hoş Geldiniz', de: 'Willkommen', en: 'Welcome' } },
  { key: 'school', icon: School, title: { tr: 'Okul Bilgileri', de: 'Schulinformationen', en: 'School Information' } },
  { key: 'admin', icon: User, title: { tr: 'Yönetici Hesabı', de: 'Administrator-Konto', en: 'Admin Account' } },
  { key: 'academic', icon: Calendar, title: { tr: 'Akademik Yıl', de: 'Schuljahr', en: 'Academic Year' } },
  { key: 'database', icon: Database, title: { tr: 'Veritabanı', de: 'Datenbank', en: 'Database' } },
  { key: 'complete', icon: CheckCircle2, title: { tr: 'Tamamlandı', de: 'Fertig', en: 'Complete' } },
]

export function SetupWizardModule() {
  const { language } = useUI()
  const { data: settings } = useSettings()
  const [step, setStep] = useState(0)
  const [schoolForm, setSchoolForm] = useState({
    school_name: settings?.school_name || '',
    school_address: settings?.school_address || '',
    school_phone: settings?.school_phone || '',
    school_email: settings?.school_email || '',
  })
  const [adminForm, setAdminForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  })
  const [academicForm, setAcademicForm] = useState({
    year: '2024-2025', startDate: '', endDate: '', language: 'tr',
  })
  const [dbForm, setDbForm] = useState({
    provider: 'sqlite', host: '', port: '', name: 'school_db', user: '', password: '',
  })

  const progress = ((step + 1) / STEPS.length) * 100

  const next = () => setStep(Math.min(STEPS.length - 1, step + 1))
  const prev = () => setStep(Math.max(0, step - 1))

  const handleSaveSettings = async () => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(schoolForm),
    })
    if (res.ok) toast.success('School information saved')
  }

  const handleComplete = async () => {
    await handleSaveSettings()
    toast.success(language === 'tr' ? 'Kurulum tamamlandı!' : language === 'de' ? 'Installation abgeschlossen!' : 'Setup complete!')
    next()
  }

  return (
    <div>
      <PageHeader
        title={t('setup.title', language)}
        subtitle={language === 'tr' ? 'Okulunuz için adım adım kurulum' : language === 'de' ? 'Schritt-für-Schritt-Installation für Ihre Schule' : 'Step-by-step setup for your school'}
      />

      {/* Progress bar */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">
              {language === 'tr' ? 'Adım' : language === 'de' ? 'Schritt' : 'Step'} {step + 1} / {STEPS.length}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          {/* Step indicators */}
          <div className="flex items-center justify-between mt-4">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full transition-all',
                    i < step && 'bg-emerald-500 text-white',
                    i === step && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    i > step && 'bg-muted text-muted-foreground'
                  )}>
                    {i < step ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={cn('text-[10px] text-center w-16', i === step && 'font-medium text-primary')}>
                    {s.title[language]}
                  </span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const Icon = STEPS[step].icon
                  return <Icon className="h-5 w-5 text-primary" />
                })()}
                {STEPS[step].title[language]}
              </CardTitle>
              <CardDescription>
                {step === 0 && (language === 'tr' ? 'Bu sihirbaz okulunuzu hızlıca kuracaktır' : language === 'de' ? 'Dieser Assistent richtet Ihre Schule schnell ein' : 'This wizard will quickly set up your school')}
                {step === 1 && (language === 'tr' ? 'Okulunuzun temel bilgilerini girin' : language === 'de' ? 'Geben Sie die Grundinformationen Ihrer Schule ein' : 'Enter your school basic information')}
                {step === 2 && (language === 'tr' ? 'Yönetici hesabını oluşturun' : language === 'de' ? 'Administrator-Konto erstellen' : 'Create admin account')}
                {step === 3 && (language === 'tr' ? 'Akademik yıl ayarlarını yapın' : language === 'de' ? 'Schuljahr-Einstellungen vornehmen' : 'Configure academic year settings')}
                {step === 4 && (language === 'tr' ? 'Veritabanı bağlantısını ayarlayın' : language === 'de' ? 'Datenbankverbindung einrichten' : 'Set up database connection')}
                {step === 5 && (language === 'tr' ? 'Kurulum tamam!' : language === 'de' ? 'Installation fertig!' : 'Setup complete!')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 0: Welcome */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="rounded-xl bg-gradient-to-br from-primary/10 to-transparent p-6 border border-primary/20">
                    <h3 className="text-lg font-semibold mb-2">
                      {language === 'tr' ? 'Okul Yönetim Sistemi\'ne Hoş Geldiniz!' : language === 'de' ? 'Willkommen beim Schulverwaltungssystem!' : 'Welcome to School Management System!'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {language === 'tr'
                        ? 'Bu yazılım tüm okullara ücretsiz olarak sunulmaktadır. Bu sihirbaz, okulunuzu birkaç dakikada kurmanıza yardımcı olacaktır.'
                        : language === 'de'
                        ? 'Diese Software wird allen Schulen kostenlos zur Verfügung gestellt. Dieser Assistent hilft Ihnen, Ihre Schule in wenigen Minuten einzurichten.'
                        : 'This software is provided free of charge to all schools. This wizard will help you set up your school in minutes.'}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { icon: School, title: language === 'tr' ? 'Okul Bilgileri' : language === 'de' ? 'Schulinformationen' : 'School Info', desc: language === 'tr' ? 'Ad, adres, iletişim' : language === 'de' ? 'Name, Adresse, Kontakt' : 'Name, address, contact' },
                      { icon: User, title: language === 'tr' ? 'Yönetici' : language === 'de' ? 'Administrator' : 'Admin', desc: language === 'tr' ? 'Yönetici hesabı oluştur' : language === 'de' ? 'Admin-Konto erstellen' : 'Create admin account' },
                      { icon: Calendar, title: language === 'tr' ? 'Akademik Yıl' : language === 'de' ? 'Schuljahr' : 'Academic Year', desc: language === 'tr' ? 'Yıl ve dönem ayarları' : language === 'de' ? 'Jahr und Semester' : 'Year and term settings' },
                      { icon: Database, title: language === 'tr' ? 'Veritabanı' : language === 'de' ? 'Datenbank' : 'Database', desc: language === 'tr' ? 'Bağlantı ayarları' : language === 'de' ? 'Verbindungseinstellungen' : 'Connection settings' },
                    ].map((item, i) => {
                      const Icon = item.icon
                      return (
                        <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                          <div className="rounded-lg bg-primary/10 p-2 shrink-0">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Step 1: School Info */}
              {step === 1 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="text-sm">{language === 'tr' ? 'Okul Adı' : language === 'de' ? 'Schulname' : 'School Name'} <span className="text-rose-500">*</span></Label>
                    <Input value={schoolForm.school_name} onChange={(e) => setSchoolForm({ ...schoolForm, school_name: e.target.value })} placeholder={language === 'tr' ? 'Atatürk Anadolu Lisesi' : language === 'de' ? 'Atatürk Gymnasium' : 'Atatürk High School'} className="mt-1.5" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-sm">{language === 'tr' ? 'Adres' : language === 'de' ? 'Adresse' : 'Address'}</Label>
                    <Input value={schoolForm.school_address} onChange={(e) => setSchoolForm({ ...schoolForm, school_address: e.target.value })} placeholder={language === 'tr' ? 'Cumhuriyet Cad. No:42' : language === 'de' ? 'Hauptstr. 42' : 'Main St. 42'} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">{language === 'tr' ? 'Telefon' : language === 'de' ? 'Telefon' : 'Phone'}</Label>
                    <Input value={schoolForm.school_phone} onChange={(e) => setSchoolForm({ ...schoolForm, school_phone: e.target.value })} placeholder="+90 216 555 0042" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">{language === 'tr' ? 'E-posta' : language === 'de' ? 'E-Mail' : 'Email'}</Label>
                    <Input type="email" value={schoolForm.school_email} onChange={(e) => setSchoolForm({ ...schoolForm, school_email: e.target.value })} placeholder="info@school.edu.tr" className="mt-1.5" />
                  </div>
                </div>
              )}

              {/* Step 2: Admin */}
              {step === 2 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label className="text-sm">{language === 'tr' ? 'Yönetici Adı' : language === 'de' ? 'Administrator-Name' : 'Admin Name'} <span className="text-rose-500">*</span></Label>
                    <Input value={adminForm.name} onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })} placeholder={language === 'tr' ? 'Sistem Yöneticisi' : language === 'de' ? 'Systemadministrator' : 'System Administrator'} className="mt-1.5" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-sm">{language === 'tr' ? 'E-posta' : language === 'de' ? 'E-Mail' : 'Email'} <span className="text-rose-500">*</span></Label>
                    <Input type="email" value={adminForm.email} onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })} placeholder="admin@school.edu.tr" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">{language === 'tr' ? 'Şifre' : language === 'de' ? 'Passwort' : 'Password'} <span className="text-rose-500">*</span></Label>
                    <Input type="password" value={adminForm.password} onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">{language === 'tr' ? 'Şifre Tekrar' : language === 'de' ? 'Passwort bestätigen' : 'Confirm Password'} <span className="text-rose-500">*</span></Label>
                    <Input type="password" value={adminForm.confirmPassword} onChange={(e) => setAdminForm({ ...adminForm, confirmPassword: e.target.value })} className="mt-1.5" />
                    {adminForm.confirmPassword && adminForm.password !== adminForm.confirmPassword && (
                      <p className="text-xs text-rose-500 mt-1">{language === 'tr' ? 'Şifreler eşleşmiyor' : language === 'de' ? 'Passwörter stimmen nicht überein' : 'Passwords do not match'}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Academic Year */}
              {step === 3 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label className="text-sm">{language === 'tr' ? 'Akademik Yıl' : language === 'de' ? 'Schuljahr' : 'Academic Year'}</Label>
                    <Input value={academicForm.year} onChange={(e) => setAcademicForm({ ...academicForm, year: e.target.value })} placeholder="2024-2025" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">{language === 'tr' ? 'Dil' : language === 'de' ? 'Sprache' : 'Language'}</Label>
                    <Select value={academicForm.language} onValueChange={(v) => setAcademicForm({ ...academicForm, language: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                        <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">{language === 'tr' ? 'Başlangıç Tarihi' : language === 'de' ? 'Startdatum' : 'Start Date'}</Label>
                    <Input type="date" value={academicForm.startDate} onChange={(e) => setAcademicForm({ ...academicForm, startDate: e.target.value })} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-sm">{language === 'tr' ? 'Bitiş Tarihi' : language === 'de' ? 'Enddatum' : 'End Date'}</Label>
                    <Input type="date" value={academicForm.endDate} onChange={(e) => setAcademicForm({ ...academicForm, endDate: e.target.value })} className="mt-1.5" />
                  </div>
                </div>
              )}

              {/* Step 4: Database */}
              {step === 4 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">{language === 'tr' ? 'Veritabanı Sağlayıcısı' : language === 'de' ? 'Datenbankanbieter' : 'Database Provider'}</Label>
                    <Select value={dbForm.provider} onValueChange={(v) => setDbForm({ ...dbForm, provider: v })}>
                      <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sqlite">SQLite (Önerilen / Empfohlen / Recommended)</SelectItem>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="mysql">MySQL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {dbForm.provider !== 'sqlite' && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-sm">{language === 'tr' ? 'Sunucu' : language === 'de' ? 'Host' : 'Host'}</Label>
                        <Input value={dbForm.host} onChange={(e) => setDbForm({ ...dbForm, host: e.target.value })} placeholder="localhost" className="mt-1.5" />
                      </div>
                      <div>
                        <Label className="text-sm">{language === 'tr' ? 'Port' : language === 'de' ? 'Port' : 'Port'}</Label>
                        <Input value={dbForm.port} onChange={(e) => setDbForm({ ...dbForm, port: e.target.value })} placeholder="5432" className="mt-1.5" />
                      </div>
                      <div>
                        <Label className="text-sm">{language === 'tr' ? 'Veritabanı Adı' : language === 'de' ? 'Datenbankname' : 'Database Name'}</Label>
                        <Input value={dbForm.name} onChange={(e) => setDbForm({ ...dbForm, name: e.target.value })} className="mt-1.5" />
                      </div>
                      <div>
                        <Label className="text-sm">{language === 'tr' ? 'Kullanıcı' : language === 'de' ? 'Benutzer' : 'User'}</Label>
                        <Input value={dbForm.user} onChange={(e) => setDbForm({ ...dbForm, user: e.target.value })} className="mt-1.5" />
                      </div>
                      <div className="sm:col-span-2">
                        <Label className="text-sm">{language === 'tr' ? 'Şifre' : language === 'de' ? 'Passwort' : 'Password'}</Label>
                        <Input type="password" value={dbForm.password} onChange={(e) => setDbForm({ ...dbForm, password: e.target.value })} className="mt-1.5" />
                      </div>
                    </div>
                  )}
                  {dbForm.provider === 'sqlite' && (
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-4">
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        ✓ {language === 'tr' ? 'SQLite seçildi - ek yapılandırma gerekmez' : language === 'de' ? 'SQLite ausgewählt - keine weitere Konfiguration erforderlich' : 'SQLite selected - no additional configuration required'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {language === 'tr' ? 'Veriler yerel dosyada saklanır. Kurulum içinideal.' : language === 'de' ? 'Daten werden lokal gespeichert. Ideal für die Installation.' : 'Data stored in local file. Ideal for setup.'}
                      </p>
                    </div>
                  )}
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-xs font-medium mb-2">{language === 'tr' ? 'Kurulum Komutları:' : language === 'de' ? 'Setup-Befehle:' : 'Setup Commands:'}</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-background px-2 py-1 text-xs font-mono">bun run db:push</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText('bun run db:push'); toast.success('Copied') }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded bg-background px-2 py-1 text-xs font-mono">bun run seed.ts</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText('bun run seed.ts'); toast.success('Copied') }}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Complete */}
              {step === 5 && (
                <div className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="inline-flex rounded-full bg-emerald-100 dark:bg-emerald-950/40 p-5 mb-4"
                  >
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">
                    {language === 'tr' ? 'Kurulum Tamamlandı!' : language === 'de' ? 'Installation abgeschlossen!' : 'Setup Complete!'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
                    {language === 'tr'
                      ? 'Okul yönetim sisteminiz hazır. Artık öğrencileri, öğretmenleri ve diğer verileri ekleyebilirsiniz.'
                      : language === 'de'
                      ? 'Ihr Schulverwaltungssystem ist bereit. Sie können nun Schüler, Lehrer und andere Daten hinzufügen.'
                      : 'Your school management system is ready. You can now add students, teachers, and other data.'}
                  </p>
                  <div className="grid gap-2 max-w-xs mx-auto">
                    <Button onClick={() => window.location.reload()}>
                      <Rocket className="h-4 w-4 mr-1" /> {language === 'tr' ? 'Sisteme Git' : language === 'de' ? 'Zum System' : 'Go to System'}
                    </Button>
                  </div>
                  <Badge className="mt-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                    <Gift className="h-3 w-3 mr-1" /> {t('footer.free_for_schools', language)}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-4">
        <Button variant="outline" onClick={prev} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> {language === 'tr' ? 'Geri' : language === 'de' ? 'Zurück' : 'Previous'}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={step === STEPS.length - 2 ? handleComplete : next}>
            {language === 'tr' ? 'İleri' : language === 'de' ? 'Weiter' : 'Next'} <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : null}
      </div>
    </div>
  )
}

function Gift(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 0 12 2.25m0 4.875v8.25m0 0H3m9 0h9" />
    </svg>
  )
}
