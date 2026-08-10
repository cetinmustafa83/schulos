'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { NAV_GROUPS } from '@/lib/nav'
import { useUI } from '@/store/ui'
import { GraduationCap, Users, BookOpen, DollarSign, Bell, Settings, BarChart3, Search, ArrowRight } from 'lucide-react'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const { setModule, role } = useUI()

  const toggleOpen = useCallback(() => setOpen((o) => !o), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggleOpen()
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggleOpen])

  const handleSelect = (key: string) => {
    setModule(key)
    setOpen(false)
  }

  const filteredGroups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.roles || i.roles.includes(role) || role === 'ADMIN'),
  })).filter((g) => g.items.length > 0)

  return (
    <>
      <button
        onClick={toggleOpen}
        className="hidden md:flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted transition-colors w-full max-w-md"
      >
        <Search className="h-4 w-4" />
        <span>Search students, staff, classes...</span>
        <kbd className="ml-auto inline-flex items-center gap-0.5 rounded border bg-background px-1.5 py-0.5 text-[10px] font-medium">
          ⌘ K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search modules..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {filteredGroups.map((group, gi) => (
            <div key={group.title}>
              <CommandGroup heading={group.title}>
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <CommandItem
                      key={item.key}
                      value={`${item.label} ${group.title} ${item.key}`}
                      onSelect={() => handleSelect(item.key)}
                      className="flex items-center gap-3"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{group.title}</span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
              {gi < filteredGroups.length - 1 && <CommandSeparator />}
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
