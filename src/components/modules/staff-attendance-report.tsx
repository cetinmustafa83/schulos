'use client'

import { useState, useMemo } from 'react'
import { useList } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatCard } from '@/components/shared/stat-card'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Printer, Users, CheckCircle2, XCircle, Clock, CalendarCheck, TrendingUp, BarChart3 } from 'lucide-react'
import { formatDate } from '@/lib/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'
import { toast } from 'sonner'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function StaffAttendanceReportModule() {
  const [department, setDepartment] = useState('ALL')
  const [month, setMonth] = useState(new Date().getMonth())
  const { data: staffAtt } = useList<any>('staff-attendance', { limit: '500' })
  const { data: staffList } = useList<any>('staff', { limit: '500' })

  const stats = useMemo(() => {
    const records = (staffAtt?.items || []).filter(a => {
      const d = new Date(a.date)
      return d.getMonth() === month
    })
    const filteredRecords = department === 'ALL' ? records : records.filter(a => {
      const s = (staffList?.items || []).find(st => st.id === a.staffId)
      return s?.department === department
    })

    const total = filteredRecords.length
    const present = filteredRecords.filter(r => r.status === 'PRESENT').length
    const absent = filteredRecords.filter(r => r.status === 'ABSENT').length
    const late = filteredRecords.filter(r => r.status === 'LATE').length
    const leave = filteredRecords.filter(r => r.status === 'LEAVE').length
    const rate = total > 0 ? Math.round((present / total) * 100) : 0

    // Per-department breakdown
    const depts: Record<string, { total: number; present: number; absent: number; late: number; leave: number }> = {}
    for (const r of records) {
      const s = (staffList?.items || []).find(st => st.id === r.staffId)
      const dept = s?.department || 'Unknown'
      if (!depts[dept]) depts[dept] = { total: 0, present: 0, absent: 0, late: 0, leave: 0 }
      depts[dept].total++
      if (r.status === 'PRESENT') depts[dept].present++
      else if (r.status === 'ABSENT') depts[dept].absent++
      else if (r.status === 'LATE') depts[dept].late++
      else if (r.status === 'LEAVE') depts[dept].leave++
    }
    const byDept = Object.entries(depts).map(([name, d]) => ({
      name,
      ...d,
      rate: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
    })).sort((a, b) => b.rate - a.rate)

    // Per-staff breakdown
    const staffMap = new Map((staffList?.items || []).map(s => [s.id, s]))
    const staffIds = new Set(filteredRecords.map(r => r.staffId))
    const byStaff = Array.from(staffIds).map(sid => {
      const s = staffMap.get(sid)
      const sRecords = filteredRecords.filter(r => r.staffId === sid)
      const sPresent = sRecords.filter(r => r.status === 'PRESENT').length
      const sAbsent = sRecords.filter(r => r.status === 'ABSENT').length
      const sLate = sRecords.filter(r => r.status === 'LATE').length
      const sLeave = sRecords.filter(r => r.status === 'LEAVE').length
      const sRate = sRecords.length > 0 ? Math.round((sPresent / sRecords.length) * 100) : 0
      return {
        id: sid,
        name: s ? `${s.firstName} ${s.lastName}` : 'Unknown',
        staffId: s?.staffId || '-',
        department: s?.department || '-',
        designation: s?.designation || '-',
        present: sPresent,
        absent: sAbsent,
        late: sLate,
        leave: sLeave,
        total: sRecords.length,
        rate: sRate,
      }
    }).sort((a, b) => b.rate - a.rate)

    return { total, present, absent, late, leave, rate, byDept, byStaff }
  }, [staffAtt, staffList, department, month])

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const trend: { name: string; rate: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const m = (month - i + 12) % 12
      const monthRecords = (staffAtt?.items || []).filter(a => {
        const d = new Date(a.date)
        return d.getMonth() === m
      })
      const mPresent = monthRecords.filter(r => r.status === 'PRESENT').length
      const mRate = monthRecords.length > 0 ? Math.round((mPresent / monthRecords.length) * 100) : 0
      trend.push({ name: MONTHS[m].slice(0, 3), rate: mRate })
    }
    return trend
  }, [staffAtt, month])

  // Departments list
  const departments = useMemo(() => {
    const set = new Set((staffList?.items || []).map(s => s.department).filter(Boolean))
    return Array.from(set)
  }, [staffList])

  const pieData = [
    { name: 'Present', value: stats.present, fill: '#10b981' },
    { name: 'Absent', value: stats.absent, fill: '#f43f5e' },
    { name: 'Late', value: stats.late, fill: '#f59e0b' },
    { name: 'Leave', value: stats.leave, fill: '#0ea5e9' },
  ]

  const handlePrint = () => {
    window.print()
    toast.success('Print dialog opened')
  }

  return (
    <div>
      <PageHeader
        title="Staff Attendance Report"
        subtitle={`Monthly staff attendance for ${MONTHS[month]}`}
        extra={<Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Print</Button>}
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
              <Label className="text-xs">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Departments</SelectItem>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Records" value={stats.total} icon={CalendarCheck} color="sky" subtitle={MONTHS[month]} />
        <StatCard title="Present" value={stats.present} icon={CheckCircle2} color="emerald" subtitle={`${stats.rate}% rate`} />
        <StatCard title="Absent" value={stats.absent} icon={XCircle} color="rose" subtitle={`${stats.total > 0 ? 100 - stats.rate : 0}% rate`} />
        <StatCard title="Late / Leave" value={stats.late + stats.leave} icon={Clock} color="amber" subtitle={`${stats.late} late, ${stats.leave} leave`} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> 6-Month Trend</CardTitle>
            <CardDescription>Monthly staff attendance rate</CardDescription>
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
            <CardTitle className="text-base">Status Distribution</CardTitle>
            <CardDescription>Breakdown of all staff attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department summary */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Department-wise Summary</CardTitle>
          <CardDescription>Attendance by department</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Department</TableHead>
                <TableHead className="text-center">Total</TableHead>
                <TableHead className="text-center text-emerald-600">Present</TableHead>
                <TableHead className="text-center text-rose-600">Absent</TableHead>
                <TableHead className="text-center text-amber-600">Late</TableHead>
                <TableHead className="text-center text-sky-600">Leave</TableHead>
                <TableHead className="text-center">Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.byDept.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No data for {MONTHS[month]}</TableCell></TableRow>
              ) : (
                stats.byDept.map(d => (
                  <TableRow key={d.name} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-center text-sm">{d.total}</TableCell>
                    <TableCell className="text-center text-sm text-emerald-600 font-medium">{d.present}</TableCell>
                    <TableCell className="text-center text-sm text-rose-600 font-medium">{d.absent}</TableCell>
                    <TableCell className="text-center text-sm text-amber-600 font-medium">{d.late}</TableCell>
                    <TableCell className="text-center text-sm text-sky-600 font-medium">{d.leave}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={d.rate >= 75 ? 'text-emerald-600' : d.rate >= 50 ? 'text-amber-600' : 'text-rose-600'}>{d.rate}%</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Staff-wise table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Staff-wise Report</CardTitle>
              <CardDescription>Individual attendance ({stats.byStaff.length} staff)</CardDescription>
            </div>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 sticky top-0">
                  <TableHead>Staff</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center text-emerald-600">Present</TableHead>
                  <TableHead className="text-center text-rose-600">Absent</TableHead>
                  <TableHead className="text-center text-amber-600">Late</TableHead>
                  <TableHead className="text-center text-sky-600">Leave</TableHead>
                  <TableHead className="text-center">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.byStaff.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No data</TableCell></TableRow>
                ) : (
                  stats.byStaff.slice(0, 100).map(s => (
                    <TableRow key={s.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={s.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.staffId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{s.department}</TableCell>
                      <TableCell className="text-center text-emerald-600 font-medium">{s.present}</TableCell>
                      <TableCell className="text-center text-rose-600 font-medium">{s.absent}</TableCell>
                      <TableCell className="text-center text-amber-600 font-medium">{s.late}</TableCell>
                      <TableCell className="text-center text-sky-600 font-medium">{s.leave}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={s.rate >= 75 ? 'text-emerald-600' : s.rate >= 50 ? 'text-amber-600' : 'text-rose-600'}>{s.rate}%</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
