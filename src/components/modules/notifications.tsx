'use client'

import { useState, useMemo } from 'react'
import { useList, useDashboard } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatCard } from '@/components/shared/stat-card'
import { Bell, CheckCheck, Trash2, AlertCircle, Calendar, DollarSign, Users, FileText, Megaphone, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { timeAgo, formatDate } from '@/lib/constants'
import { toast } from 'sonner'

interface NotificationItem {
  id: string
  title: string
  description: string
  type: string // ADMISSION, FEES, LEAVE, EVENT, EXAM, NOTICE, ATTENDANCE
  time: string
  read: boolean
  action?: string
}

const ICON_MAP: Record<string, any> = {
  ADMISSION: Users,
  FEES: DollarSign,
  LEAVE: Calendar,
  EVENT: Calendar,
  EXAM: FileText,
  NOTICE: Megaphone,
  ATTENDANCE: Users,
  URGENT: AlertCircle,
}

const COLOR_MAP: Record<string, string> = {
  ADMISSION: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
  FEES: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  LEAVE: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  EVENT: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
  EXAM: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
  NOTICE: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
  ATTENDANCE: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400',
  URGENT: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
}

export function NotificationsModule() {
  const [filter, setFilter] = useState('all')
  const [items, setItems] = useState<NotificationItem[]>([
    { id: '1', title: 'New Admission Query', description: 'A parent has submitted an admission enquiry for Class 8-A', type: 'ADMISSION', time: '2m', read: false, action: 'Review' },
    { id: '2', title: 'Fees Payment Received', description: 'A fees payment of ₺15,000 was received via bank transfer', type: 'FEES', time: '15m', read: false, action: 'View' },
    { id: '3', title: 'Pending Leave Approval', description: '2 leave requests are waiting for your approval', type: 'LEAVE', time: '1h', read: false, action: 'Approve' },
    { id: '4', title: 'Parent-Teacher Meeting', description: 'PTM scheduled for Saturday from 9 AM to 1 PM', type: 'EVENT', time: '3h', read: false, action: 'View' },
    { id: '5', title: 'Exam Schedule Published', description: 'Half-yearly examination schedule has been published', type: 'EXAM', time: '5h', read: true, action: 'View' },
    { id: '6', title: 'Library Books Overdue', description: '8 students have overdue library books', type: 'NOTICE', time: '8h', read: true, action: 'View' },
    { id: '7', title: 'Staff Meeting', description: 'Monthly staff meeting on Friday at 3 PM in conference hall', type: 'NOTICE', time: '1d', read: true, action: 'View' },
    { id: '8', title: 'Admissions Open 2025-26', description: 'Admissions are now open for academic year 2025-2026', type: 'ADMISSION', time: '2d', read: true, action: 'View' },
    { id: '9', title: 'Transport Fee Due', description: 'Transport fee for this month is due in 3 days', type: 'FEES', time: '2d', read: true, action: 'View' },
    { id: '10', title: 'Attendance Below 75%', description: '5 students have attendance below 75% this month', type: 'ATTENDANCE', time: '3d', read: true, action: 'Review' },
    { id: '11', title: 'Republic Day Holiday', description: 'School will remain closed on October 29 for Republic Day', type: 'EVENT', time: '4d', read: true },
    { id: '12', title: 'Salary Disbursed', description: 'Monthly salary has been disbursed to all staff', type: 'FEES', time: '5d', read: true },
  ])

  const unread = items.filter(i => !i.read).length
  const byType = (type: string) => items.filter(i => i.type === type).length

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    if (filter === 'unread') return items.filter(i => !i.read)
    return items.filter(i => i.type === filter)
  }, [items, filter])

  const markRead = (id: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i))
  }

  const markAllRead = () => {
    setItems(prev => prev.map(i => ({ ...i, read: true })))
    toast.success('All notifications marked as read')
  }

  const remove = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
    toast.success('Notification deleted')
  }

  return (
    <div>
      <PageHeader
        title="Notifications Center"
        subtitle={`${unread} unread of ${items.length} total notifications`}
        extra={
          <Button variant="outline" onClick={markAllRead} disabled={unread === 0}>
            <CheckCheck className="h-4 w-4 mr-1" /> Mark all read
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Unread" value={unread} icon={Bell} color="rose" subtitle="needs attention" />
        <StatCard title="Admissions" value={byType('ADMISSION')} icon={Users} color="sky" />
        <StatCard title="Fees" value={byType('FEES')} icon={DollarSign} color="emerald" />
        <StatCard title="Events" value={byType('EVENT')} icon={Calendar} color="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        {/* Notifications list */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')}>All ({items.length})</Button>
              <Button variant={filter === 'unread' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('unread')}>Unread ({unread})</Button>
              <Button variant={filter === 'FEES' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('FEES')}>Fees</Button>
              <Button variant={filter === 'ADMISSION' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('ADMISSION')}>Admissions</Button>
              <Button variant={filter === 'LEAVE' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('LEAVE')}>Leaves</Button>
              <Button variant={filter === 'EVENT' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('EVENT')}>Events</Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <AnimatePresence>
                {filtered.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">No notifications in this filter</div>
                ) : (
                  filtered.map((n, idx) => {
                    const Icon = ICON_MAP[n.type] || Bell
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: idx * 0.03 }}
                        className={cn(
                          'flex items-start gap-3 p-4 border-b last:border-0 hover:bg-muted/30 transition-colors group',
                          !n.read && 'bg-primary/5'
                        )}
                      >
                        <div className={cn('rounded-xl p-2.5 shrink-0', COLOR_MAP[n.type] || 'bg-muted')}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className={cn('text-sm', !n.read ? 'font-semibold' : 'font-medium')}>{n.title}</p>
                            {!n.read && <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{n.description}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {n.time} ago
                            </span>
                            {n.action && (
                              <button className="text-[10px] text-primary hover:underline">{n.action}</button>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.read && (
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markRead(n.id)} title="Mark as read">
                              <CheckCheck className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-rose-500" onClick={() => remove(n.id)} title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </AnimatePresence>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Summary sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">By Type</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 space-y-2">
              {Object.entries(
                items.reduce((acc, n) => {
                  acc[n.type] = (acc[n.type] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                const Icon = ICON_MAP[type] || Bell
                return (
                  <div key={type} className="flex items-center gap-2 text-sm">
                    <div className={cn('rounded-lg p-1.5', COLOR_MAP[type] || 'bg-muted')}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="flex-1 capitalize">{type.toLowerCase()}</span>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">New</span>
                  <span className="text-sm font-semibold">{items.filter(i => i.time.includes('m') || i.time.includes('h')).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Read</span>
                  <span className="text-sm font-semibold">{items.filter(i => i.read).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Action Required</span>
                  <span className="text-sm font-semibold text-rose-600">{items.filter(i => i.action && !i.read).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
