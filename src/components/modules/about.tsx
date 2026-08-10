'use client'

import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, Github, BookOpen, Users, Globe, Shield, Gift, Code2, Star, Download, Server, Database } from 'lucide-react'
import { useUI } from '@/store/ui'
import { t } from '@/lib/i18n'
import { motion } from 'framer-motion'

export function AboutModule() {
  const { language } = useUI()

  return (
    <div>
      <PageHeader
        title={t('about.title', language)}
        subtitle="Free & Open Source School Management System"
      />

      {/* Hero - Mission Statement */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary via-primary to-primary/70 text-primary-foreground mb-6">
          <CardContent className="p-8 lg:p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-2xl bg-white/10 backdrop-blur p-4 ring-1 ring-white/20">
                <Gift className="h-10 w-10" />
              </div>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-3">
              {language === 'tr' && 'Bu Yazılım Tüm Okullara Ücretsizdir'}
              {language === 'de' && 'Diese Software ist für alle Schulen kostenlos'}
              {language === 'en' && 'This Software is Free for All Schools'}
            </h2>
            <p className="text-base lg:text-lg opacity-90 max-w-2xl mx-auto leading-relaxed">
              {t('about.mission', language)}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">
                <Heart className="h-3 w-3 mr-1 fill-current" /> {t('about.free_forever', language)}
              </Badge>
              <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">
                <Code2 className="h-3 w-3 mr-1" /> {t('about.open_source', language)}
              </Badge>
              <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">
                <Users className="h-3 w-3 mr-1" /> {t('about.community', language)}
              </Badge>
              <Badge className="bg-white/20 text-white border-0 text-sm px-3 py-1">
                AGPL v3
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Core Values */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {[
          {
            icon: Gift,
            title: language === 'tr' ? 'Sonsuza Dek Ücretsiz' : language === 'de' ? 'Für immer kostenlos' : 'Free Forever',
            desc: language === 'tr' ? 'Hiçbir lisans ücreti yok. Hiçbir gizli maliyet yok. Okul yönetimi için tüm özellikler ücretsiz.'
              : language === 'de' ? 'Keine Lizenzgebühren. Keine versteckten Kosten. Alle Funktionen für die Schulverwaltung sind kostenlos.'
              : 'No license fees. No hidden costs. All features for school management are free.',
            color: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
          },
          {
            icon: Code2,
            title: language === 'tr' ? 'Açık Kaynak (AGPL v3)' : language === 'de' ? 'Open Source (AGPL v3)' : 'Open Source (AGPL v3)',
            desc: language === 'tr' ? 'Kaynak kodu tamamen açık. AGPL v3 lisansı, türev çalışmaların da açık kaynak olmasını sağlar.'
              : language === 'de' ? 'Der Quellcode ist vollständig offen. Die AGPL v3-Lizenz stellt sicher, dass abgeleitete Werke ebenfalls quelloffen sind.'
              : 'Source code is fully open. AGPL v3 license ensures derivatives remain open source.',
            color: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
          },
          {
            icon: Users,
            title: language === 'tr' ? 'Topluluk Odaklı' : language === 'de' ? 'Gemeinschaftsgetrieben' : 'Community Driven',
            desc: language === 'tr' ? 'Gönüllü geliştiriciler tarafından oluşturuldu. Katkıda bulunmak için GitHub\'a katılın.'
              : language === 'de' ? 'Von ehrenamtlichen Entwicklern erstellt. Treten Sie GitHub bei, um beizutragen.'
              : 'Built by volunteer developers. Join us on GitHub to contribute.',
            color: 'bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400',
          },
          {
            icon: Shield,
            title: language === 'tr' ? 'DSGVO/GDPR Uyumlu' : language === 'de' ? 'DSGVO-konform' : 'GDPR Compliant',
            desc: language === 'tr' ? 'EU ve Alman veri koruma yasalarına tam uyum. Öğrenci verileri güvende.'
              : language === 'de' ? 'Volle Einhaltung der EU- und deutschen Datenschutzgesetze. Schülerdaten sind geschützt.'
              : 'Full compliance with EU and German data protection laws. Student data is secure.',
            color: 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
          },
          {
            icon: Globe,
            title: language === 'tr' ? 'Çoklu Dil' : language === 'de' ? 'Mehrsprachig' : 'Multi-Language',
            desc: language === 'tr' ? 'Türkçe, Almanca ve İngilizce desteklenir. Kolayca yeni dil eklenebilir.'
              : language === 'de' ? 'Türkisch, Deutsch und Englisch werden unterstützt. Neue Sprachen können leicht hinzugefügt werden.'
              : 'Turkish, German, and English supported. New languages can be easily added.',
            color: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
          },
          {
            icon: Server,
            title: language === 'tr' ? 'Self-Hosted' : language === 'de' ? 'Selbstgehostet' : 'Self-Hosted',
            desc: language === 'tr' ? 'Okul kendi sunucusunda barındırır. Veriler tam kontrol altında.'
              : language === 'de' ? 'Die Schule hostet auf eigenem Server. Volle Datenkontrolle.'
              : 'School hosts on own server. Full data control.',
            color: 'bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400',
          },
        ].map((v, i) => {
          const Icon = v.icon
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className={`inline-flex rounded-xl p-3 mb-3 ${v.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{v.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            {language === 'tr' ? 'Proje İstatistikleri' : language === 'de' ? 'Projektstatistiken' : 'Project Statistics'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: language === 'tr' ? 'Modül' : language === 'de' ? 'Module' : 'Modules', value: '38+', icon: BookOpen, color: 'text-sky-600' },
              { label: language === 'tr' ? 'Veritabanı Modeli' : language === 'de' ? 'Datenbankmodelle' : 'DB Models', value: '45+', icon: Database, color: 'text-violet-600' },
              { label: language === 'tr' ? 'API Uç Noktası' : language === 'de' ? 'API-Endpunkte' : 'API Endpoints', value: '43+', icon: Code2, color: 'text-emerald-600' },
              { label: language === 'tr' ? 'Dil Desteği' : language === 'de' ? 'Sprachunterstützung' : 'Languages', value: '3', icon: Globe, color: 'text-amber-600' },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="text-center rounded-lg border p-4">
                  <Icon className={`h-6 w-6 mx-auto mb-2 ${s.color}`} />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start / Installation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            {language === 'tr' ? 'Hızlı Başlangıç' : language === 'de' ? 'Schnellstart' : 'Quick Start'}
          </CardTitle>
          <CardDescription>
            {language === 'tr' ? 'Okulunuz için kurulum adımları' : language === 'de' ? 'Installationsschritte für Ihre Schule' : 'Setup steps for your school'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                step: '1',
                title: language === 'tr' ? 'İndirin' : language === 'de' ? 'Herunterladen' : 'Download',
                cmd: 'git clone https://github.com/your-org/school-management-system.git',
                desc: language === 'tr' ? 'Projeyi GitHub\'tan klonlayın' : language === 'de' ? 'Projekt von GitHub klonen' : 'Clone the project from GitHub',
              },
              {
                step: '2',
                title: language === 'tr' ? 'Bağımlılıkları Yükleyin' : language === 'de' ? 'Abhängigkeiten installieren' : 'Install Dependencies',
                cmd: 'bun install',
                desc: language === 'tr' ? 'Tüm paketleri yükleyin' : language === 'de' ? 'Alle Pakete installieren' : 'Install all packages',
              },
              {
                step: '3',
                title: language === 'tr' ? 'Veritabanını Hazırlayın' : language === 'de' ? 'Datenbank einrichten' : 'Setup Database',
                cmd: 'bun run db:push && bun run seed.ts',
                desc: language === 'tr' ? 'Veritabanı şemasını ve örnek verileri oluşturun' : language === 'de' ? 'Datenbankschema und Beispieldaten erstellen' : 'Create database schema and seed data',
              },
              {
                step: '4',
                title: language === 'tr' ? 'Başlatın' : language === 'de' ? 'Starten' : 'Start',
                cmd: 'bun run dev',
                desc: language === 'tr' ? 'Geliştirme sunucusunu başlatın' : language === 'de' ? 'Entwicklungsserver starten' : 'Start the development server',
              },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                  {s.step}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{s.title}</p>
                  <code className="block mt-1 rounded bg-muted px-2 py-1 text-xs font-mono">{s.cmd}</code>
                  <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            {language === 'tr' ? 'Teknoloji Yığını' : language === 'de' ? 'Technologie-Stack' : 'Technology Stack'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Next.js 16', 'TypeScript 5', 'Tailwind CSS 4', 'shadcn/ui', 'Prisma ORM', 'SQLite', 'Recharts', 'Zustand', 'TanStack Query', 'Framer Motion', 'Lucide React', 'Sonner'].map((tech, i) => (
              <Badge key={i} variant="outline" className="text-sm py-1.5 px-3">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contribute */}
      <Card className="mb-6 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-rose-500" />
            {language === 'tr' ? 'Katkıda Bulunun' : language === 'de' ? 'Mitwirken' : 'Contribute'}
          </CardTitle>
          <CardDescription>
            {language === 'tr'
              ? 'Bu proje gönüllüler tarafından geliştirilmektedir. Katkılarınızı bekliyoruz!'
              : language === 'de'
              ? 'Dieses Projekt wird von Freiwilligen entwickelt. Wir freuen uns auf Ihren Beitrag!'
              : 'This project is developed by volunteers. We welcome your contributions!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-semibold mb-1">
                {language === 'tr' ? 'Kod Katkısı' : language === 'de' ? 'Code-Beitrag' : 'Code Contribution'}
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                {language === 'tr'
                  ? 'Yeni özellikler ekleyin, hataları düzeltin, kodu iyileştirin'
                  : language === 'de'
                  ? 'Neue Funktionen hinzufügen, Fehler beheben, Code verbessern'
                  : 'Add new features, fix bugs, improve code'}
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Github className="h-4 w-4 mr-1" /> GitHub
              </Button>
            </div>
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-semibold mb-1">
                {language === 'tr' ? 'Çeviri Katkısı' : language === 'de' ? 'Übersetzungsbeitrag' : 'Translation Contribution'}
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                {language === 'tr'
                  ? 'Yeni diller ekleyin, mevcut çevirileri iyileştirin'
                  : language === 'de'
                  ? 'Neue Sprachen hinzufügen, bestehende Übersetzungen verbessern'
                  : 'Add new languages, improve existing translations'}
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Globe className="h-4 w-4 mr-1" /> i18n
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* License */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="inline-flex rounded-xl bg-muted p-3 mb-3">
            <Shield className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold">
            {language === 'tr' ? 'GNU Affero General Public License v3.0' : 'GNU Affero General Public License v3.0'}
          </h3>
          <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
            {language === 'tr'
              ? 'Bu yazılım AGPL v3 lisansı altında dağıtılmaktadır. Türev çalışmalar da aynı lisans altında açık kaynak olmak zorundadır.'
              : language === 'de'
              ? 'Diese Software wird unter der AGPL v3-Lizenz vertrieben. Abgeleitete Werke müssen unter derselben Lizenz quelloffen sein.'
              : 'This software is distributed under the AGPL v3 license. Derivative works must be open source under the same license.'}
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            © {new Date().getFullYear()} School Management System · {t('footer.free_for_schools', language)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
