'use client'

import { useState } from 'react'
import { useList } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { DAYS, TIME_SLOTS } from '@/lib/constants'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUBJECT_COLORS: Record<string, string> = {
  'Mathematics': 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  'English': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Science': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'Physics': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'Chemistry': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Biology': 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
}

export function RoutineModule() {
  const [classId, setClassId] = useState('')
  const { data: classes } = useList<any>('classes')
  const { data: routines } = useList<any>('routines')
  const { data: subjects } = useList<any>('subjects')
  const { data: staff } = useList<any>('staff')

  const subjectMap = new Map((subjects?.items || []).map((s) => [s.id, s]))
  const staffMap = new Map((staff?.items || []).map((s) => [s.id, s]))
  const filtered = (routines?.items || []).filter((r) => r.classId === classId)

  return (
    <div>
      <PageHeader title="Class Routine" subtitle="View and manage class timetables" />
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-end gap-3">
            <div className="w-full sm:w-72">
              <Label className="text-xs">Select Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Choose a class" /></SelectTrigger>
                <SelectContent>
                  {(classes?.items || []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Academic Year 2024-2025
            </div>
          </div>
        </CardContent>
      </Card>

      {!classId ? (
        <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">Please select a class to view the timetable</CardContent></Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="w-32 sticky left-0 bg-muted/40">Day / Time</TableHead>
                  {TIME_SLOTS.map((slot) => <TableHead key={slot} className="text-center text-xs">{slot}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {DAYS.slice(0, 5).map((day) => (
                  <TableRow key={day}>
                    <TableCell className="font-medium sticky left-0 bg-card">{day}</TableCell>
                    {TIME_SLOTS.map((slot) => {
                      const routine = filtered.find((r) => r.day === day && r.startTime === slot.split(' - ')[0])
                      const subject = routine ? subjectMap.get(routine.subjectId) : null
                      const teacher = routine ? staffMap.get(routine.teacherId) : null
                      return (
                        <TableCell key={slot} className="p-2">
                          {routine && subject ? (
                            <div className={cn('rounded-lg p-2 text-xs', SUBJECT_COLORS[subject.name] || 'bg-muted')}>
                              <p className="font-medium">{subject.name}</p>
                              {teacher && <p className="opacity-70 mt-0.5 truncate">{teacher.firstName} {teacher.lastName}</p>}
                              <p className="opacity-50 mt-0.5">{routine.roomNo}</p>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed p-2 text-center text-xs text-muted-foreground">—</div>
                          )}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  )
}
