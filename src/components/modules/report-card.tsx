'use client'

import { useState, useMemo } from 'react'
import { useList } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Search, Printer, Download, FileText, Award, TrendingUp, GraduationCap } from 'lucide-react'
import { formatDate, getAvatarColor, initials, getGrade, MARK_GRADES, formatCurrency } from '@/lib/constants'
import { useSettings } from '@/hooks/use-data'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function ReportCardModule() {
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [examId, setExamId] = useState('')

  const { data: students } = useList<any>('students', { limit: '500' })
  const { data: exams } = useList<any>('exams')
  const { data: subjects } = useList<any>('subjects')
  const { data: marks } = useList<any>('marks', { limit: '500' })
  const { data: settings } = useSettings()

  const filtered = useMemo(() => {
    if (!search) return students?.items || []
    const s = search.toLowerCase()
    return (students?.items || []).filter(st =>
      `${st.firstName} ${st.lastName}`.toLowerCase().includes(s) ||
      st.admissionNo?.toLowerCase().includes(s)
    )
  }, [students, search])

  const selected = (students?.items || []).find(s => s.id === selectedId)

  const studentMarks = useMemo(() => {
    if (!selected) return []
    return (marks?.items || []).filter(m => m.studentId === selected.id && (!examId || m.examId === examId))
  }, [marks, selected, examId])

  const subjectMap = useMemo(() => {
    const m = new Map<string, any>()
    for (const s of subjects?.items || []) m.set(s.id, s)
    return m
  }, [subjects])

  const examMap = useMemo(() => {
    const m = new Map<string, any>()
    for (const e of exams?.items || []) m.set(e.id, e)
    return m
  }, [exams])

  const totalMarks = studentMarks.reduce((sum, m) => sum + m.marksObtained, 0)
  const maxMarks = studentMarks.reduce((sum, m) => sum + m.totalMarks, 0)
  const percentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0
  const overallGrade = getGrade(percentage, 100)
  const result = percentage >= 40 ? 'PASS' : 'FAIL'

  const handlePrint = () => {
    window.print()
    toast.success('Print dialog opened')
  }

  const gradeColor = (grade: string) => {
    const g = MARK_GRADES.find(g => g.grade === grade)
    if (!g) return 'text-zinc-500'
    return `text-${g.color}-600 dark:text-${g.color}-400`
  }

  return (
    <div>
      <PageHeader
        title="Report Cards"
        subtitle="Generate and print student report cards with marks and grades"
        extra={
          selected && studentMarks.length > 0 ? (
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
            </div>
          ) : null
        }
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Student selector */}
        <Card className="print:hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select Student</CardTitle>
            <CardDescription>Search and pick a student</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[450px] -mx-2 px-2">
              <div className="space-y-1">
                {filtered.slice(0, 50).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg p-2 text-left transition-colors border',
                      selectedId === s.id ? 'bg-primary/5 border-primary/30' : 'border-transparent hover:bg-muted/40'
                    )}
                  >
                    <UserAvatar name={`${s.firstName} ${s.lastName}`} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-muted-foreground">{s.admissionNo} • {s.className}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Report card preview */}
        <div>
          {!selected ? (
            <Card className="border-dashed">
              <CardContent className="p-16 text-center">
                <div className="inline-flex rounded-2xl bg-muted p-4 mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold">Select a student</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Choose a student from the list to generate their report card.
                </p>
              </CardContent>
            </Card>
          ) : studentMarks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-16 text-center">
                <div className="inline-flex rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-4 mb-4">
                  <FileText className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-base font-semibold">No marks found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  This student has no marks recorded. Try selecting a different exam or add marks first.
                </p>
                <div className="mt-4 max-w-xs mx-auto">
                  <Label className="text-xs">Select Exam</Label>
                  <Select value={examId} onValueChange={setExamId}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="All exams" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Exams</SelectItem>
                      {(exams?.items || []).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="print:hidden">
              <div className="mb-4 max-w-xs">
                <Label className="text-xs">Filter by Exam</Label>
                <Select value={examId || 'ALL'} onValueChange={(v) => setExamId(v === 'ALL' ? '' : v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Exams</SelectItem>
                    {(exams?.items || []).map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <ReportCardPrint
                student={selected}
                marks={studentMarks}
                subjectMap={subjectMap}
                examMap={examMap}
                settings={settings}
                totalMarks={totalMarks}
                maxMarks={maxMarks}
                percentage={percentage}
                overallGrade={overallGrade}
                result={result}
              />
            </div>
          )}

          {/* Print-only view */}
          {selected && studentMarks.length > 0 && (
            <div className="hidden print:block">
              <ReportCardPrint
                student={selected}
                marks={studentMarks}
                subjectMap={subjectMap}
                examMap={examMap}
                settings={settings}
                totalMarks={totalMarks}
                maxMarks={maxMarks}
                percentage={percentage}
                overallGrade={overallGrade}
                result={result}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ReportCardPrint({ student, marks, subjectMap, examMap, settings, totalMarks, maxMarks, percentage, overallGrade, result }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-2 border-primary/20 rounded-xl p-8 shadow-xl print:shadow-none print:border-0 print:rounded-none"
    >
      {/* Header */}
      <div className="text-center border-b-2 border-primary/20 pb-4 mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{settings?.school_name || 'School MS'}</h2>
            <p className="text-xs text-muted-foreground">{settings?.school_address || ''}</p>
            <p className="text-xs text-muted-foreground">{settings?.school_phone || ''} · {settings?.school_email || ''}</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 mt-2 px-4 py-1 rounded-full bg-primary/10">
          <Award className="h-4 w-4 text-primary" />
          <h3 className="text-lg font-serif tracking-wide uppercase">Progress Report</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Academic Year {settings?.academic_year || '2024-2025'}</p>
      </div>

      {/* Student info */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1.5 text-sm">
          <InfoRow label="Student Name" value={`${student.firstName} ${student.lastName}`} />
          <InfoRow label="Admission No" value={student.admissionNo} />
          <InfoRow label="Class" value={student.className || '-'} />
          <InfoRow label="Roll No" value={student.rollNo || '-'} />
        </div>
        <div className="space-y-1.5 text-sm">
          <InfoRow label="Father's Name" value={student.fatherName || '-'} />
          <InfoRow label="Date of Birth" value={formatDate(student.dob)} />
          <InfoRow label="Category" value={student.category || '-'} />
          <InfoRow label="House" value={student.house || '-'} />
        </div>
      </div>

      {/* Marks table */}
      <div className="rounded-lg border overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b">
              <th className="text-left p-3 font-semibold">Subject</th>
              <th className="text-center p-3 font-semibold">Exam</th>
              <th className="text-center p-3 font-semibold">Max Marks</th>
              <th className="text-center p-3 font-semibold">Obtained</th>
              <th className="text-center p-3 font-semibold">Grade</th>
              <th className="text-center p-3 font-semibold">Result</th>
            </tr>
          </thead>
          <tbody>
            {marks.map((m: any, i: number) => {
              const subject = subjectMap.get(m.subjectId)
              const exam = examMap.get(m.examId)
              const grade = m.grade || getGrade(m.marksObtained, m.totalMarks)
              const pass = m.marksObtained >= m.totalMarks * 0.4
              return (
                <tr key={m.id} className={cn('border-b last:border-0', i % 2 === 1 && 'bg-muted/20')}>
                  <td className="p-3 font-medium">{subject?.name || 'Unknown'}</td>
                  <td className="p-3 text-center text-muted-foreground text-xs">{exam?.name || '-'}</td>
                  <td className="p-3 text-center">{m.totalMarks}</td>
                  <td className="p-3 text-center font-semibold">{m.marksObtained.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    <Badge variant="outline" className={cn('font-semibold', pass ? 'text-emerald-600' : 'text-rose-600')}>{grade}</Badge>
                  </td>
                  <td className="p-3 text-center">
                    <span className={cn('text-xs font-medium', pass ? 'text-emerald-600' : 'text-rose-600')}>{pass ? 'PASS' : 'FAIL'}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="bg-primary/5 border-t-2 font-semibold">
              <td className="p-3" colSpan={2}>Total</td>
              <td className="p-3 text-center">{maxMarks}</td>
              <td className="p-3 text-center">{totalMarks.toFixed(2)}</td>
              <td className="p-3 text-center" colSpan={2}>{percentage}%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <SummaryBox label="Total Marks" value={`${totalMarks.toFixed(0)}/${maxMarks}`} color="bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300" />
        <SummaryBox label="Percentage" value={`${percentage}%`} color="bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300" />
        <SummaryBox label="Overall Grade" value={overallGrade} color="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" />
        <SummaryBox label="Result" value={result} color={result === 'PASS' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'} />
      </div>

      {/* Grading scale */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Grading Scale:</p>
        <div className="flex flex-wrap gap-2">
          {MARK_GRADES.map(g => (
            <div key={g.grade} className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs">
              <span className={cn('font-semibold', `text-${g.color}-600`)}>{g.grade}</span>
              <span className="text-muted-foreground">{g.min}%+</span>
            </div>
          ))}
        </div>
      </div>

      {/* Teacher remarks */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Teacher's Remarks:</p>
        <div className="rounded-lg border p-3 min-h-[60px] text-sm italic text-muted-foreground">
          {percentage >= 90 ? 'Excellent performance! Keep up the outstanding work.' :
           percentage >= 75 ? 'Very good performance. Continue to work hard.' :
           percentage >= 60 ? 'Good performance. There is room for improvement.' :
           percentage >= 40 ? 'Satisfactory performance. Need more focus on studies.' :
           'Needs significant improvement. Please attend remedial classes.'}
        </div>
      </div>

      {/* Signatures */}
      <div className="flex items-end justify-between mt-8 pt-6 border-t">
        <div className="text-center">
          <div className="h-10 border-b border-dashed w-28 mb-1" />
          <p className="text-xs text-muted-foreground">Class Teacher</p>
        </div>
        <div className="text-center">
          <div className="h-10 border-b border-dashed w-28 mb-1" />
          <p className="text-xs text-muted-foreground">Parent's Signature</p>
        </div>
        <div className="text-center">
          <div className="h-10 border-b border-dashed w-28 mb-1" />
          <p className="text-xs text-muted-foreground">Principal</p>
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-4">
        Generated on {formatDate(new Date())} · This is a computer-generated report card
      </p>
    </motion.div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-muted-foreground min-w-[100px]">{label}:</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function SummaryBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={cn('rounded-lg p-3 text-center', color)}>
      <p className="text-[10px] uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-lg font-bold mt-0.5">{value}</p>
    </div>
  )
}
