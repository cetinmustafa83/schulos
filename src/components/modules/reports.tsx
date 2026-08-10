'use client'

import { useDashboard } from '@/hooks/use-data'
import { useList } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LoadingState, ErrorState } from '@/components/shared/states'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/shared/stat-card'
import { formatCurrency } from '@/lib/constants'
import { GraduationCap, DollarSign, Users, Activity, TrendingUp, Wallet, Banknote, BookOpen } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar,
} from 'recharts'

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', '#8b5cf6', '#ec4899']

export function ReportsModule() {
  const { data, isLoading, error, refetch } = useDashboard()
  const { data: students } = useList<any>('students')
  const { data: invoices } = useList<any>('invoices')

  if (isLoading) return <LoadingState message="Loading reports..." />
  if (error || !data) return <ErrorState message={error?.message || 'Failed to load'} onRetry={() => refetch()} />

  const { stats, charts } = data

  // Performance by subject (mock from marks)
  const subjectPerf = [
    { subject: 'Math', avg: 78 },
    { subject: 'English', avg: 82 },
    { subject: 'Science', avg: 75 },
    { subject: 'History', avg: 80 },
    { subject: 'Computer', avg: 88 },
    { subject: 'Physics', avg: 72 },
  ]

  // Class strength
  const classStrength = charts.studentsPerClass

  // Fee collection rate
  const collectionRate = stats.totalFees > 0 ? Math.round((stats.collectedFees / stats.totalFees) * 100) : 0

  // Gender ratio
  const genderData = [
    { name: 'Male', value: charts.maleStudents, fill: '#0ea5e9' },
    { name: 'Female', value: charts.femaleStudents, fill: '#ec4899' },
  ]

  // Attendance distribution
  const attendanceData = [{ name: 'Attendance', value: stats.attendanceRate, fill: '#10b981' }]

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" subtitle="Comprehensive insights and statistics" />

      {/* Summary stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={stats.students} icon={GraduationCap} color="sky" />
        <StatCard title="Total Revenue" value={formatCurrency(stats.collectedFees)} icon={DollarSign} color="emerald" />
        <StatCard title="Collection Rate" value={`${collectionRate}%`} icon={TrendingUp} color="violet" />
        <StatCard title="Attendance" value={`${stats.attendanceRate}%`} icon={Activity} color="teal" />
      </div>

      <Tabs defaultValue="academic">
        <TabsList>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="academic" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Class Strength Distribution</CardTitle>
                <CardDescription>Students enrolled in each class</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={classStrength} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[0, 6, 6, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subject Performance</CardTitle>
                <CardDescription>Average marks by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={subjectPerf}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Bar dataKey="avg" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Avg %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance Overview</CardTitle>
              <CardDescription>Overall attendance rate this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={250}>
                  <RadialBarChart innerRadius="60%" outerRadius="100%" data={attendanceData} startAngle={180} endAngle={0}>
                    <RadialBar background dataKey="value" cornerRadius={10} fill="#10b981" />
                    <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground" style={{ fontSize: '28px', fontWeight: 'bold' }}>
                      {stats.attendanceRate}%
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finance" className="space-y-4">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Billed" value={formatCurrency(stats.totalFees)} icon={Wallet} color="violet" />
            <StatCard title="Collected" value={formatCurrency(stats.collectedFees)} icon={DollarSign} color="emerald" />
            <StatCard title="Pending" value={formatCurrency(stats.pendingFees)} icon={Wallet} color="rose" />
            <StatCard title="Monthly Profit" value={formatCurrency(stats.profit)} icon={Banknote} color={stats.profit >= 0 ? 'emerald' : 'rose'} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Income vs Expense</CardTitle>
              <CardDescription>Last 6 months trend</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={charts.collectionByMonth}>
                  <defs>
                    <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#inc)" strokeWidth={2} name="Income" />
                  <Area type="monotone" dataKey="expense" stroke="#f43f5e" fill="url(#exp)" strokeWidth={2} name="Expense" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fee Status Breakdown</CardTitle>
              <CardDescription>Distribution of all invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Paid', value: charts.feeStatus.paid },
                      { name: 'Unpaid', value: charts.feeStatus.unpaid },
                      { name: 'Partial', value: charts.feeStatus.partial },
                      { name: 'Overdue', value: charts.feeStatus.overdue },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(e: any) => `${e.name}: ${e.value}`}
                  >
                    {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Gender Distribution</CardTitle>
                <CardDescription>Male vs Female students</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {genderData.map((g, i) => <Cell key={i} fill={g.fill} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Category Distribution</CardTitle>
                <CardDescription>Students by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={[
                    { name: 'General', count: 95 },
                    { name: 'OBC', count: 68 },
                    { name: 'SC', count: 32 },
                    { name: 'ST', count: 25 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">Library Statistics</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-lg border p-4">
                  <BookOpen className="h-5 w-5 text-violet-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.totalBooks}</p>
                  <p className="text-xs text-muted-foreground">Total Books</p>
                </div>
                <div className="rounded-lg border p-4">
                  <BookOpen className="h-5 w-5 text-emerald-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.availableBooks}</p>
                  <p className="text-xs text-muted-foreground">Available</p>
                </div>
                <div className="rounded-lg border p-4">
                  <BookOpen className="h-5 w-5 text-amber-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.issuedBooks}</p>
                  <p className="text-xs text-muted-foreground">Issued</p>
                </div>
                <div className="rounded-lg border p-4">
                  <BookOpen className="h-5 w-5 text-rose-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.overdueBooks}</p>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
