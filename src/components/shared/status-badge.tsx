'use client'

import { cn } from '@/lib/utils'
import { STATUS_BADGE_COLORS } from '@/lib/constants'

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const color = STATUS_BADGE_COLORS[status] || STATUS_BADGE_COLORS['DRAFT']
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', color, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status.replace(/_/g, ' ')}
    </span>
  )
}
