'use client'

import { useState, useMemo } from 'react'
import { useList, useDelete } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { useCreate, useUpdate } from '@/hooks/use-data'
import { formatDate, formatCurrency } from '@/lib/constants'
import { Pencil, Trash2 } from 'lucide-react'
import { ReactNode } from 'react'

export interface FieldDef {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'email' | 'tel'
  options?: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  default?: any
  fullWidth?: boolean
}

interface ResourceModuleProps<T = any> {
  resourceKey: string
  title: string
  subtitle: string
  columns: Column<T>[]
  fields: FieldDef[]
  addLabel?: string
  searchFields?: string[]
  emptyTitle?: string
  emptyDescription?: string
  onRowClick?: (row: T) => void
  extraHeader?: ReactNode
}

export function ResourceModule<T extends Record<string, any>>({
  resourceKey,
  title,
  subtitle,
  columns,
  fields,
  addLabel = 'Add New',
  searchFields = [],
  emptyTitle,
  emptyDescription,
  onRowClick,
  extraHeader,
}: ResourceModuleProps<T>) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})

  // debounce search
  useMemo(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const params: Record<string, string> = {}
  if (debouncedSearch) params.search = debouncedSearch

  const { data, isLoading, refetch } = useList<T>(resourceKey, params)
  const createMut = useCreate(resourceKey)
  const updateMut = useUpdate(resourceKey)
  const deleteMut = useDelete(resourceKey)

  const handleAdd = () => {
    const defaults: Record<string, any> = {}
    for (const f of fields) if (f.default !== undefined) defaults[f.name] = f.default
    setForm(defaults)
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (row: T) => {
    const data: Record<string, any> = {}
    for (const f of fields) {
      const v = row[f.name]
      if (v instanceof Date) data[f.name] = v.toISOString().slice(0, 10)
      else if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) data[f.name] = v.slice(0, 10)
      else data[f.name] = v ?? ''
    }
    setForm(data)
    setEditing(row)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    const payload: Record<string, any> = {}
    for (const f of fields) {
      const v = form[f.name]
      if (v === '' || v === null || v === undefined) {
        // skip empty optional, set null for date
        if (f.type === 'date') payload[f.name] = null
        continue
      }
      if (f.type === 'date') payload[f.name] = new Date(v)
      else if (f.type === 'number') payload[f.name] = Number(v)
      else payload[f.name] = v
    }
    if (editing) {
      await updateMut.mutateAsync({ id: (editing as any).id, data: payload })
    } else {
      await createMut.mutateAsync(payload)
    }
    setDialogOpen(false)
    refetch()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMut.mutateAsync(deleteId)
    setDeleteId(null)
    refetch()
  }

  // Build columns with actions
  const allColumns: Column<T>[] = [
    ...columns,
    {
      key: '_actions',
      header: '',
      className: 'text-right',
      headerClassName: 'w-[100px]',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEdit(row) }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600" onClick={(e) => { e.stopPropagation(); setDeleteId(row.id) }}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={subtitle}
        search={search}
        onSearch={setSearch}
        onAdd={handleAdd}
        addLabel={addLabel}
        extra={extraHeader}
      />
      <DataTable
        columns={allColumns}
        data={data?.items || []}
        loading={isLoading}
        onRowClick={onRowClick}
        getKey={(row) => row.id}
        emptyTitle={emptyTitle || `No ${title.toLowerCase()} found`}
        emptyDescription={emptyDescription || 'Add a new record to get started'}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? `Edit ${title}` : `Add ${title}`}</DialogTitle>
            <DialogDescription className="sr-only">
              {editing ? `Edit the existing ${title.toLowerCase()} record` : `Create a new ${title.toLowerCase()} record`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.name} className={f.fullWidth ? 'sm:col-span-2' : ''}>
                <Label htmlFor={f.name} className="text-sm">
                  {f.label}{f.required && <span className="text-rose-500 ml-0.5">*</span>}
                </Label>
                {f.type === 'textarea' ? (
                  <Textarea
                    id={f.name}
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    placeholder={f.placeholder}
                    rows={3}
                    className="mt-1.5"
                  />
                ) : f.type === 'select' ? (
                  <Select value={form[f.name] || ''} onValueChange={(v) => setForm({ ...form, [f.name]: v })}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder={f.placeholder || 'Select...'} />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={f.name}
                    type={f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    placeholder={f.placeholder}
                    className="mt-1.5"
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-500 hover:bg-rose-600">
              {deleteMut.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Helper to create common column types
export const col = {
  avatar: (nameKey: string = 'name', subKey?: string): Column<any> => ({
    key: nameKey,
    header: 'Name',
    cell: (row) => {
      const name = typeof row[nameKey] === 'string' ? row[nameKey] : `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.name || row.title
      const sub = subKey ? row[subKey] : undefined
      return (
        <div className="flex items-center gap-3">
          <UserAvatar name={name} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
          </div>
        </div>
      )
    },
  }),
  text: (key: string, header: string, formatter?: (v: any, row: any) => ReactNode): Column<any> => ({
    key,
    header,
    cell: (row) => formatter ? formatter(row[key], row) : <span className="text-sm">{row[key] || '-'}</span>,
  }),
  badge: (key: string, header: string): Column<any> => ({
    key,
    header,
    cell: (row) => row[key] ? <StatusBadge status={row[key]} /> : <span className="text-muted-foreground text-sm">-</span>,
  }),
  date: (key: string, header: string): Column<any> => ({
    key,
    header,
    cell: (row) => <span className="text-sm text-muted-foreground">{formatDate(row[key])}</span>,
  }),
  currency: (key: string, header: string): Column<any> => ({
    key,
    header,
    cell: (row) => <span className="text-sm font-medium">{formatCurrency(row[key] || 0)}</span>,
  }),
}
