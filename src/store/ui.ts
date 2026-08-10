'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Language } from '@/lib/i18n'

interface UIState {
  activeModule: string
  activeSubModule: string
  sidebarOpen: boolean
  role: string
  searchQuery: string
  language: Language
  setModule: (m: string, sub?: string) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setRole: (role: string) => void
  setSearch: (q: string) => void
  setLanguage: (lang: Language) => void
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      activeModule: 'dashboard',
      activeSubModule: '',
      sidebarOpen: false,
      role: 'ADMIN',
      searchQuery: '',
      language: 'tr',
      setModule: (m, sub = '') => set({ activeModule: m, activeSubModule: sub, sidebarOpen: false }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setRole: (role) => set({ role }),
      setSearch: (q) => set({ searchQuery: q }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    { name: 'sms-ui' }
  )
)
