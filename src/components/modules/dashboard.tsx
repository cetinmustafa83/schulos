'use client'

import { useDashboard } from '@/hooks/use-data'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/shared/status-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { LoadingState, ErrorState } from '@/components/shared/states'
import { formatCurrency, formatDate, timeAgo, initials, getAvatarColor, NOTICE_CATEGORIES } from '@/lib/constants'
import { useUI } from '@/store/ui'
import { motion } from 'framer-motion'
import {
  Users, GraduationCap, DollarSign, TrendingUp, Wallet,
  BookOpen, Bus, Bed, Bell, Calendar, FileText, Bus as BusIcon,
  ArrowUpRight, ArrowDownRight, Activity, ClipboardList,
  Megaphone, CalendarDays, Banknote, type LucideIcon,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts'

const PIE_COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', '#8b5cf6']

export function DashboardModule() {
  const { data, isLoading, error, refetch } = useDashboard()
  const { setModule, role } = useUI()

  if (isLoading) return <LoadingState message="Loading dashboard..." />
  if (error || !data) return <ErrorState message={error?.message || 'Failed to load'} onRetry={() => refetch()} />

  const { stats, charts, recent } = data

  const roleLabels: Record<string, string> = {
    ADMIN: 'Administrator',
    TEACHER: 'Teacher',
    STUDENT: 'Student',
    PARENT: 'Parent',
    ACCOUNTANT: 'Accountant',
    LIBRARIAN: 'Librarian',
  }

  const roleMessage: Record<string, string> = {
    ADMIN: `You have ${stats.pendingLeaves} pending leave requests and ${stats.overdueCount} overdue invoices to review.`,
    TEACHER: `You have 5 classes today and 3 homework submissions to review.`,
    STUDENT: `You have 2 pending homework assignments and 1 exam scheduled this week.`,
    PARENT: `Your child has ${stats.attendanceRate}% attendance rate this month.`,
    ACCOUNTANT: `${formatCurrency(stats.pendingFees)} in pending fees and ${stats.overdueCount} overdue invoices.`,
    LIBRARIAN: `${stats.issuedBooks} books currently issued and ${stats.overdueBooks} overdue.`,
  }

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary via-primary to-primary/70 text-primary-foreground">
          <CardContent className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
              <div>
                <p className="text-sm opacity-90">Welcome back, {roleLabels[role] || 'User'} 👋</p>
                <h2 className="text-2xl lg:text-3xl font-bold mt-1">Atatürk Anatolian High School</h2>
                <p className="text-sm opacity-90 mt-2 max-w-lg">
                  {roleMessage[role] || roleMessage.ADMIN}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <Button variant="secondary" size="sm" onClick={() => setModule('students')}>
                    <GraduationCap className="h-4 w-4 mr-1" /> View Students
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setModule('fees')} className="bg-white/20 hover:bg-white/30 text-white">
                    <DollarSign className="h-4 w-4 mr-1" /> Fees Overview
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 min-w-[280px]">
                <div className="rounded-xl bg-white/10 backdrop-blur p-4">
                  <p className="text-xs opacity-80">Today Present</p>
                  <p className="text-2xl font-bold mt-1">{stats.presentToday}<span className="text-sm opacity-70">/{stats.students}</span></p>
                </div>
                <div className="rounded-xl bg-white/10 backdrop-blur p-4">
                  <p className="text-xs opacity-80">Staff Today</p>
                  <p className="text-2xl font-bold mt-1">{stats.staffPresentToday}<span className="text-sm opacity-70">/{stats.staff}</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={stats.students} icon={GraduationCap} color="sky" subtitle={`${stats.totalStudents - stats.students} disabled`} />
        <StatCard title="Teaching Staff" value={stats.staff} icon={Users} color="emerald" subtitle={`${stats.departments} departments`} />
        <StatCard title="Fees Collected" value={formatCurrency(stats.collectedFees)} icon={DollarSign} color="violet" subtitle={`of ${formatCurrency(stats.totalFees)}`} />
        <StatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} icon={Activity} color="teal" subtitle="last 30 days" />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Pending Fees" value={formatCurrency(stats.pendingFees)} icon={Wallet} color="rose" subtitle={`${stats.overdueCount} overdue`} />
        <StatCard title="Monthly Income" value={formatCurrency(stats.income)} icon={TrendingUp} color="emerald" trend={{ value: 8.2, label: 'vs last month' }} />
        <StatCard title="Monthly Expense" value={formatCurrency(stats.expense)} icon={Banknote} color="amber" trend={{ value: -3.1, label: 'vs last month' }} />
        <StatCard title="Pending Salary" value={formatCurrency(stats.pendingSalary)} icon={Wallet} color="orange" subtitle={`of ${formatCurrency(stats.totalSalary)}`} />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Income vs Expense */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Financial Overview</CardTitle>
                <CardDescription>Income vs Expense - last 6 months</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                Profit: {formatCurrency(charts.collectionByMonth.reduce((s, m) => s + m.income - m.expense, 0))}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={charts.collectionByMonth}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} className="text-muted-foreground" />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} fill="url(#expenseGrad)" name="Expense" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Fee Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fee Status</CardTitle>
            <CardDescription>Invoice distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Paid', value: charts.feeStatus.paid, color: '#10b981' },
                    { name: 'Unpaid', value: charts.feeStatus.unpaid, color: '#f43f5e' },
                    { name: 'Partial', value: charts.feeStatus.partial, color: '#f59e0b' },
                    { name: 'Overdue', value: charts.feeStatus.overdue, color: '#0ea5e9' },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {PIE_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Students per class + Gender */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Students per Class</CardTitle>
            <CardDescription>Distribution across all classes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts.studentsPerClass}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gender Distribution</CardTitle>
            <CardDescription>Students by gender</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Male', value: charts.maleStudents, color: '#0ea5e9' },
                      { name: 'Female', value: charts.femaleStudents, color: '#ec4899' },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                  >
                    <Cell fill="#0ea5e9" />
                    <Cell fill="#ec4899" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-sky-500" />
                  <span className="text-sm text-muted-foreground">Male</span>
                </div>
                <p className="text-xl font-bold mt-1">{charts.maleStudents}</p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-pink-500" />
                  <span className="text-sm text-muted-foreground">Female</span>
                </div>
                <p className="text-xl font-bold mt-1">{charts.femaleStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats: Library, Transport, etc */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="Library Books" value={stats.totalBooks} icon={BookOpen} color="violet" subtitle={`${stats.availableBooks} available`} />
        <StatCard title="Issued Books" value={stats.issuedBooks} icon={BookOpen} color="amber" subtitle={`${stats.overdueBooks} overdue`} />
        <StatCard title="Vehicles" value={stats.vehicles} icon={BusIcon} color="teal" subtitle={`${stats.routes} routes`} />
        <StatCard title="Pending Queries" value={stats.pendingQueries} icon={Bell} color="rose" subtitle="admission enquiries" />
      </div>

      {/* Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Notices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" />
                <div>
                  <CardTitle className="text-base">Recent Notices</CardTitle>
                  <CardDescription>Latest announcements</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setModule('communication')}>View all</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-80">
              <div className="space-y-3">
                {recent.notices.map((n: any) => {
                  const cat = NOTICE_CATEGORIES.find((c) => c.value === n.category)
                  return (
                    <div key={n.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className={`rounded-lg p-2 ${cat?.color || 'bg-muted'}`}>
                        <Megaphone className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-medium truncate">{n.title}</p>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 shrink-0">{n.audience}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{n.content}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo(n.publishDate)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="h-4 w-4 text-primary" />
                <div>
                  <CardTitle className="text-base">Recent Transactions</CardTitle>
                  <CardDescription>Latest financial activity</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setModule('accounts')}>View all</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-80">
              <div className="space-y-3">
                {recent.transactions.map((t: any) => (
                  <div key={t.id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                    <div className={`rounded-lg p-2 ${t.type === 'INCOME' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400'}`}>
                      {t.type === 'INCOME' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.category}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-semibold ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(t.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Admissions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" />
                <div>
                  <CardTitle className="text-base">Recent Admissions</CardTitle>
                  <CardDescription>Newly admitted students</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setModule('students')}>View all</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent.admissions.map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                  <UserAvatar name={s.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.admissionNo} • {s.class}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{timeAgo(s.date)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <div>
                  <CardTitle className="text-base">Upcoming Events</CardTitle>
                  <CardDescription>Events in the near future</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setModule('communication')}>Calendar</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent.todayEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">No upcoming events</p>
              )}
              {recent.todayEvents.map((e: any) => (
                <div key={e.id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                  <div className={`rounded-lg p-2 ${e.type === 'HOLIDAY' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' : 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400'}`}>
                    <CalendarDays className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{e.location || (e.type === 'HOLIDAY' ? 'School Holiday' : 'School Event')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{formatDate(e.startDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Homework & Visitors */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Recent Homework</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setModule('homework')}>View all</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent.homework.map((h: any) => (
                <div key={h.id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                  <div className="rounded-lg p-2 bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{h.title}</p>
                    <p className="text-xs text-muted-foreground">Due: {formatDate(h.dueDate)}</p>
                  </div>
                  <StatusBadge status={h.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Recent Visitors</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setModule('front-office')}>Front office</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent.visitors.map((v: any) => (
                <div key={v.id} className="flex items-center gap-3 pb-3 border-b last:border-0">
                  <UserAvatar name={v.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{v.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{v.purpose}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{v.inTime} - {v.outTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="overflow-hidden border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Frequently used shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Add Student', icon: GraduationCap, color: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400', module: 'students' },
              { label: 'Take Attendance', icon: ClipboardList, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400', module: 'attendance' },
              { label: 'Record Fees', icon: DollarSign, color: 'bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400', module: 'fees' },
              { label: 'Add Notice', icon: Megaphone, color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400', module: 'communication' },
              { label: 'Schedule Exam', icon: FileText, color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400', module: 'exams' },
              { label: 'View Reports', icon: Activity, color: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400', module: 'reports' },
            ].map((a) => {
              const Icon = a.icon
              return (
                <button
                  key={a.label}
                  onClick={() => setModule(a.module)}
                  className="group flex flex-col items-center gap-2 rounded-xl border p-3 hover:border-primary/40 hover:shadow-md transition-all"
                >
                  <div className={`rounded-lg p-2.5 ${a.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-center">{a.label}</span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
