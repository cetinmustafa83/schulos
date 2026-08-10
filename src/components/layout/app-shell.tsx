'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'
import { Footer } from './footer'
import { CookieConsentBanner } from './cookie-consent'
import { MODULE_TITLES } from '@/lib/nav'
import { useUI } from '@/store/ui'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { ReactNode } from 'react'
import { Home } from 'lucide-react'

export function AppShell({ children }: { children: ReactNode }) {
  const { activeModule } = useUI()
  const meta = MODULE_TITLES[activeModule]

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 px-4 lg:px-6 py-6 max-w-[1600px] w-full mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="flex items-center gap-1">
                  <Home className="h-3 w-3" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">{meta?.title || 'Dashboard'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          {children}
        </main>
        <Footer />
      </div>
      {/* Cookie Consent Banner (GDPR/DSGVO compliance) */}
      <CookieConsentBanner />
    </div>
  )
}
