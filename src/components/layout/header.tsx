'use client'

import { useUI } from '@/store/ui'
import { useSettings } from '@/hooks/use-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Menu, Bell, Sun, Moon, ChevronDown, Globe } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useState } from 'react'
import { ROLE_LABELS, ROLE_BADGE_COLORS, initials, getAvatarColor } from '@/lib/constants'
import { LANGUAGES } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { CommandPalette } from './command-palette'

const ROLES = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'ACCOUNTANT', 'LIBRARIAN']

export function Header() {
  const { role, setRole, toggleSidebar, setModule, language, setLanguage } = useUI()
  const { theme, setTheme } = useTheme()
  const { data: settings } = useSettings()
  const [notifOpen, setNotifOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-full items-center gap-2 px-4 lg:px-6">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>

        {/* Command palette / search */}
        <CommandPalette />

        <div className="flex-1 md:hidden" />

        {/* Quick stats pill - hidden on mobile */}
        <div className="hidden xl:flex items-center gap-1.5 rounded-lg bg-muted/40 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">System online</span>
        </div>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} suppressHydrationWarning>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Language switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline text-xs font-medium">{LANGUAGES.find(l => l.code === language)?.flag}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{language === 'tr' ? 'Dil Seçin' : language === 'de' ? 'Sprache wählen' : 'Select Language'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {LANGUAGES.map((l) => (
              <DropdownMenuItem
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={cn('flex items-center justify-between gap-2', language === l.code && 'bg-muted')}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{l.flag}</span>
                  {l.label}
                </span>
                {language === l.code && <span className="text-xs text-primary">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span>
              <Badge variant="secondary" className="text-xs">3 new</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <div className="flex w-full items-start gap-2">
                <div className="rounded-full bg-rose-100 dark:bg-rose-900/40 p-1.5">
                  <Bell className="h-3 w-3 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">New admission query</p>
                  <p className="text-xs text-muted-foreground truncate">A new parent has submitted an admission enquiry</p>
                  <p className="text-xs text-muted-foreground mt-0.5">2 minutes ago</p>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <div className="flex w-full items-start gap-2">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900/40 p-1.5">
                  <Bell className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Pending leave approval</p>
                  <p className="text-xs text-muted-foreground truncate">2 leave requests are waiting for approval</p>
                  <p className="text-xs text-muted-foreground mt-0.5">1 hour ago</p>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
              <div className="flex w-full items-start gap-2">
                <div className="rounded-full bg-sky-100 dark:bg-sky-900/40 p-1.5">
                  <Bell className="h-3 w-3 text-sky-600 dark:text-sky-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Fees payment received</p>
                  <p className="text-xs text-muted-foreground truncate">A fees payment of ₺15,000 was received</p>
                  <p className="text-xs text-muted-foreground mt-0.5">3 hours ago</p>
                </div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center text-sm text-primary cursor-pointer" onClick={() => setModule('communication')}>
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Role switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-9 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className={cn('text-xs text-white', getAvatarColor(role + 'user'))}>
                  {initials(ROLE_LABELS[role] || 'Admin')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-xs font-medium">{ROLE_LABELS[role]}</span>
                <span className="text-[10px] text-muted-foreground">Switch role</span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Switch Role Panel</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {ROLES.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => setRole(r)}
                className={cn('flex items-center justify-between gap-2', role === r && 'bg-muted')}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('h-2 w-2 rounded-full', ROLE_BADGE_COLORS[r]?.split(' ')[0].replace('bg-', 'bg-') || 'bg-zinc-400')} />
                  {ROLE_LABELS[r]}
                </div>
                {role === r && <span className="text-xs text-primary">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
