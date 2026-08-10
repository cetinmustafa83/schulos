'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function EmptyState({ icon: Icon, title, description, action, className }: {
  icon: any
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('flex flex-col items-center justify-center py-16 text-center', className)}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-primary/5 blur-xl scale-150" />
        <div className="relative rounded-2xl bg-gradient-to-br from-muted to-muted/50 p-5 ring-1 ring-border">
          <Icon className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
        </div>
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}

export function LoadingState({ message = 'Loading...', className }: { message?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-16', className)}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <div className="absolute inset-0 rounded-full border-2 border-muted" />
          <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-rose-500/10 blur-xl scale-150" />
        <div className="relative rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/50 dark:to-rose-900/30 p-5 ring-1 ring-rose-200 dark:ring-rose-900">
          <svg className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.7-3L13 5a2 2 0 00-3.4 0L4 16a2 2 0 001.7 3z" />
          </svg>
        </div>
      </div>
      <h3 className="text-base font-semibold">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-sm leading-relaxed">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-5">
          Try again
        </Button>
      )}
    </motion.div>
  )
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border p-5 space-y-3', className)}>
      <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
      <div className="h-8 w-2/3 bg-muted animate-pulse rounded" />
      <div className="h-3 w-1/2 bg-muted/70 animate-pulse rounded" />
    </div>
  )
}
