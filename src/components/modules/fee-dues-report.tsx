'use client'

import { useState, useMemo } from 'react'
import { useList } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatCard } from '@/components/shared/stat-card'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Printer, DollarSign, AlertCircle, Wallet, TrendingDown, Users } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { toast } from 'sonner'

export function FeeDuesReportModule() {
  const { data: invoices } = useList<any>('invoices', { limit: '500' })
  const { data: students } = useList<any>('students', { limit: '500' })
  const { data: classes } = useList<any>('classes')

  const stats = useMemo(() => {
    const allInvoices = invoices?.items || []
    const totalAmount = allInvoices.reduce((s, i) => s + i.amount, 0)
    const totalCollected = allInvoices.reduce((s, i) => s + i.paidAmount, 0)
    const totalDues = totalAmount - totalCollected
    const overdueInvoices = allInvoices.filter(i => i.status === 'OVERDUE' || (i.status === 'UNPAID' && new Date(i.dueDate) < new Date()))
    const overdueAmount = overdueInvoices.reduce((s, i) => s + (i.amount - i.paidAmount), 0)
    const studentsWithDues = new Set(allInvoices.filter(i => i.paidAmount < i.amount).map(i => i.studentId)).size

    // By status
    const statusMap: Record<string, number> = {}
    for (const i of allInvoices) {
      statusMap[i.status] = (statusMap[i.status] || 0) + 1
    }
    const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }))

    // Class-wise dues
    const classDues = (classes?.items || []).map(c => {
      const cInvoices = allInvoices.filter(i => i.classId === c.id)
      const cTotal = cInvoices.reduce((s, i) => s + i.amount, 0)
      const cCollected = cInvoices.reduce((s, i) => s + i.paidAmount, 0)
      const cDues = cTotal - cCollected
      return {
        name: c.name,
        collected: cCollected,
        dues: cDues,
        total: cTotal,
        studentCount: new Set(cInvoices.map(i => i.studentId)).size,
      }
    }).filter(c => c.total > 0)

    // Student-wise dues (top 20)
    const studentMap = new Map((students?.items || []).map(s => [s.id, s]))
    const studentDues = allInvoices
      .filter(i => i.paidAmount < i.amount)
      .map(i => {
        const student = studentMap.get(i.studentId)
        return {
          id: i.id,
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
          admissionNo: student?.admissionNo || '-',
          className: student?.className || '-',
          invoiceNo: i.invoiceNo,
          feeType: i.feeType,
          amount: i.amount,
          paid: i.paidAmount,
          due: i.amount - i.paidAmount,
          dueDate: i.dueDate,
          status: i.status,
          isOverdue: new Date(i.dueDate) < new Date() && i.status !== 'PAID',
        }
      })
      .sort((a, b) => b.due - a.due)

    return { totalAmount, totalCollected, totalDues, overdueCount: overdueInvoices.length, overdueAmount, studentsWithDues, statusData, classDues, studentDues }
  }, [invoices, students, classes])

  const PIE_COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#0ea5e9']

  const handlePrint = () => {
    window.print()
    toast.success('Print dialog opened')
  }

  return (
    <div>
      <PageHeader
        title="Fee Dues Report"
        subtitle="Outstanding fees, overdue invoices, and collection analytics"
        extra={
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" /> Print Report
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Billed" value={formatCurrency(stats.totalAmount)} icon={DollarSign} color="violet" />
        <StatCard title="Collected" value={formatCurrency(stats.totalCollected)} icon={Wallet} color="emerald" />
        <StatCard title="Total Dues" value={formatCurrency(stats.totalDues)} icon={TrendingDown} color="rose" subtitle={`${stats.studentsWithDues} students`} />
        <StatCard title="Overdue" value={stats.overdueCount} icon={AlertCircle} color="amber" subtitle={formatCurrency(stats.overdueAmount)} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Class-wise Collection vs Dues</CardTitle>
            <CardDescription>Fee status breakdown by class</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.classDues}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="collected" stackId="a" fill="#10b981" name="Collected" />
                <Bar dataKey="dues" stackId="a" fill="#f43f5e" name="Dues" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Invoice Status Distribution</CardTitle>
            <CardDescription>Breakdown of all invoices by status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={stats.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                  {stats.statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Class-wise summary */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Class-wise Fee Summary</CardTitle>
          <CardDescription>Collection performance by class</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Class</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead className="text-right">Total Billed</TableHead>
                <TableHead className="text-right">Collected</TableHead>
                <TableHead className="text-right">Dues</TableHead>
                <TableHead className="text-center">Collection Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.classDues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No invoice data available</TableCell>
                </TableRow>
              ) : (
                stats.classDues.map(c => {
                  const rate = c.total > 0 ? Math.round((c.collected / c.total) * 100) : 0
                  return (
                    <TableRow key={c.name} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-center text-sm">{c.studentCount}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(c.total)}</TableCell>
                      <TableCell className="text-right text-sm text-emerald-600 font-medium">{formatCurrency(c.collected)}</TableCell>
                      <TableCell className="text-right text-sm text-rose-600 font-medium">{formatCurrency(c.dues)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={rate >= 75 ? 'text-emerald-600' : rate >= 50 ? 'text-amber-600' : 'text-rose-600'}>
                          {rate}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Student-wise dues */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Outstanding Dues by Student
              </CardTitle>
              <CardDescription>Students with unpaid fees ({stats.studentDues.length} invoices)</CardDescription>
            </div>
            <Badge variant="destructive" className="text-xs">{formatCurrency(stats.totalDues)} total dues</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 sticky top-0">
                  <TableHead>Student</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Due</TableHead>
                  <TableHead className="text-center">Due Date</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.studentDues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">All fees are paid! 🎉</TableCell>
                  </TableRow>
                ) : (
                  stats.studentDues.slice(0, 100).map(s => (
                    <TableRow key={s.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={s.studentName} size="sm" />
                          <div>
                            <p className="text-sm font-medium">{s.studentName}</p>
                            <p className="text-xs text-muted-foreground">{s.admissionNo} · {s.className}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono">{s.invoiceNo}</TableCell>
                      <TableCell className="text-sm">{s.feeType}</TableCell>
                      <TableCell className="text-right text-sm">{formatCurrency(s.amount)}</TableCell>
                      <TableCell className="text-right text-sm text-emerald-600">{formatCurrency(s.paid)}</TableCell>
                      <TableCell className="text-right text-sm font-semibold text-rose-600">{formatCurrency(s.due)}</TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">{formatDate(s.dueDate)}</TableCell>
                      <TableCell className="text-center">
                        {s.isOverdue ? (
                          <Badge variant="destructive" className="text-xs">Overdue</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-amber-600">{s.status}</Badge>
                        )}
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
