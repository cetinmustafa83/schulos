'use client'

import { useState, useEffect } from 'react'
import { useList, useCreate, useUpdate } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatCard } from '@/components/shared/stat-card'
import { Shield, FileText, Download, Trash2, AlertCircle, CheckCircle2, Eye, Clock, Lock, FileCheck } from 'lucide-react'
import { formatDate, timeAgo } from '@/lib/constants'
import { toast } from 'sonner'

export function DataProtectionModule() {
  const [tab, setTab] = useState('overview')
  const [requestOpen, setRequestOpen] = useState(false)
  const [form, setForm] = useState({ requestType: 'EXPORT', userId: '', userEmail: '', details: '' })

  const { data: requests } = useList<any>('data-requests')
  const { data: auditLogs } = useList<any>('audit-logs', { limit: '100' })
  const createReq = useCreate('data-requests')

  const handleCreate = async () => {
    if (!form.userId || !form.userEmail) {
      toast.error('User ID and email are required')
      return
    }
    await createReq.mutateAsync(form)
    toast.success('Data request submitted. You will be notified when processed.')
    setRequestOpen(false)
    setForm({ requestType: 'EXPORT', userId: '', userEmail: '', details: '' })
  }

  return (
    <div>
      <PageHeader
        title="Data Protection (DSGVO/GDPR)"
        subtitle="EU and German data protection compliance center"
        extra={
          <Button onClick={() => setRequestOpen(true)}>
            <FileText className="h-4 w-4 mr-1" /> New Data Request
          </Button>
        }
      />

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Data Requests" value={requests?.total || 0} icon={FileText} color="sky" subtitle="total submitted" />
        <StatCard title="Pending" value={(requests?.items || []).filter(r => r.status === 'PENDING').length} icon={Clock} color="amber" subtitle="awaiting processing" />
        <StatCard title="Completed" value={(requests?.items || []).filter(r => r.status === 'COMPLETED').length} icon={CheckCircle2} color="emerald" />
        <StatCard title="Audit Entries" value={auditLogs?.total || 0} icon={Shield} color="violet" subtitle="logged actions" />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rights">Your Rights</TabsTrigger>
          <TabsTrigger value="requests">Data Requests</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                GDPR / DSGVO Compliance Status
              </CardTitle>
              <CardDescription>EU General Data Protection Regulation & German Bundesdatenschutzgesetz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ComplianceItem
                title="Lawful Basis for Processing"
                description="Data is processed based on legitimate interest, contractual necessity, and legal obligation."
                status="compliant"
              />
              <ComplianceItem
                title="Data Subject Rights"
                description="Right to access, rectification, erasure, restriction, portability, and objection are supported."
                status="compliant"
              />
              <ComplianceItem
                title="Data Breach Notification"
                description="72-hour breach notification procedure to supervisory authority is documented."
                status="compliant"
              />
              <ComplianceItem
                title="Data Retention Policy"
                description="Student records retained 10 years after departure. Financial records 6 years. Audit logs 3 years."
                status="compliant"
              />
              <ComplianceItem
                title="Cookie Consent"
                description="Cookie consent banner implemented. Users can withdraw consent at any time."
                status="compliant"
              />
              <ComplianceItem
                title="Data Encryption"
                description="All data at rest and in transit is encrypted using industry-standard protocols."
                status="compliant"
              />
              <ComplianceItem
                title="Privacy by Design"
                description="System follows privacy-by-design principles with minimal data collection."
                status="compliant"
              />
              <ComplianceItem
                title="Records of Processing Activities"
                description="Processing activities are documented per Art. 30 GDPR requirements."
                status="compliant"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data We Process</CardTitle>
              <CardDescription>Categories of personal data and their purpose</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { category: 'Student Personal Data', purpose: 'Educational administration', retention: '10 years after departure', lawful: 'Contractual necessity' },
                  { category: 'Parent/Guardian Data', purpose: 'Communication and billing', retention: 'Until student leaves', lawful: 'Contractual necessity' },
                  { category: 'Staff Data', purpose: 'Employment administration', retention: '6 years after departure', lawful: 'Legal obligation' },
                  { category: 'Financial Data', purpose: 'Fee collection and accounting', retention: '6 years', lawful: 'Legal obligation' },
                  { category: 'Attendance Data', purpose: 'Educational tracking', retention: '5 years', lawful: 'Legitimate interest' },
                  { category: 'Exam Results', purpose: 'Academic records', retention: '10 years', lawful: 'Legitimate interest' },
                  { category: 'IP & Device Data', purpose: 'Security and audit', retention: '3 years', lawful: 'Legitimate interest' },
                ].map((d, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg border p-3">
                    <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{d.category}</p>
                        <Badge variant="outline" className="text-[10px]">{d.lawful}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{d.purpose}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Retention: {d.retention}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rights" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: 'Right to Access (Art. 15)', desc: 'You can request a copy of all personal data we hold about you.', icon: Eye, action: 'Export Data' },
              { title: 'Right to Rectification (Art. 16)', desc: 'You can request correction of inaccurate or incomplete data.', icon: FileCheck, action: 'Request Correction' },
              { title: 'Right to Erasure (Art. 17)', desc: 'You can request deletion of your personal data (right to be forgotten).', icon: Trash2, action: 'Request Deletion' },
              { title: 'Right to Portability (Art. 20)', desc: 'You can receive your data in a structured, machine-readable format.', icon: Download, action: 'Export Data' },
            ].map((right, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <right.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{right.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{right.desc}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setRequestOpen(true)}>
                    {right.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Response Time</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Per GDPR Article 12, we respond to data requests within <span className="font-medium">one month</span>.
                    Complex requests may be extended by two further months. You will be informed of any extension.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <DataTable
            columns={[
              { key: 'userEmail', header: 'Email', cell: (row) => <span className="text-sm font-medium">{row.userEmail}</span> },
              { key: 'requestType', header: 'Type', cell: (row) => (
                <Badge variant="outline" className={row.requestType === 'DELETE' ? 'text-rose-600' : row.requestType === 'EXPORT' ? 'text-sky-600' : 'text-amber-600'}>
                  {row.requestType}
                </Badge>
              ) },
              { key: 'details', header: 'Details', cell: (row) => <span className="text-sm text-muted-foreground truncate">{row.details || '-'}</span> },
              { key: 'status', header: 'Status', cell: (row) => (
                <Badge variant="outline" className={
                  row.status === 'COMPLETED' ? 'text-emerald-600' :
                  row.status === 'PROCESSING' ? 'text-sky-600' :
                  row.status === 'REJECTED' ? 'text-rose-600' : 'text-amber-600'
                }>{row.status}</Badge>
              ) },
              { key: 'createdAt', header: 'Submitted', cell: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span> },
              { key: 'resolvedAt', header: 'Resolved', cell: (row) => <span className="text-sm text-muted-foreground">{row.resolvedAt ? formatDate(row.resolvedAt) : '-'}</span> },
            ]}
            data={requests?.items || []}
            getKey={(row) => row.id}
            emptyTitle="No data requests yet"
            emptyDescription="Submit a data request to exercise your GDPR rights"
          />
        </TabsContent>

        <TabsContent value="audit">
          <DataTable
            columns={[
              { key: 'action', header: 'Action', cell: (row) => (
                <Badge variant="outline" className={
                  row.action === 'DELETE' ? 'text-rose-600' :
                  row.action === 'CREATE' ? 'text-emerald-600' :
                  row.action === 'UPDATE' ? 'text-sky-600' :
                  row.action === 'LOGIN' ? 'text-violet-600' : 'text-amber-600'
                }>{row.action}</Badge>
              ) },
              { key: 'entity', header: 'Entity', cell: (row) => <span className="text-sm font-medium">{row.entity}</span> },
              { key: 'userRole', header: 'Role', cell: (row) => <span className="text-sm text-muted-foreground">{row.userRole || '-'}</span> },
              { key: 'details', header: 'Details', cell: (row) => <span className="text-sm text-muted-foreground truncate max-w-xs block">{row.details || '-'}</span> },
              { key: 'ipAddress', header: 'IP', cell: (row) => <span className="text-xs font-mono text-muted-foreground">{row.ipAddress || '-'}</span> },
              { key: 'createdAt', header: 'Time', cell: (row) => (
                <div>
                  <p className="text-sm">{formatDate(row.createdAt)}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(row.createdAt)}</p>
                </div>
              ) },
            ]}
            data={auditLogs?.items || []}
            getKey={(row) => row.id}
            emptyTitle="No audit entries"
            pageSize={15}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Data Retention Settings</CardTitle>
              <CardDescription>Automatic data deletion schedules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Student Records', value: '10 years', desc: 'After student departure' },
                { label: 'Staff Records', value: '6 years', desc: 'After staff departure' },
                { label: 'Financial Records', value: '6 years', desc: 'Per tax regulations' },
                { label: 'Attendance Logs', value: '5 years', desc: 'Academic archive' },
                { label: 'Audit Logs', value: '3 years', desc: 'Security compliance' },
                { label: 'Exam Results', value: '10 years', desc: 'Academic archive' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                  <Badge variant="outline">{s.value}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cookie Preferences</CardTitle>
              <CardDescription>Manage your cookie consent settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: 'necessary', label: 'Necessary', desc: 'Essential for site functionality. Always enabled.', required: true, enabled: true },
                { key: 'preferences', label: 'Preferences', desc: 'Remember your settings and preferences.', required: false, enabled: false },
                { key: 'statistics', label: 'Statistics', desc: 'Anonymous usage data to improve the site.', required: false, enabled: false },
                { key: 'marketing', label: 'Marketing', desc: 'Used to display relevant advertisements.', required: false, enabled: false },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{c.label}</p>
                      {c.required && <Badge variant="secondary" className="text-[10px]">Required</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.desc}</p>
                  </div>
                  <Switch defaultChecked={c.enabled} disabled={c.required} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data request dialog */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Data Request</DialogTitle>
            <DialogDescription className="sr-only">Submit a GDPR data request</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">Request Type</Label>
              <Select value={form.requestType} onValueChange={(v) => setForm({ ...form, requestType: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPORT">Data Export (Portability)</SelectItem>
                  <SelectItem value="DELETE">Data Deletion (Right to be Forgotten)</SelectItem>
                  <SelectItem value="CORRECTION">Data Correction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Your User ID</Label>
              <Input value={form.userId} onChange={(e) => setForm({ ...form, userId: e.target.value })} placeholder="Enter your user ID" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm">Email Address</Label>
              <Input type="email" value={form.userEmail} onChange={(e) => setForm({ ...form, userEmail: e.target.value })} placeholder="your.email@example.com" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm">Details (optional)</Label>
              <Textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Provide any additional details about your request..." rows={3} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createReq.isPending}>
              {createReq.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ComplianceItem({ title, description, status }: { title: string; description: string; status: 'compliant' | 'warning' | 'pending' }) {
  const colors = {
    compliant: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
    warning: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
    pending: 'bg-sky-100 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400',
  }
  const icons = {
    compliant: CheckCircle2,
    warning: AlertCircle,
    pending: Clock,
  }
  const Icon = icons[status]
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className={`rounded-lg p-2 shrink-0 ${colors[status]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{title}</p>
          <Badge variant="outline" className={`text-[10px] capitalize ${colors[status]}`}>{status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
}
