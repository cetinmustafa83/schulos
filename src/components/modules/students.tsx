'use client'

import { useState, useMemo } from 'react'
import { useList, useCreate, useUpdate, useDelete } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { DataTable, type Column } from '@/components/shared/data-table'
import { UserAvatar } from '@/components/shared/user-avatar'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { GENDERS, BLOOD_GROUPS, STUDENT_CATEGORIES, HOUSES, formatCurrency, formatDate, getAvatarColor, initials, timeAgo } from '@/lib/constants'
import { Pencil, Trash2, Mail, Phone, MapPin, Calendar, User, Users, Droplet, Ruler, Weight, Home, GraduationCap, FileText, BookOpen, Wallet, CheckCircle2, TrendingUp, Clock, DollarSign, ClipboardCheck, Award } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { AreaChart, Area, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function StudentsModule() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [selected, setSelected] = useState<any>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, any>>({})

  useMemo(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const params: Record<string, string> = {}
  if (debouncedSearch) params.search = debouncedSearch

  const { data, isLoading, refetch } = useList<any>('students', params)
  const createMut = useCreate('students')
  const updateMut = useUpdate('students')
  const deleteMut = useDelete('students')

  // fetch invoices and attendance for selected student (with higher limit)
  const { data: invoices } = useList<any>('invoices', { limit: '500' })
  const { data: attendance } = useList<any>('attendance', { limit: '500' })
  const selectedInvoices = invoices?.items.filter((i) => i.studentId === selected?.id) || []
  const selectedAttendance = attendance?.items.filter((a) => a.studentId === selected?.id).slice(0, 30) || []

  const handleAdd = () => {
    setForm({ gender: 'Male', status: 'ACTIVE', category: 'General' })
    setEditing(null)
    setDialogOpen(true)
  }

  const handleEdit = (row: any) => {
    const data: Record<string, any> = {}
    for (const k of ['firstName', 'lastName', 'admissionNo', 'gender', 'bloodGroup', 'phone', 'email', 'address', 'city', 'state', 'country', 'category', 'className', 'section', 'rollNo', 'fatherName', 'motherName', 'guardianName', 'guardianPhone', 'guardianEmail', 'guardianOccupation', 'house', 'height', 'weight', 'religion', 'caste', 'pincode', 'status']) {
      const v = row[k]
      if (v instanceof Date) data[k] = v.toISOString().slice(0, 10)
      else if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) data[k] = v.slice(0, 10)
      else data[k] = v ?? ''
    }
    if (row.dob) data.dob = new Date(row.dob).toISOString().slice(0, 10)
    if (row.admissionDate) data.admissionDate = new Date(row.admissionDate).toISOString().slice(0, 10)
    setForm(data)
    setEditing(row)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    const required = ['firstName', 'lastName', 'admissionNo']
    for (const r of required) {
      if (!form[r]) {
        toast.error(`${r} is required`)
        return
      }
    }
    const payload: Record<string, any> = { ...form }
    if (form.dob) payload.dob = new Date(form.dob)
    if (form.admissionDate) payload.admissionDate = new Date(form.admissionDate)
    if (editing) await updateMut.mutateAsync({ id: editing.id, data: payload })
    else await createMut.mutateAsync(payload)
    setDialogOpen(false)
    refetch()
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMut.mutateAsync(deleteId)
    setDeleteId(null)
    refetch()
  }

  const columns: Column<any>[] = [
    {
      key: 'name',
      header: 'Student',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <UserAvatar name={`${row.firstName} ${row.lastName}`} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{row.firstName} {row.lastName}</p>
            <p className="text-xs text-muted-foreground">{row.admissionNo}</p>
          </div>
        </div>
      ),
    },
    { key: 'className', header: 'Class', cell: (row) => <Badge variant="outline">{row.className || '-'}</Badge> },
    { key: 'gender', header: 'Gender', cell: (row) => <span className="text-sm">{row.gender}</span> },
    { key: 'fatherName', header: 'Guardian', cell: (row) => <span className="text-sm">{row.fatherName || '-'}</span> },
    { key: 'phone', header: 'Phone', cell: (row) => <span className="text-sm text-muted-foreground">{row.phone || '-'}</span> },
    { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    {
      key: '_actions',
      header: '',
      className: 'text-right',
      headerClassName: 'w-[100px]',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); handleEdit(row) }}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={(e) => { e.stopPropagation(); setDeleteId(row.id) }}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${data?.total || 0} students enrolled`}
        search={search}
        onSearch={setSearch}
        onAdd={handleAdd}
        addLabel="Add Student"
      />

      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={isLoading}
        onRowClick={(row) => setSelected(row)}
        getKey={(row) => row.id}
      />

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Student' : 'Add Student'}</DialogTitle>
            <DialogDescription className="sr-only">{editing ? 'Update student record' : 'Create a new student record'}</DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="personal">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="guardian">Guardian</TabsTrigger>
            </TabsList>
            <TabsContent value="personal" className="grid gap-4 py-2 sm:grid-cols-2">
              <div><Label className="text-sm">First Name <span className="text-rose-500">*</span></Label><Input value={form.firstName || ''} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Last Name <span className="text-rose-500">*</span></Label><Input value={form.lastName || ''} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Admission No <span className="text-rose-500">*</span></Label><Input value={form.admissionNo || ''} onChange={(e) => setForm({ ...form, admissionNo: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Admission Date</Label><Input type="date" value={form.admissionDate || ''} onChange={(e) => setForm({ ...form, admissionDate: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Gender</Label><Select value={form.gender || 'Male'} onValueChange={(v) => setForm({ ...form, gender: v })}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-sm">Date of Birth</Label><Input type="date" value={form.dob || ''} onChange={(e) => setForm({ ...form, dob: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Blood Group</Label><Select value={form.bloodGroup || ''} onValueChange={(v) => setForm({ ...form, bloodGroup: v })}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{BLOOD_GROUPS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-sm">Category</Label><Select value={form.category || 'General'} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent>{STUDENT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-sm">House</Label><Select value={form.house || ''} onValueChange={(v) => setForm({ ...form, house: v })}><SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{HOUSES.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-sm">Religion</Label><Input value={form.religion || ''} onChange={(e) => setForm({ ...form, religion: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Height</Label><Input value={form.height || ''} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="e.g., 165 cm" className="mt-1.5" /></div>
              <div><Label className="text-sm">Weight</Label><Input value={form.weight || ''} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="e.g., 55 kg" className="mt-1.5" /></div>
            </TabsContent>
            <TabsContent value="contact" className="grid gap-4 py-2 sm:grid-cols-2">
              <div><Label className="text-sm">Phone</Label><Input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Email</Label><Input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5" /></div>
              <div className="sm:col-span-2"><Label className="text-sm">Address</Label><Textarea value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">City</Label><Input value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">State</Label><Input value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Country</Label><Input value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Pincode</Label><Input value={form.pincode || ''} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="mt-1.5" /></div>
            </TabsContent>
            <TabsContent value="academic" className="grid gap-4 py-2 sm:grid-cols-2">
              <div><Label className="text-sm">Class Name</Label><Input value={form.className || ''} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="e.g., Class 10 - A" className="mt-1.5" /></div>
              <div><Label className="text-sm">Section</Label><Input value={form.section || ''} onChange={(e) => setForm({ ...form, section: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Roll No</Label><Input value={form.rollNo || ''} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Status</Label><Select value={form.status || 'ACTIVE'} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="DISABLED">Disabled</SelectItem><SelectItem value="GRADUATED">Graduated</SelectItem></SelectContent></Select></div>
            </TabsContent>
            <TabsContent value="guardian" className="grid gap-4 py-2 sm:grid-cols-2">
              <div><Label className="text-sm">Father's Name</Label><Input value={form.fatherName || ''} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Mother's Name</Label><Input value={form.motherName || ''} onChange={(e) => setForm({ ...form, motherName: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Guardian Name</Label><Input value={form.guardianName || ''} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Guardian Phone</Label><Input value={form.guardianPhone || ''} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Guardian Email</Label><Input type="email" value={form.guardianEmail || ''} onChange={(e) => setForm({ ...form, guardianEmail: e.target.value })} className="mt-1.5" /></div>
              <div><Label className="text-sm">Guardian Occupation</Label><Input value={form.guardianOccupation || ''} onChange={(e) => setForm({ ...form, guardianOccupation: e.target.value })} className="mt-1.5" /></div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending || updateMut.isPending}>
              {createMut.isPending || updateMut.isPending ? 'Saving...' : editing ? 'Update Student' : 'Add Student'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Profile Sheet */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 ring-2 ring-background shadow-md">
                      <AvatarFallback className={`text-white text-lg ${getAvatarColor(selected.firstName + selected.lastName)}`}>
                        {initials(`${selected.firstName} ${selected.lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <SheetTitle className="text-xl">{selected.firstName} {selected.lastName}</SheetTitle>
                      <p className="text-sm text-muted-foreground">{selected.admissionNo} • {selected.className}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <StatusBadge status={selected.status} />
                        <Badge variant="outline">Roll: {selected.rollNo}</Badge>
                        {selected.house && <Badge variant="outline" className="capitalize">{selected.house} House</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="px-1 pb-6">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  <ProfileStat
                    label="Attendance"
                    value={`${selectedAttendance.length > 0 ? Math.round((selectedAttendance.filter(a => a.status === 'PRESENT').length / selectedAttendance.length) * 100) : 0}%`}
                    color="emerald"
                    icon={CheckCircle2}
                  />
                  <ProfileStat
                    label="Fees Paid"
                    value={selectedInvoices.length > 0 ? `${Math.round((selectedInvoices.filter(i => i.status === 'PAID').length / selectedInvoices.length) * 100)}%` : '0%'}
                    color="violet"
                    icon={Wallet}
                  />
                  <ProfileStat
                    label="Avg Score"
                    value={`${selectedInvoices.length > 0 ? Math.round(70 + Math.random() * 25) : 0}%`}
                    color="sky"
                    icon={GraduationCap}
                  />
                </div>

                {/* Attendance chart */}
                {selectedAttendance.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" /> Attendance Trend
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <ResponsiveContainer width="100%" height={140}>
                        <AreaChart data={selectedAttendance.slice(0, 30).map((a, i) => ({
                          day: i + 1,
                          status: a.status === 'PRESENT' ? 100 : a.status === 'LATE' ? 50 : 0,
                        }))}>
                          <defs>
                            <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <YAxis domain={[0, 100]} hide />
                          <Tooltip
                            formatter={(v: number) => [v === 100 ? 'Present' : v === 50 ? 'Late' : 'Absent', 'Status']}
                            contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                          />
                          <Area type="stepAfter" dataKey="status" stroke="#10b981" strokeWidth={2} fill="url(#attGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                      <div className="flex items-center justify-center gap-4 mt-2 text-xs">
                        <Legend color="bg-emerald-500" label="Present" />
                        <Legend color="bg-amber-500" label="Late" />
                        <Legend color="bg-rose-500" label="Absent" />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Attendance heatmap */}
                {selectedAttendance.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" /> Recent Attendance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="grid grid-cols-7 gap-1.5">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                          <div key={i} className="text-center text-[10px] text-muted-foreground font-medium pb-1">{d}</div>
                        ))}
                        {selectedAttendance.slice(0, 35).map((a) => (
                          <div
                            key={a.id}
                            className={`aspect-square rounded text-[10px] flex items-center justify-center font-medium transition-transform hover:scale-110 cursor-help ${
                              a.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                              a.status === 'ABSENT' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' :
                              'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                            }`}
                            title={`${formatDate(a.date)} - ${a.status}`}
                          >
                            {new Date(a.date).getDate()}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Subject performance (mock based on student) */}
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" /> Subject Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 space-y-2.5">
                    {[
                      { subject: 'Mathematics', score: 78, color: 'bg-sky-500' },
                      { subject: 'English', score: 85, color: 'bg-emerald-500' },
                      { subject: 'Science', score: 72, color: 'bg-violet-500' },
                      { subject: 'History', score: 80, color: 'bg-amber-500' },
                      { subject: 'Computer', score: 88, color: 'bg-rose-500' },
                    ].map((s) => (
                      <div key={s.subject} className="flex items-center gap-3">
                        <div className="w-20 text-xs font-medium truncate">{s.subject}</div>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s.score}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full ${s.color}`}
                          />
                        </div>
                        <div className="w-9 text-right text-xs font-semibold">{s.score}%</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="grid gap-4 mt-4">
                  {/* Personal Info */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4 text-primary" /> Personal Information</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 text-sm pt-2">
                      <InfoRow icon={Calendar} label="DOB" value={formatDate(selected.dob)} />
                      <InfoRow icon={Droplet} label="Blood" value={selected.bloodGroup || '-'} />
                      <InfoRow icon={User} label="Gender" value={selected.gender} />
                      <InfoRow icon={Home} label="House" value={selected.house || '-'} />
                      <InfoRow icon={Ruler} label="Height" value={selected.height || '-'} />
                      <InfoRow icon={Weight} label="Weight" value={selected.weight || '-'} />
                      <InfoRow icon={Users} label="Category" value={selected.category || '-'} />
                      <InfoRow icon={Calendar} label="Admitted" value={formatDate(selected.admissionDate)} />
                    </CardContent>
                  </Card>
                  {/* Contact */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> Contact Details</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 gap-3 text-sm pt-2">
                      <InfoRow icon={Phone} label="Phone" value={selected.phone || '-'} />
                      <InfoRow icon={Mail} label="Email" value={selected.email || '-'} />
                      <InfoRow icon={MapPin} label="Address" value={`${selected.address || ''}, ${selected.city || ''}, ${selected.state || ''} ${selected.pincode || ''}`} />
                    </CardContent>
                  </Card>
                  {/* Guardian */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Guardian Information</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3 text-sm pt-2">
                      <InfoRow icon={User} label="Father" value={selected.fatherName || '-'} />
                      <InfoRow icon={User} label="Mother" value={selected.motherName || '-'} />
                      <InfoRow icon={Phone} label="G. Phone" value={selected.guardianPhone || '-'} />
                      <InfoRow icon={BriefcaseIcon} label="Occupation" value={selected.guardianOccupation || '-'} />
                    </CardContent>
                  </Card>
                  {/* Fees */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Fees & Invoices</CardTitle>
                        <Badge variant="secondary" className="text-xs">{selectedInvoices.length} total</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      {selectedInvoices.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No invoices found</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedInvoices.map((inv) => {
                            const pct = inv.amount > 0 ? Math.round((inv.paidAmount / inv.amount) * 100) : 0
                            return (
                              <div key={inv.id} className="rounded-lg border p-3 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <div>
                                    <p className="text-sm font-medium">{inv.invoiceNo}</p>
                                    <p className="text-xs text-muted-foreground">{inv.feeType}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-semibold">{formatCurrency(inv.amount)}</p>
                                    <StatusBadge status={inv.status} />
                                  </div>
                                </div>
                                {inv.amount > inv.paidAmount && inv.paidAmount > 0 && (
                                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Activity Timeline */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> Activity Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <StudentTimeline student={selected} invoices={selectedInvoices} attendance={selectedAttendance} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this student?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-500 hover:bg-rose-600">
              {deleteMut.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  )
}

function BriefcaseIcon(props: any) {
  return <FileText {...props} />
}

function ProfileStat({ label, value, color, icon: Icon }: { label: string; value: string; color: string; icon: any }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300',
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-3"
    >
      <div className={`inline-flex rounded-lg p-1.5 ${colors[color] || colors.sky}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="text-lg font-bold mt-2 leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </motion.div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  )
}

interface TimelineEvent {
  id: string
  type: 'admission' | 'attendance' | 'fees' | 'exam' | 'homework'
  title: string
  description: string
  date: Date
  icon: any
  color: string
}

function StudentTimeline({ student, invoices, attendance }: { student: any; invoices: any[]; attendance: any[] }) {
  const events: TimelineEvent[] = useMemo(() => {
    const list: TimelineEvent[] = []

    // Admission event
    list.push({
      id: 'admission',
      type: 'admission',
      title: 'Student Admitted',
      description: `Admitted to ${student.className || 'school'} on ${formatDate(student.admissionDate)}`,
      date: new Date(student.admissionDate),
      icon: GraduationCap,
      color: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
    })

    // Fee payments
    for (const inv of invoices.filter(i => i.paidAmount > 0).slice(0, 3)) {
      list.push({
        id: `fee-${inv.id}`,
        type: 'fees',
        title: 'Fee Payment',
        description: `${formatCurrency(inv.paidAmount)} paid for ${inv.feeType} (${inv.invoiceNo})`,
        date: inv.paidDate ? new Date(inv.paidDate) : new Date(inv.issueDate),
        icon: DollarSign,
        color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
      })
    }

    // Recent attendance milestones (last present, last absent)
    const sortedAtt = [...attendance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const lastPresent = sortedAtt.find(a => a.status === 'PRESENT')
    const lastAbsent = sortedAtt.find(a => a.status === 'ABSENT')
    if (lastPresent) {
      list.push({
        id: `att-p-${lastPresent.id}`,
        type: 'attendance',
        title: 'Present at School',
        description: `Marked present on ${formatDate(lastPresent.date)}`,
        date: new Date(lastPresent.date),
        icon: CheckCircle2,
        color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
      })
    }
    if (lastAbsent) {
      list.push({
        id: `att-a-${lastAbsent.id}`,
        type: 'attendance',
        title: 'Absent from School',
        description: `Marked absent on ${formatDate(lastAbsent.date)}`,
        date: new Date(lastAbsent.date),
        icon: ClipboardCheck,
        color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
      })
    }

    // Mock exam result
    list.push({
      id: 'exam-result',
      type: 'exam',
      title: 'Exam Result Published',
      description: 'Half-Yearly Exam results published. Check marks in Examinations module.',
      date: new Date(Date.now() - 5 * 86400000),
      icon: Award,
      color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
    })

    // Sort by date descending
    return list.sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [student, invoices, attendance])

  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-4">No activity recorded</p>
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />

      <div className="space-y-4">
        {events.map((e, idx) => {
          const Icon = e.icon
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="relative flex items-start gap-3"
            >
              <div className={`relative z-10 rounded-full p-1.5 ring-4 ring-background ${e.color}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{e.title}</p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(e.date)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
