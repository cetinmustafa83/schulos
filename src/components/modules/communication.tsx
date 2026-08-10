'use client'

import { useState } from 'react'
import { useList, useCreate, useDelete } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NOTICE_CATEGORIES, formatDate, timeAgo } from '@/lib/constants'
import { Megaphone, CalendarDays, Plus, Bell, Calendar, Pin } from 'lucide-react'
import { toast } from 'sonner'

export function CommunicationModule() {
  const [tab, setTab] = useState('notices')
  return (
    <div>
      <PageHeader title="Communication" subtitle="Notices, events and announcements" />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="notices"><Megaphone className="h-4 w-4 mr-1 inline" />Notices</TabsTrigger>
          <TabsTrigger value="events"><CalendarDays className="h-4 w-4 mr-1 inline" />Events & Holidays</TabsTrigger>
        </TabsList>
        <TabsContent value="notices"><NoticesPanel /></TabsContent>
        <TabsContent value="events"><EventsPanel /></TabsContent>
      </Tabs>
    </div>
  )
}

function NoticesPanel() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ category: 'GENERAL', audience: 'ALL', status: 'ACTIVE' })
  const { data, isLoading, refetch } = useList<any>('notices')
  const createMut = useCreate('notices')

  const handleSubmit = async () => {
    if (!form.title || !form.content) {
      toast.error('Title and content are required')
      return
    }
    await createMut.mutateAsync({ ...form, publishDate: new Date() })
    setDialogOpen(false)
    setForm({ category: 'GENERAL', audience: 'ALL', status: 'ACTIVE' })
    refetch()
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Notice
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(data?.items || []).map((n: any) => {
          const cat = NOTICE_CATEGORIES.find((c) => c.value === n.category)
          return (
            <Card key={n.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cat?.color || 'bg-muted'}`}>
                    <Megaphone className="h-3 w-3" />
                    {cat?.label || n.category}
                  </div>
                  <Badge variant="outline" className="text-xs">{n.audience}</Badge>
                </div>
                <h3 className="text-base font-semibold mb-1">{n.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{n.content}</p>
                <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                  <span>{formatDate(n.publishDate)}</span>
                  <span>{timeAgo(n.publishDate)}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!isLoading && (data?.items || []).length === 0 && (
        <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">No notices yet</CardContent></Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Notice</DialogTitle>
            <DialogDescription className="sr-only">Publish a new notice or announcement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">Title</Label>
              <Input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm">Content</Label>
              <Textarea value={form.content || ''} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={4} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {NOTICE_CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Audience</Label>
                <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="STUDENTS">Students</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="PARENTS">Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending}>Publish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EventsPanel() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ type: 'EVENT' })
  const { data, isLoading, refetch } = useList<any>('events')
  const createMut = useCreate('events')

  const handleSubmit = async () => {
    if (!form.title || !form.startDate) {
      toast.error('Title and start date are required')
      return
    }
    await createMut.mutateAsync({
      ...form,
      startDate: new Date(form.startDate),
      endDate: form.endDate ? new Date(form.endDate) : null,
    })
    setDialogOpen(false)
    setForm({ type: 'EVENT' })
    refetch()
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Event
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data?.items || []).map((e: any) => (
          <Card key={e.id} className="overflow-hidden">
            <div className={`h-2 ${e.type === 'HOLIDAY' ? 'bg-amber-500' : 'bg-violet-500'}`} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className={`rounded-lg p-2 ${e.type === 'HOLIDAY' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' : 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400'}`}>
                  {e.type === 'HOLIDAY' ? <Calendar className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                </div>
                <Badge variant="outline">{e.type}</Badge>
              </div>
              <h3 className="font-semibold">{e.title}</h3>
              {e.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{e.description}</p>}
              {e.location && <p className="text-xs text-muted-foreground mt-2">📍 {e.location}</p>}
              <div className="mt-3 text-xs text-muted-foreground">
                {formatDate(e.startDate)}{e.endDate ? ` - ${formatDate(e.endDate)}` : ''}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && (data?.items || []).length === 0 && (
        <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">No events yet</CardContent></Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription className="sr-only">Create a new event or holiday</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">Title</Label>
              <Input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm">Description</Label>
              <Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Start Date</Label>
                <Input type="date" value={form.startDate || ''} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">End Date</Label>
                <Input type="date" value={form.endDate || ''} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label className="text-sm">Location</Label>
              <Input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EVENT">Event</SelectItem>
                  <SelectItem value="HOLIDAY">Holiday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
