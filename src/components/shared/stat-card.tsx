'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: { value: number; label: string }
  color?: 'emerald' | 'rose' | 'amber' | 'sky' | 'violet' | 'teal' | 'orange' | 'zinc'
  subtitle?: string
}

const COLOR_MAP: Record<string, { bg: string; text: string; ring: string }> = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/50', text: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-900/50' },
  rose: { bg: 'bg-rose-50 dark:bg-rose-950/50', text: 'text-rose-600 dark:text-rose-400', ring: 'ring-rose-100 dark:ring-rose-900/50' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-100 dark:ring-amber-900/50' },
  sky: { bg: 'bg-sky-50 dark:bg-sky-950/50', text: 'text-sky-600 dark:text-sky-400', ring: 'ring-sky-100 dark:ring-sky-900/50' },
  violet: { bg: 'bg-violet-50 dark:bg-violet-950/50', text: 'text-violet-600 dark:text-violet-400', ring: 'ring-violet-100 dark:ring-violet-900/50' },
  teal: { bg: 'bg-teal-50 dark:bg-teal-950/50', text: 'text-teal-600 dark:text-teal-400', ring: 'ring-teal-100 dark:ring-teal-900/50' },
  orange: { bg: 'bg-orange-50 dark:bg-orange-950/50', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-100 dark:ring-orange-900/50' },
  zinc: { bg: 'bg-zinc-50 dark:bg-zinc-900/50', text: 'text-zinc-600 dark:text-zinc-400', ring: 'ring-zinc-100 dark:ring-zinc-900/50' },
}

export function StatCard({ title, value, icon: Icon, trend, color = 'sky', subtitle }: StatCardProps) {
  const c = COLOR_MAP[color] || COLOR_MAP.sky
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
              <p className="text-2xl font-bold mt-1 tracking-tight">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
              {trend && (
                <div className="flex items-center gap-1 mt-2">
                  <span className={cn('text-xs font-medium', trend.value >= 0 ? 'text-emerald-600' : 'text-rose-600')}>
                    {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
                  </span>
                  <span className="text-xs text-muted-foreground">{trend.label}</span>
                </div>
              )}
            </div>
            <div className={cn('rounded-xl p-2.5 ring-1 shrink-0', c.bg, c.ring)}>
              <Icon className={cn('h-5 w-5', c.text)} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
