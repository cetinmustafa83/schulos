'use client'

import { useState } from 'react'
import { useList } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { ResourceModule, col } from '@/components/shared/resource-module'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/shared/stat-card'
import { UserAvatar } from '@/components/shared/user-avatar'
import { formatDate } from '@/lib/constants'
import { Users, Phone, Mail, FileText, AlertCircle, Bell } from 'lucide-react'
import { useDashboard } from '@/hooks/use-data'

export function FrontOfficeModule() {
  const [tab, setTab] = useState('queries')
  const { data: dash } = useDashboard()

  return (
    <div>
      <PageHeader title="Front Office" subtitle="Admission queries, visitors and front desk logs" />
      {dash && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard title="Pending Queries" value={dash.stats.pendingQueries} icon={Bell} color="amber" />
          <StatCard title="Today Visitors" value={5} icon={Users} color="sky" />
          <StatCard title="Open Complaints" value={2} icon={AlertCircle} color="rose" />
          <StatCard title="Total Calls" value={8} icon={Phone} color="violet" />
        </div>
      )}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="queries">Admission Queries</TabsTrigger>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="logs">Front Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="queries">
          <ResourceModule
            resourceKey="queries"
            title="Admission Queries"
            subtitle="Admission enquiries from prospective parents"
            addLabel="Add Query"
            columns={[
              { key: 'name', header: 'Name', cell: (row) => (
                <div className="flex items-center gap-3">
                  <UserAvatar name={row.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.phone}</p>
                  </div>
                </div>
              ) },
              col.text('classApplied', 'Class'),
              col.text('source', 'Source'),
              col.date('followUpDate', 'Follow Up'),
              col.badge('status', 'Status'),
            ]}
            fields={[
              { name: 'name', label: 'Name', type: 'text', required: true },
              { name: 'phone', label: 'Phone', type: 'tel', required: true },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'classApplied', label: 'Class Applied', type: 'text' },
              { name: 'source', label: 'Source', type: 'select', options: [
                { value: 'Website', label: 'Website' },
                { value: 'Walk-in', label: 'Walk-in' },
                { value: 'Referral', label: 'Referral' },
                { value: 'Newspaper Ad', label: 'Newspaper Ad' },
              ]},
              { name: 'status', label: 'Status', type: 'select', options: [
                { value: 'NEW', label: 'New' },
                { value: 'FOLLOW_UP', label: 'Follow Up' },
                { value: 'CONVERTED', label: 'Converted' },
                { value: 'LOST', label: 'Lost' },
              ], default: 'NEW' },
              { name: 'followUpDate', label: 'Follow Up Date', type: 'date' },
              { name: 'notes', label: 'Notes', type: 'textarea', fullWidth: true },
            ]}
          />
        </TabsContent>
        <TabsContent value="visitors">
          <ResourceModule
            resourceKey="visitors"
            title="Visitor Book"
            subtitle="Track visitors to the school"
            addLabel="Add Visitor"
            columns={[
              col.text('name', 'Visitor'),
              col.text('phone', 'Phone'),
              col.text('purpose', 'Purpose'),
              col.text('whomToMeet', 'To Meet'),
              col.text('inTime', 'In Time'),
              col.text('outTime', 'Out Time'),
              col.date('date', 'Date'),
            ]}
            fields={[
              { name: 'name', label: 'Name', type: 'text', required: true },
              { name: 'phone', label: 'Phone', type: 'tel' },
              { name: 'purpose', label: 'Purpose', type: 'text', required: true },
              { name: 'whomToMeet', label: 'Whom to Meet', type: 'text' },
              { name: 'inTime', label: 'In Time', type: 'text', placeholder: 'HH:MM' },
              { name: 'outTime', label: 'Out Time', type: 'text', placeholder: 'HH:MM' },
            ]}
          />
        </TabsContent>
        <TabsContent value="logs">
          <ResourceModule
            resourceKey="front-logs"
            title="Front Desk Logs"
            subtitle="Phone calls, postal and complaints"
            addLabel="Add Log"
            columns={[
              {
                key: 'type', header: 'Type', cell: (row) => {
                  const colors: Record<string, string> = {
                    PHONE_CALL: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
                    POSTAL_RECEIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                    POSTAL_DISPATCH: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
                    COMPLAIN: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
                  }
                  return <Badge variant="outline" className={colors[row.type]}>{row.type.replace(/_/g, ' ')}</Badge>
                },
              },
              col.text('title', 'Title'),
              col.text('person', 'Person'),
              col.date('date', 'Date'),
              col.badge('status', 'Status'),
            ]}
            fields={[
              { name: 'type', label: 'Type', type: 'select', options: [
                { value: 'PHONE_CALL', label: 'Phone Call' },
                { value: 'POSTAL_RECEIVE', label: 'Postal Receive' },
                { value: 'POSTAL_DISPATCH', label: 'Postal Dispatch' },
                { value: 'COMPLAIN', label: 'Complaint' },
              ]},
              { name: 'title', label: 'Title', type: 'text', required: true, fullWidth: true },
              { name: 'person', label: 'Person', type: 'text' },
              { name: 'status', label: 'Status', type: 'select', options: [
                { value: 'PENDING', label: 'Pending' },
                { value: 'RESOLVED', label: 'Resolved' },
              ], default: 'PENDING' },
              { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
