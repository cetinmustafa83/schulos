'use client'

import { useState } from 'react'
import { NAV_GROUPS } from '@/lib/nav'
import { useUI } from '@/store/ui'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, GraduationCap, Sparkles, ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings } from '@/hooks/use-data'
import { Badge } from '@/components/ui/badge'

export function Sidebar() {
  const { activeModule, setModule, sidebarOpen, setSidebarOpen, role } = useUI()
  const { data: settings } = useSettings()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const filteredGroups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.roles || i.roles.includes(role) || role === 'ADMIN'),
  })).filter((g) => g.items.length > 0)

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed lg:sticky top-0 z-50 lg:z-30 h-screen w-72 shrink-0 border-r bg-card transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo / Brand */}
          <div className="flex items-center justify-between gap-3 border-b px-5 h-16 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-sm shrink-0">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">
                  {settings?.school_name || 'School MS'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  AY {settings?.academic_year || '2024-2025'}
                </p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {filteredGroups.map((group) => {
                const isCollapsed = collapsedGroups.has(group.title)
                const hasActive = group.items.some((i) => i.key === activeModule)
                return (
                  <div key={group.title}>
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {group.title}
                      </span>
                      {hasActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                    </button>
                    <AnimatePresence initial={false}>
                      {!isCollapsed && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-0.5 mt-1">
                            {group.items.map((item) => {
                              const Icon = item.icon
                              const isActive = activeModule === item.key
                              return (
                                <button
                                  key={item.key}
                                  onClick={() => setModule(item.key)}
                                  className={cn(
                                    'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                                    isActive
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                  )}
                                >
                                  {isActive && (
                                    <motion.span
                                      layoutId="activeIndicator"
                                      className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary"
                                    />
                                  )}
                                  <Icon className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                                  <span className="truncate flex-1 text-left">{item.label}</span>
                                  {item.badge && (
                                    <Badge variant="secondary" className="h-5 px-1.5 text-xs">{item.badge}</Badge>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </nav>

            {/* Promo card */}
            <div className="mt-6 mx-1 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <p className="text-sm font-semibold">Pro Tip</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Press <kbd className="rounded border bg-background px-1 py-0.5 text-[10px] font-mono">Ctrl+K</kbd> to quickly navigate between modules.
              </p>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t px-5 py-3 shrink-0">
            <p className="text-xs text-muted-foreground text-center">© 2025 School Management System</p>
          </div>
        </div>
      </aside>
    </>
  )
}
