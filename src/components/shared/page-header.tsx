'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, Filter, Download } from 'lucide-react'
import { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  search?: string
  onSearch?: (v: string) => void
  onAdd?: () => void
  addLabel?: string
  extra?: ReactNode
  showFilter?: boolean
  showExport?: boolean
}

export function PageHeader({ title, subtitle, search, onSearch, onAdd, addLabel = 'Add New', extra, showFilter, showExport }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search || ''}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
        )}
        {showFilter && (
          <Button variant="outline" size="icon" title="Filter">
            <Filter className="h-4 w-4" />
          </Button>
        )}
        {showExport && (
          <Button variant="outline" size="icon" title="Export">
            <Download className="h-4 w-4" />
          </Button>
        )}
        {extra}
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" />
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
