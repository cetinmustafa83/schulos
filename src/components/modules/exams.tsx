'use client'

import { useState } from 'react'
import { useList, useCreate, useDelete } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { ResourceModule, col } from '@/components/shared/resource-module'
import { EXAM_TYPES, MARK_GRADES, getGrade, formatDate } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'

export function ExamsModule() {
  const [tab, setTab] = useState('exams')
  return (
    <div>
      <PageHeader title="Examinations" subtitle="Manage exams, schedules and marks" />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="exams">Exams</TabsTrigger>
          <TabsTrigger value="marks">Marks</TabsTrigger>
          <TabsTrigger value="grades">Grade System</TabsTrigger>
        </TabsList>
        <TabsContent value="exams">
          <ResourceModule
            resourceKey="exams"
            title="Exams"
            subtitle="Exam schedules and configurations"
            addLabel="Add Exam"
            columns={[
              col.text('name', 'Exam Name'),
              col.text('type', 'Type'),
              col.date('startDate', 'Start Date'),
              col.date('endDate', 'End Date'),
              col.text('description', 'Description'),
            ]}
            fields={[
              { name: 'name', label: 'Exam Name', type: 'text', required: true, fullWidth: true },
              { name: 'type', label: 'Type', type: 'select', options: EXAM_TYPES.map(t => ({ value: t, label: t.replace('_', ' ') })) },
              { name: 'classId', label: 'Class ID', type: 'text' },
              { name: 'startDate', label: 'Start Date', type: 'date', required: true },
              { name: 'endDate', label: 'End Date', type: 'date' },
              { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
            ]}
          />
        </TabsContent>
        <TabsContent value="marks">
          <MarksEntry />
        </TabsContent>
        <TabsContent value="grades">
          <Card>
            <CardHeader><CardTitle className="text-base">Grading System</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {MARK_GRADES.map((g) => (
                  <div key={g.grade} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Badge className={`bg-${g.color}-100 text-${g.color}-700`}>{g.grade}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">{g.min}% and above</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MarksEntry() {
  const [examId, setExamId] = useState('')
  const [classId, setClassId] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [marks, setMarks] = useState<Record<string, string>>({})

  const { data: exams } = useList<any>('exams')
  const { data: classes } = useList<any>('classes')
  const { data: subjects } = useList<any>('subjects')
  const { data: students } = useList<any>('students')
  const { data: marksList } = useList<any>('marks')
  const createMark = useCreate('marks')

  const filteredStudents = (students?.items || []).filter((s) => s.classId === classId)

  const handleSave = async () => {
    const subjectId = (subjects?.items || [])[0]?.id
    if (!subjectId || !examId || !classId) {
      toast.error('Missing required fields')
      return
    }
    for (const [studentId, m] of Object.entries(marks)) {
      const marksObtained = Number(m)
      await createMark.mutateAsync({
        examId, studentId, subjectId, classId,
        marksObtained,
        totalMarks: 100,
        grade: getGrade(marksObtained),
      })
    }
    toast.success(`Saved marks for ${Object.keys(marks).length} students`)
    setMarks({})
    setDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <Label className="text-xs">Exam</Label>
              <Select value={examId} onValueChange={setExamId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select exam" /></SelectTrigger>
                <SelectContent>
                  {(exams?.items || []).map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>
                  {(classes?.items || []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 flex items-end">
              <Button onClick={() => setDialogOpen(true)} disabled={!examId || !classId}>
                <Plus className="h-4 w-4 mr-1" /> Enter Marks
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={[
          { key: 'studentId', header: 'Student ID', cell: (row) => <span className="text-sm">{row.studentId.slice(0, 8)}...</span> },
          { key: 'subjectId', header: 'Subject', cell: (row) => <span className="text-sm">{row.subjectId.slice(0, 8)}...</span> },
          { key: 'marksObtained', header: 'Marks', cell: (row) => <span className="text-sm font-medium">{row.marksObtained}</span> },
          { key: 'totalMarks', header: 'Total', cell: (row) => <span className="text-sm">{row.totalMarks}</span> },
          { key: 'grade', header: 'Grade', cell: (row) => <Badge variant="outline">{row.grade || getGrade(row.marksObtained, row.totalMarks)}</Badge> },
        ]}
        data={(marksList?.items || []).slice(0, 50)}
        loading={false}
        getKey={(row) => row.id}
        emptyTitle="No marks entered yet"
        emptyDescription="Use the form above to enter marks"
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enter Marks - {(exams?.items || []).find(e => e.id === examId)?.name}</DialogTitle>
            <DialogDescription className="sr-only">Enter marks for students in this exam</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto py-2">
            {filteredStudents.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.firstName} {s.lastName}</p>
                  <p className="text-xs text-muted-foreground">{s.admissionNo}</p>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                  value={marks[s.id] || ''}
                  onChange={(e) => setMarks({ ...marks, [s.id]: e.target.value })}
                  className="w-24"
                />
                {marks[s.id] && <Badge variant="outline">{getGrade(Number(marks[s.id]))}</Badge>}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={createMark.isPending}>Save Marks</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
