'use client'

import { useUI } from '@/store/ui'
import { useSettings } from '@/hooks/use-data'
import { Heart, Gift, Github } from 'lucide-react'
import { t } from '@/lib/i18n'
import { Badge } from '@/components/ui/badge'

export function Footer() {
  const { role, language } = useUI()
  const { data: settings } = useSettings()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t bg-card/40">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 flex-wrap">
          <span>© {year} {settings?.school_name || 'School Management System'}.</span>
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0">
            <Gift className="h-3 w-3 mr-1" />
            {t('footer.free_for_schools', language)}
          </Badge>
          <Badge variant="outline" className="text-[10px]">
            {t('footer.open_source', language)}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span>v2.4.1</span>
          </span>
          <span className="hidden sm:inline">Panel: <span className="font-medium text-foreground">{role}</span></span>
          <span className="flex items-center gap-1">
            {language === 'tr' ? 'Gönüllüler tarafından' : language === 'de' ? 'Gemacht von' : 'Made by'} <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> {language === 'tr' ? 'eğitimciler için' : language === 'de' ? 'für Pädagogen' : 'for educators'}
          </span>
          <a href="#" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Github className="h-3 w-3" /> GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
