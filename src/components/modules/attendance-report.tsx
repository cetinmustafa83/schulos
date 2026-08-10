'use client'

import { useState, useMemo } from 'react'
import { useList } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatCard } from '@/components/shared/stat-card'
import { Printer, Users, CheckCircle2, XCircle, TrendingUp, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts'
import { toast } from 'sonner'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function AttendanceReportModule() {
  const [classFilter, setClassFilter] = useState('ALL')
  const [month, setMonth] = useState(new Date().getMonth())
  const { data: attendance } = useList<any>('attendance', { limit: '500' })
  const { data: students } = useList<any>('students', { limit: '500' })
  const { data: classes } = useList<any>('classes')

  const stats = useMemo(() => {
    const records = (attendance?.items || []).filter(a => {
      const d = new Date(a.date)
      return d.getMonth() === month
    })
    const filteredRecords = classFilter === 'ALL' ? records : records.filter(a => a.classId === classFilter)

    const total = filteredRecords.length
    const present = filteredRecords.filter(r => r.status === 'PRESENT').length
    const absent = filteredRecords.filter(r => r.status === 'ABSENT').length
    const late = filteredRecords.filter(r => r.status === 'LATE').length
    const rate = total > 0 ? Math.round((present / total) * 100) : 0

    // Per-class breakdown
    const byClass = (classes?.items || []).map(c => {
      const classRecords = records.filter(r => r.classId === c.id)
      const classStudents = (students?.items || []).filter(s => s.classId === c.id)
      const classPresent = classRecords.filter(r => r.status === 'PRESENT').length
      const classRate = classRecords.length > 0 ? Math.round((classPresent / classRecords.length) * 100) : 0
      return {
        id: c.id,
        name: c.name,
        totalStudents: classStudents.length,
        totalRecords: classRecords.length,
        present: classPresent,
        absent: classRecords.filter(r => r.status === 'ABSENT').length,
        late: classRecords.filter(r => r.status === 'LATE').length,
        rate: classRate,
      }
    }).filter(c => c.totalRecords > 0)

    // Per-student breakdown (for selected class or all)
    const studentIds = classFilter === 'ALL'
      ? new Set(filteredRecords.map(r => r.studentId))
      : new Set((students?.items || []).filter(s => s.classId === classFilter).map(s => s.id))

    const byStudent = Array.from(studentIds).map(sid => {
      const student = (students?.items || []).find(s => s.id === sid)
      const studentRecords = filteredRecords.filter(r => r.studentId === sid)
      const sPresent = studentRecords.filter(r => r.status === 'PRESENT').length
      const sAbsent = studentRecords.filter(r => r.status === 'ABSENT').length
      const sLate = studentRecords.filter(r => r.status === 'LATE').length
      const sRate = studentRecords.length > 0 ? Math.round((sPresent / studentRecords.length) * 100) : 0
      return {
        id: sid,
        name: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        admissionNo: student?.admissionNo || '-',
        className: student?.className || '-',
        present: sPresent,
        absent: sAbsent,
        late: sLate,
        total: studentRecords.length,
        rate: sRate,
      }
    }).sort((a, b) => b.rate - a.rate)

    return { total, present, absent, late, rate, byClass, byStudent }
  }, [attendance, students, classes, classFilter, month])

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const trend: { name: string; rate: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const m = (month - i + 12) % 12
      const monthRecords = (attendance?.items || []).filter(a => {
        const d = new Date(a.date)
        return d.getMonth() === m
      })
      const mPresent = monthRecords.filter(r => r.status === 'PRESENT').length
      const mRate = monthRecords.length > 0 ? Math.round((mPresent / monthRecords.length) * 100) : 0
      trend.push({ name: MONTHS[m].slice(0, 3), rate: mRate })
    }
    return trend
  }, [attendance, month])

  const handlePrint = () => {
    window.print()
    toast.success('Print dialog opened')
  }

  return (
    <div>
      <PageHeader
        title="Attendance Report"
        subtitle={`Monthly attendance breakdown for ${MONTHS[month]}`}
        extra={
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" /> Print Report
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="mb-4 print:hidden">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Label className="text-xs">Month</Label>
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs">Class</Label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Classes</SelectItem>
                  {(classes?.items || []).map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Records" value={stats.total} icon={Calendar} color="sky" subtitle={MONTHS[month]} />
        <StatCard title="Present" value={stats.present} icon={CheckCircle2} color="emerald" subtitle={`${stats.rate}% rate`} />
        <StatCard title="Absent" value={stats.absent} icon={XCircle} color="rose" subtitle={`${stats.total > 0 ? 100 - stats.rate : 0}% rate`} />
        <StatCard title="Late" value={stats.late} icon={TrendingUp} color="amber" subtitle="arrivals" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">6-Month Attendance Trend</CardTitle>
            <CardDescription>Monthly attendance rate percentage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Attendance %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Class-wise Attendance</CardTitle>
            <CardDescription>Attendance rate by class for {MONTHS[month]}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.byClass}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="rate" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Class-wise table */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Class-wise Summary</CardTitle>
          <CardDescription>Detailed attendance breakdown by class</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Class</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead className="text-center">Records</TableHead>
                <TableHead className="text-center text-emerald-600">Present</TableHead>
                <TableHead className="text-center text-rose-600">Absent</TableHead>
                <TableHead className="text-center text-amber-600">Late</TableHead>
                <TableHead className="text-center">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.byClass.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">
                    No attendance data for {MONTHS[month]}
                  </TableCell>
                </TableRow>
              ) : (
                stats.byClass.map(c => (
                  <TableRow key={c.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-center">{c.totalStudents}</TableCell>
                    <TableCell className="text-center">{c.totalRecords}</TableCell>
                    <TableCell className="text-center text-emerald-600 font-medium">{c.present}</TableCell>
                    <TableCell className="text-center text-rose-600 font-medium">{c.absent}</TableCell>
                    <TableCell className="text-center text-amber-600 font-medium">{c.late}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={c.rate >= 75 ? 'text-emerald-600' : c.rate >= 50 ? 'text-amber-600' : 'text-rose-600'}>
                        {c.rate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Student-wise table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Student-wise Report</CardTitle>
              <CardDescription>Individual attendance breakdown ({stats.byStudent.length} students)</CardDescription>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 sticky top-0">
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-center text-emerald-600">Present</TableHead>
                  <TableHead className="text-center text-rose-600">Absent</TableHead>
                  <TableHead className="text-center text-amber-600">Late</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.byStudent.slice(0, 100).map(s => (
                  <TableRow key={s.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.admissionNo}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{s.className}</TableCell>
                    <TableCell className="text-center text-emerald-600 font-medium">{s.present}</TableCell>
                    <TableCell className="text-center text-rose-600 font-medium">{s.absent}</TableCell>
                    <TableCell className="text-center text-amber-600 font-medium">{s.late}</TableCell>
                    <TableCell className="text-center text-sm">{s.total}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={s.rate >= 75 ? 'text-emerald-600' : s.rate >= 50 ? 'text-amber-600' : 'text-rose-600'}>
                        {s.rate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
