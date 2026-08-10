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
import { Printer, Book, BookCheck, AlertCircle, TrendingUp, Users, RotateCcw } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { toast } from 'sonner'

export function LibraryReportModule() {
  const { data: books } = useList<any>('books')
  const { data: issues } = useList<any>('book-issues', { limit: '500' })
  const { data: students } = useList<any>('students', { limit: '500' })

  const stats = useMemo(() => {
    const totalBooks = books?.items?.length || 0
    const totalCopies = (books?.items || []).reduce((sum, b) => sum + b.totalCopies, 0)
    const availableCopies = (books?.items || []).reduce((sum, b) => sum + b.availableCopies, 0)
    const issuedCount = (issues?.items || []).filter(i => i.status === 'ISSUED' || i.status === 'OVERDUE').length
    const overdueCount = (issues?.items || []).filter(i => i.status === 'OVERDUE').length
    const totalFines = (issues?.items || []).reduce((sum, i) => sum + (i.fine || 0), 0)

    // By category
    const categoryMap: Record<string, { total: number; available: number }> = {}
    for (const b of books?.items || []) {
      if (!categoryMap[b.category]) categoryMap[b.category] = { total: 0, available: 0 }
      categoryMap[b.category].total += b.totalCopies
      categoryMap[b.category].available += b.availableCopies
    }
    const categoryData = Object.entries(categoryMap).map(([name, v]) => ({
      name,
      total: v.total,
      available: v.available,
      issued: v.total - v.available,
    }))

    // Issue status distribution
    const statusMap: Record<string, number> = {}
    for (const i of issues?.items || []) {
      statusMap[i.status] = (statusMap[i.status] || 0) + 1
    }
    const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }))

    // Popular books (most issued)
    const issueCountMap: Record<string, number> = {}
    for (const i of issues?.items || []) {
      issueCountMap[i.bookId] = (issueCountMap[i.bookId] || 0) + 1
    }
    const popularBooks = Object.entries(issueCountMap)
      .map(([bookId, count]) => ({
        book: (books?.items || []).find(b => b.id === bookId),
        issueCount: count,
      }))
      .filter(x => x.book)
      .sort((a, b) => b.issueCount - a.issueCount)
      .slice(0, 10)

    // Overdue books detail
    const overdueBooks = (issues?.items || [])
      .filter(i => i.status === 'OVERDUE')
      .map(i => {
        const book = (books?.items || []).find(b => b.id === i.bookId)
        const student = (students?.items || []).find(s => s.id === i.memberId)
        return {
          id: i.id,
          title: book?.title || 'Unknown',
          bookNo: book?.bookNo || '-',
          studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
          admissionNo: student?.admissionNo || '-',
          issueDate: i.issueDate,
          dueDate: i.dueDate,
          fine: i.fine || 0,
        }
      })

    return { totalBooks, totalCopies, availableCopies, issuedCount, overdueCount, totalFines, categoryData, statusData, popularBooks, overdueBooks }
  }, [books, issues, students])

  const PIE_COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', '#8b5cf6', '#ec4899']

  const handlePrint = () => {
    window.print()
    toast.success('Print dialog opened')
  }

  return (
    <div>
      <PageHeader
        title="Library Report"
        subtitle="Book inventory, issue analytics, and overdue tracking"
        extra={
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" /> Print Report
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Books" value={stats.totalBooks} icon={Book} color="violet" subtitle={`${stats.totalCopies} copies`} />
        <StatCard title="Available" value={stats.availableCopies} icon={Book} color="emerald" subtitle="ready to issue" />
        <StatCard title="Currently Issued" value={stats.issuedCount} icon={BookCheck} color="sky" subtitle="books out" />
        <StatCard title="Overdue" value={stats.overdueCount} icon={AlertCircle} color="rose" subtitle={`₺${stats.totalFines} fines`} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Books by Category</CardTitle>
            <CardDescription>Inventory distribution across categories</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.categoryData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="available" stackId="a" fill="#10b981" name="Available" />
                <Bar dataKey="issued" stackId="a" fill="#f59e0b" name="Issued" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Issue Status Distribution</CardTitle>
            <CardDescription>Breakdown of all book issues</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stats.statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Popular books table */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Most Popular Books
              </CardTitle>
              <CardDescription>Top 10 most issued books</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="w-12">#</TableHead>
                <TableHead>Book Title</TableHead>
                <TableHead>Book No</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Times Issued</TableHead>
                <TableHead className="text-center">Available</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.popularBooks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">No issue data available</TableCell>
                </TableRow>
              ) : (
                stats.popularBooks.map((pb, i) => (
                  <TableRow key={pb.book.id} className="hover:bg-muted/30">
                    <TableCell className="font-bold text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium text-sm">{pb.book.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{pb.book.bookNo}</TableCell>
                    <TableCell className="text-sm">{pb.book.author}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{pb.book.category}</Badge></TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="text-xs">{pb.issueCount}×</Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm">
                      <span className={pb.book.availableCopies > 0 ? 'text-emerald-600 font-medium' : 'text-rose-600'}>
                        {pb.book.availableCopies}/{pb.book.totalCopies}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Overdue books table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-500" /> Overdue Books
              </CardTitle>
              <CardDescription>Books past their due date with fines ({stats.overdueBooks.length} total)</CardDescription>
            </div>
            <Badge variant="destructive" className="text-xs">{stats.overdueBooks.length} overdue</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 sticky top-0">
                  <TableHead>Student</TableHead>
                  <TableHead>Book</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-center">Fine</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.overdueBooks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                        No overdue books! Great job.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.overdueBooks.map(o => (
                    <TableRow key={o.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={o.studentName} size="sm" />
                          <div>
                            <p className="text-sm font-medium">{o.studentName}</p>
                            <p className="text-xs text-muted-foreground">{o.admissionNo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{o.title}</p>
                          <p className="text-xs text-muted-foreground font-mono">{o.bookNo}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(o.issueDate)}</TableCell>
                      <TableCell className="text-sm text-rose-600 font-medium">{formatDate(o.dueDate)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive" className="text-xs">₺{o.fine}</Badge>
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

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
