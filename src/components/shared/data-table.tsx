'use client'

import { useState, useMemo } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from './states'
import { Button } from '@/components/ui/button'
import { Inbox, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Rows3, Rows4 } from 'lucide-react'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

export interface Column<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  onRowClick?: (row: T) => void
  getKey?: (row: T) => string
  pageSize?: number
  showPagination?: boolean
  total?: number
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  emptyTitle = 'No records found',
  emptyDescription = 'Try adjusting your search or filters',
  onRowClick,
  getKey,
  pageSize = 10,
  showPagination = true,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1)
  const [compact, setCompact] = useState(false)

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const paged = useMemo(() => data.slice(start, start + pageSize), [data, start, pageSize])

  // reset to page 1 when data shrinks
  if (page > totalPages) setPage(1)

  if (loading) {
    return (
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              {columns.map((c) => (
                <TableHead key={c.key} className={c.headerClassName}>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((c) => (
                  <TableCell key={c.key}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className="rounded-lg border">
        <EmptyState icon={Inbox} title={emptyTitle} description={emptyDescription} />
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40 border-b">
              {columns.map((c) => (
                <TableHead key={c.key} className={cn('font-semibold', c.headerClassName)}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {paged.map((row, idx) => (
                <TableRow
                  key={getKey ? getKey(row) : row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    'group transition-colors',
                    onRowClick ? 'cursor-pointer hover:bg-primary/5' : '',
                    idx % 2 === 1 ? 'bg-muted/20' : ''
                  )}
                >
                  {columns.map((c) => (
                    <TableCell key={c.key} className={cn(compact && 'py-2', c.className)}>
                      {c.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>
              Showing <span className="font-medium text-foreground">{start + 1}</span>–
              <span className="font-medium text-foreground">{Math.min(start + pageSize, data.length)}</span> of{' '}
              <span className="font-medium text-foreground">{data.length}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setCompact((c) => !c)}
              title="Toggle row density"
            >
              {compact ? <Rows4 className="h-3.5 w-3.5" /> : <Rows3 className="h-3.5 w-3.5" />}
              {compact ? 'Comfortable' : 'Compact'}
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <div className="flex items-center gap-1 px-2 text-xs">
              <span>Page</span>
              <span className="rounded border bg-background px-2 py-0.5 font-medium">{currentPage}</span>
              <span className="text-muted-foreground">of {totalPages}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => setPage(totalPages)}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
