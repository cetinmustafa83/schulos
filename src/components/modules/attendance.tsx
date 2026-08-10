'use client'

import { useState, useMemo } from 'react'
import { useList, useCreate } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { StatusBadge } from '@/components/shared/status-badge'
import { DataTable } from '@/components/shared/data-table'
import { useDashboard } from '@/hooks/use-data'
import { StatCard } from '@/components/shared/stat-card'
import { Users, CheckCircle2, XCircle, Clock, CalendarCheck, TrendingUp, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts'

export function AttendanceModule() {
  const [tab, setTab] = useState('take')
  const [classId, setClassId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [marks, setMarks] = useState<Record<string, string>>({})

  const { data: students } = useList<any>('students')
  const { data: classes } = useList<any>('classes')
  const { data: staffList } = useList<any>('staff')
  const { data: staffAtt } = useList<any>('staff-attendance')
  const createAtt = useCreate('attendance')
  const createStaffAtt = useCreate('staff-attendance')
  const { data: dash } = useDashboard()

  const filteredStudents = (students?.items || []).filter((s) => s.classId === classId)

  const handleMark = (studentId: string, status: string) => {
    setMarks({ ...marks, [studentId]: status })
  }

  const handleSaveAttendance = async () => {
    if (!classId) {
      toast.error('Please select a class')
      return
    }
    const records = Object.entries(marks).map(([studentId, status]) => ({
      studentId,
      date: new Date(date),
      status,
      classId,
    }))
    for (const r of records) {
      await createAtt.mutateAsync(r)
    }
    toast.success(`Attendance saved for ${records.length} students`)
    setMarks({})
  }

  const markAll = (status: string) => {
    const newMarks: Record<string, string> = {}
    for (const s of filteredStudents) newMarks[s.id] = status
    setMarks(newMarks)
  }

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Mark and track student & staff attendance"
      />

      {dash && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard title="Present Today" value={dash.stats.presentToday} icon={CheckCircle2} color="emerald" subtitle={`of ${dash.stats.students}`} />
          <StatCard title="Absent Today" value={dash.stats.students - dash.stats.presentToday} icon={XCircle} color="rose" subtitle="students" />
          <StatCard title="Attendance Rate" value={`${dash.stats.attendanceRate}%`} icon={CalendarCheck} color="sky" subtitle="last 30 days" />
          <StatCard title="Staff Present" value={dash.stats.staffPresentToday} icon={Users} color="violet" subtitle={`of ${dash.stats.staff}`} />
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="take">Take Attendance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="history">Student History</TabsTrigger>
          <TabsTrigger value="staff">Staff Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="take" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1">
                  <Label className="text-xs">Class</Label>
                  <Select value={classId} onValueChange={setClassId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {(classes?.items || []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
                </div>
                <div className="flex gap-2 sm:mt-5">
                  <Button variant="outline" size="sm" onClick={() => markAll('PRESENT')}>All Present</Button>
                  <Button variant="outline" size="sm" onClick={() => markAll('ABSENT')}>All Absent</Button>
                  <Button size="sm" onClick={handleSaveAttendance} disabled={createAtt.isPending}>Save</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {!classId ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Please select a class to mark attendance</CardContent></Card>
          ) : filteredStudents.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No students in this class</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Admission No</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <UserAvatar name={`${s.firstName} ${s.lastName}`} size="sm" />
                            <span className="text-sm font-medium">{s.firstName} {s.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{s.admissionNo}</TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            {['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'].map((st) => (
                              <Button
                                key={st}
                                variant={marks[s.id] === st ? 'default' : 'outline'}
                                size="sm"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleMark(s.id, st)}
                              >
                                {st === 'PRESENT' ? 'P' : st === 'ABSENT' ? 'A' : st === 'LATE' ? 'L' : 'H'}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <AttendanceAnalytics />
        </TabsContent>

        <TabsContent value="history">
          <AttendanceList />
        </TabsContent>

        <TabsContent value="staff">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>In Time</TableHead>
                    <TableHead>Out Time</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(staffAtt?.items || []).slice(0, 50).map((a) => {
                    const s = (staffList?.items || []).find((x) => x.id === a.staffId)
                    return (
                      <TableRow key={a.id}>
                        <TableCell>
                          {s ? (
                            <div className="flex items-center gap-3">
                              <UserAvatar name={`${s.firstName} ${s.lastName}`} size="sm" />
                              <div>
                                <p className="text-sm font-medium">{s.firstName} {s.lastName}</p>
                                <p className="text-xs text-muted-foreground">{s.staffId}</p>
                              </div>
                            </div>
                          ) : <span className="text-sm">-</span>}
                        </TableCell>
                        <TableCell className="text-sm">{formatDate(a.date)}</TableCell>
                        <TableCell className="text-sm">{a.inTime || '-'}</TableCell>
                        <TableCell className="text-sm">{a.outTime || '-'}</TableCell>
                        <TableCell className="text-center"><StatusBadge status={a.status} /></TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AttendanceList() {
  const { data, isLoading } = useList<any>('attendance')
  const { data: students } = useList<any>('students')
  const studentMap = new Map((students?.items || []).map((s) => [s.id, s]))

  return (
    <DataTable
      columns={[
        {
          key: 'student', header: 'Student', cell: (row) => {
            const s = studentMap.get(row.studentId)
            return s ? (
              <div className="flex items-center gap-3">
                <UserAvatar name={`${s.firstName} ${s.lastName}`} size="sm" />
                <div>
                  <p className="text-sm font-medium">{s.firstName} {s.lastName}</p>
                  <p className="text-xs text-muted-foreground">{s.admissionNo}</p>
                </div>
              </div>
            ) : <span className="text-sm">-</span>
          },
        },
        { key: 'date', header: 'Date', cell: (row) => <span className="text-sm">{formatDate(row.date)}</span> },
        { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
        { key: 'remark', header: 'Remark', cell: (row) => <span className="text-sm text-muted-foreground">{row.remark || '-'}</span> },
      ]}
      data={(data?.items || []).slice(0, 100)}
      loading={isLoading}
      getKey={(row) => row.id}
      emptyTitle="No attendance records"
    />
  )
}

function AttendanceAnalytics() {
  const { data: attendance, isLoading } = useList<any>('attendance', { limit: '500' })
  const { data: classes } = useList<any>('classes')

  const stats = useMemo(() => {
    const records = attendance?.items || []
    const total = records.length
    const present = records.filter(r => r.status === 'PRESENT').length
    const absent = records.filter(r => r.status === 'ABSENT').length
    const late = records.filter(r => r.status === 'LATE').length
    const halfDay = records.filter(r => r.status === 'HALF_DAY').length

    // Last 14 days trend
    const today = new Date()
    const trend: { name: string; present: number; absent: number; late: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const dayRecords = records.filter(r => new Date(r.date).toDateString() === d.toDateString())
      trend.push({
        name: d.toLocaleDateString('en', { day: 'numeric', month: 'short' }),
        present: dayRecords.filter(r => r.status === 'PRESENT').length,
        absent: dayRecords.filter(r => r.status === 'ABSENT').length,
        late: dayRecords.filter(r => r.status === 'LATE').length,
      })
    }

    // By class
    const byClass = (classes?.items || []).map(c => {
      const classRecords = records.filter(r => r.classId === c.id)
      const classPresent = classRecords.filter(r => r.status === 'PRESENT').length
      const rate = classRecords.length > 0 ? Math.round((classPresent / classRecords.length) * 100) : 0
      return { name: c.name, rate, total: classRecords.length }
    }).filter(c => c.total > 0)

    return { total, present, absent, late, halfDay, trend, byClass }
  }, [attendance, classes])

  const pieData = [
    { name: 'Present', value: stats.present, fill: '#10b981' },
    { name: 'Absent', value: stats.absent, fill: '#f43f5e' },
    { name: 'Late', value: stats.late, fill: '#f59e0b' },
    { name: 'Half Day', value: stats.halfDay, fill: '#0ea5e9' },
  ]

  if (isLoading) {
    return <div className="rounded-lg border p-12 text-center text-sm text-muted-foreground">Loading analytics...</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Records" value={stats.total} icon={BarChart3} color="sky" subtitle="last 30 days" />
        <StatCard title="Present" value={stats.present} icon={CheckCircle2} color="emerald" subtitle={`${stats.total > 0 ? Math.round(stats.present / stats.total * 100) : 0}% rate`} />
        <StatCard title="Absent" value={stats.absent} icon={XCircle} color="rose" subtitle={`${stats.total > 0 ? Math.round(stats.absent / stats.total * 100) : 0}% rate`} />
        <StatCard title="Late" value={stats.late} icon={Clock} color="amber" subtitle={`${stats.total > 0 ? Math.round(stats.late / stats.total * 100) : 0}% rate`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Trend chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> 14-Day Attendance Trend
            </CardTitle>
            <CardDescription>Daily present/absent/late counts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2} name="Present" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="absent" stroke="#f43f5e" strokeWidth={2} name="Absent" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="late" stroke="#f59e0b" strokeWidth={2} name="Late" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribution pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status Distribution</CardTitle>
            <CardDescription>Overall breakdown</CardDescription>
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

        {/* By class */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attendance Rate by Class</CardTitle>
            <CardDescription>Which classes have best attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.byClass} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="rate" fill="#10b981" radius={[0, 6, 6, 0]} name="Attendance %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
