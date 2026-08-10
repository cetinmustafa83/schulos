'use client'

import { useState, useMemo } from 'react'
import { useList, useUpdate } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { UserAvatar } from '@/components/shared/user-avatar'
import { StatCard } from '@/components/shared/stat-card'
import { GraduationCap, ArrowRight, CheckCircle2, Users, AlertCircle, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function StudentPromotionModule() {
  const [fromClass, setFromClass] = useState('')
  const [toClass, setToClass] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [promoted, setPromoted] = useState(0)

  const { data: students, refetch } = useList<any>('students', { limit: '500' })
  const { data: classes } = useList<any>('classes')
  const updateMut = useUpdate('students')

  const fromClassName = (classes?.items || []).find(c => c.id === fromClass)?.name || ''
  const toClassName = (classes?.items || []).find(c => c.id === toClass)?.name || ''

  const classStudents = useMemo(() => {
    if (!fromClass) return []
    return (students?.items || []).filter(s => s.classId === fromClass && s.status === 'ACTIVE')
  }, [students, fromClass])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === classStudents.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(classStudents.map(s => s.id)))
    }
  }

  const handlePromote = async () => {
    const selectedStudents = classStudents.filter(s => selected.has(s.id))
    let count = 0
    for (const s of selectedStudents) {
      const newClassName = toClassName ? `${toClassName} - ${s.section || 'A'}` : s.className
      await updateMut.mutateAsync({
        id: s.id,
        data: {
          classId: toClass,
          className: newClassName,
        },
      })
      count++
    }
    setPromoted(count)
    setSelected(new Set())
    setConfirmOpen(false)
    refetch()
    toast.success(`${count} students promoted from ${fromClassName} to ${toClassName}`)
  }

  const progress = classStudents.length > 0 ? Math.round((selected.size / classStudents.length) * 100) : 0

  return (
    <div>
      <PageHeader
        title="Student Promotion"
        subtitle="Promote students to the next class at the end of the academic year"
        extra={
          selected.size > 0 && (
            <Button onClick={() => setConfirmOpen(true)} disabled={!toClass}>
              <ArrowRight className="h-4 w-4 mr-1" /> Promote {selected.size} Students
            </Button>
          )
        }
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Students" value={students?.total || 0} icon={Users} color="sky" />
        <StatCard title="In Selected Class" value={classStudents.length} icon={GraduationCap} color="violet" subtitle={fromClassName || 'No class'} />
        <StatCard title="Selected" value={selected.size} icon={CheckCircle2} color="emerald" subtitle="for promotion" />
        <StatCard title="Promoted" value={promoted} icon={ArrowRight} color="amber" subtitle="this session" />
      </div>

      {/* Class selectors */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Promotion Setup</CardTitle>
          <CardDescription>Select source and destination classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] items-end">
            <div>
              <Label className="text-xs">From Class</Label>
              <Select value={fromClass} onValueChange={(v) => { setFromClass(v); setSelected(new Set()) }}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select source class" /></SelectTrigger>
                <SelectContent>
                  {(classes?.items || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-center pb-2">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <Label className="text-xs">To Class</Label>
              <Select value={toClass} onValueChange={setToClass}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select destination class" /></SelectTrigger>
                <SelectContent>
                  {(classes?.items || []).filter(c => c.id !== fromClass).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress bar */}
      {classStudents.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Selection Progress</span>
              <span className="text-sm text-muted-foreground">{selected.size} of {classStudents.length} selected ({progress}%)</span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Student list */}
      {!fromClass ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="inline-flex rounded-2xl bg-muted p-4 mb-4">
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold">Select a source class</h3>
            <p className="text-sm text-muted-foreground mt-1">Choose a class to view students eligible for promotion.</p>
          </CardContent>
        </Card>
      ) : classStudents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="inline-flex rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-4 mb-4">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
            <h3 className="text-base font-semibold">No active students</h3>
            <p className="text-sm text-muted-foreground mt-1">This class has no active students to promote.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Students in {fromClassName}</CardTitle>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selected.size === classStudents.length && classStudents.length > 0}
                  onCheckedChange={selectAll}
                />
                <Label htmlFor="select-all" className="text-xs cursor-pointer">Select All</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 sticky top-0">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission No</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classStudents.map(s => (
                    <TableRow
                      key={s.id}
                      className={cn('hover:bg-muted/30 cursor-pointer', selected.has(s.id) && 'bg-primary/5')}
                      onClick={() => toggleSelect(s.id)}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.has(s.id)}
                          onCheckedChange={() => toggleSelect(s.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={`${s.firstName} ${s.lastName}`} size="sm" />
                          <span className="text-sm font-medium">{s.firstName} {s.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.admissionNo}</TableCell>
                      <TableCell className="text-sm">{s.section || '-'}</TableCell>
                      <TableCell className="text-sm">{s.rollNo || '-'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-emerald-600 text-xs">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Student Promotion?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to promote <span className="font-semibold text-foreground">{selected.size} students</span> from
              <span className="font-semibold text-foreground"> {fromClassName}</span> to
              <span className="font-semibold text-foreground"> {toClassName}</span>.
              This action will update their class assignment. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePromote} disabled={updateMut.isPending}>
              {updateMut.isPending ? 'Promoting...' : 'Confirm Promotion'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
