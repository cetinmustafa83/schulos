'use client'

import { useState, useMemo } from 'react'
import { useList } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronLeft, ChevronRight, CalendarDays, CalendarClock, Sun, FileText, Bell } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/constants'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

interface CalEvent {
  id: string
  title: string
  description?: string
  date: Date
  endDate?: Date | null
  type: string // EVENT, HOLIDAY, EXAM, NOTICE
  location?: string
}

export function CalendarModule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const { data: events } = useList<any>('events')
  const { data: notices } = useList<any>('notices')
  const { data: exams } = useList<any>('exams')

  // Combine all events
  const allEvents: CalEvent[] = useMemo(() => {
    const list: CalEvent[] = []
    for (const e of events?.items || []) {
      list.push({
        id: `evt-${e.id}`,
        title: e.title,
        description: e.description,
        date: new Date(e.startDate),
        endDate: e.endDate ? new Date(e.endDate) : null,
        type: e.type === 'HOLIDAY' ? 'HOLIDAY' : 'EVENT',
        location: e.location,
      })
    }
    for (const n of notices?.items || []) {
      list.push({
        id: `ntc-${n.id}`,
        title: n.title,
        description: n.content,
        date: new Date(n.publishDate),
        type: 'NOTICE',
      })
    }
    for (const ex of exams?.items || []) {
      list.push({
        id: `exm-${ex.id}`,
        title: ex.name,
        date: new Date(ex.startDate),
        endDate: ex.endDate ? new Date(ex.endDate) : null,
        type: 'EXAM',
      })
    }
    return list
  }, [events, notices, exams])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startWeekday = (firstDay.getDay() + 6) % 7 // Monday = 0
  const totalDays = lastDay.getDate()

  const today = new Date()
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  const eventsForDay = (d: number) => {
    const dayDate = new Date(year, month, d)
    return allEvents.filter((e) => {
      const eDate = new Date(e.date)
      if (eDate.toDateString() === dayDate.toDateString()) return true
      if (e.endDate) {
        return dayDate >= eDate && dayDate <= new Date(e.endDate)
      }
      return false
    })
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const selectedDayEvents = selectedDate ? allEvents.filter((e) => {
    const eDate = new Date(e.date)
    return eDate.toDateString() === selectedDate.toDateString()
  }) : []

  const upcomingEvents = allEvents
    .filter((e) => new Date(e.date) >= new Date(today.toDateString()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 6)

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => { setCurrentDate(new Date()); setSelectedDate(new Date()) }

  const typeColor: Record<string, string> = {
    EVENT: 'bg-violet-500',
    HOLIDAY: 'bg-amber-500',
    EXAM: 'bg-rose-500',
    NOTICE: 'bg-sky-500',
  }
  const typeBg: Record<string, string> = {
    EVENT: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    HOLIDAY: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    EXAM: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    NOTICE: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        subtitle="Events, exams, holidays and notices in calendar view"
        extra={
          <Button variant="outline" onClick={goToday}>
            <CalendarDays className="h-4 w-4 mr-1" /> Today
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{MONTH_NAMES[month]} {year}</CardTitle>
                <CardDescription>{allEvents.length} events this academic year</CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEKDAYS.map((d) => (
                <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
                  {d}
                </div>
              ))}
            </div>
            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              <AnimatePresence mode="popLayout">
                {cells.map((d, i) => {
                  if (d === null) return <div key={`e-${i}`} className="aspect-square" />
                  const dayEvents = eventsForDay(d)
                  const isSel = selectedDate?.getDate() === d && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year
                  return (
                    <motion.button
                      key={d}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.005 }}
                      onClick={() => setSelectedDate(new Date(year, month, d))}
                      className={cn(
                        'aspect-square rounded-lg border p-1.5 text-left transition-all hover:shadow-md hover:border-primary/40',
                        isToday(d) ? 'border-primary bg-primary/5' : 'border-border',
                        isSel ? 'ring-2 ring-primary ring-offset-1' : '',
                        dayEvents.some(e => e.type === 'HOLIDAY') ? 'bg-amber-50 dark:bg-amber-950/20' : ''
                      )}
                    >
                      <div className={cn(
                        'text-xs font-medium',
                        isToday(d) ? 'inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground' : ''
                      )}>
                        {d}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {dayEvents.slice(0, 2).map((e) => (
                            <div key={e.id} className={cn('rounded px-1 py-0.5 text-[9px] font-medium truncate', typeBg[e.type])}>
                              {e.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-[9px] text-muted-foreground">+{dayEvents.length - 2} more</div>
                          )}
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t">
              {['EVENT', 'HOLIDAY', 'EXAM', 'NOTICE'].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <span className={cn('h-2.5 w-2.5 rounded-full', typeColor[t])} />
                  <span className="text-xs text-muted-foreground capitalize">{t.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected day */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {selectedDate ? formatDate(selectedDate) : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {selectedDayEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No events on this day</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayEvents.map((e) => (
                    <div key={e.id} className="rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium">{e.title}</p>
                        <Badge variant="outline" className={cn('text-[10px] capitalize', typeBg[e.type])}>{e.type.toLowerCase()}</Badge>
                      </div>
                      {e.description && <p className="text-xs text-muted-foreground line-clamp-2">{e.description}</p>}
                      {e.location && <p className="text-xs text-muted-foreground mt-1">📍 {e.location}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-primary" /> Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <ScrollArea className="max-h-80">
                <div className="space-y-2">
                  {upcomingEvents.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">No upcoming events</p>
                  ) : (
                    upcomingEvents.map((e) => {
                      const Icon = e.type === 'HOLIDAY' ? Sun : e.type === 'EXAM' ? FileText : e.type === 'NOTICE' ? Bell : CalendarClock
                      return (
                        <div key={e.id} className="flex items-start gap-3 rounded-lg border p-2.5 hover:bg-muted/30 transition-colors">
                          <div className={cn('rounded-lg p-1.5 shrink-0', typeBg[e.type])}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{e.title}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(e.date)}</p>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
