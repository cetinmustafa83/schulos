'use client'

import { useState, useMemo } from 'react'
import { useList } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Search, Printer, Download, IdCard, Award, FileText, QrCode } from 'lucide-react'
import { formatDate, getAvatarColor, initials, formatCurrency } from '@/lib/constants'
import { useSettings } from '@/hooks/use-data'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export function IdCardModule() {
  const [tab, setTab] = useState('idcard')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('')
  const [certType, setCertType] = useState('BONAFIDE')
  const { data: students } = useList<any>('students')
  const { data: settings } = useSettings()

  const filtered = useMemo(() => {
    if (!search) return students?.items || []
    const s = search.toLowerCase()
    return (students?.items || []).filter(st =>
      `${st.firstName} ${st.lastName}`.toLowerCase().includes(s) ||
      st.admissionNo?.toLowerCase().includes(s)
    )
  }, [students, search])

  const selected = (students?.items || []).find(s => s.id === selectedId)

  const handlePrint = () => {
    window.print()
    toast.success('Print dialog opened')
  }

  return (
    <div>
      <PageHeader
        title="ID Cards & Certificates"
        subtitle="Generate and print student ID cards and certificates"
        extra={
          selected && (
            <div className="flex gap-2 print:hidden">
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
            </div>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Student selector */}
        <Card className="print:hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select Student</CardTitle>
            <CardDescription>Search and pick a student</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-[500px] -mx-2 px-2">
              <div className="space-y-1">
                {filtered.slice(0, 50).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedId(s.id)}
                    className={`w-full flex items-center gap-3 rounded-lg p-2 text-left transition-colors border ${
                      selectedId === s.id ? 'bg-primary/5 border-primary/30' : 'border-transparent hover:bg-muted/40'
                    }`}
                  >
                    <UserAvatar name={`${s.firstName} ${s.lastName}`} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-muted-foreground">{s.admissionNo} • {s.className}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Preview area */}
        <div>
          {!selected ? (
            <Card className="border-dashed">
              <CardContent className="p-16 text-center">
                <div className="inline-flex rounded-2xl bg-muted p-4 mb-4">
                  <IdCard className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold">Select a student</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                  Choose a student from the list to preview and generate their ID card or certificate.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Tabs value={tab} onValueChange={setTab} className="print:hidden">
              <TabsList>
                <TabsTrigger value="idcard"><IdCard className="h-4 w-4 mr-1 inline" />ID Card</TabsTrigger>
                <TabsTrigger value="certificate"><Award className="h-4 w-4 mr-1 inline" />Certificate</TabsTrigger>
              </TabsList>
              <TabsContent value="idcard">
                <IdCardPreview student={selected} settings={settings} />
              </TabsContent>
              <TabsContent value="certificate">
                <CertificatePreview student={selected} settings={settings} certType={certType} setCertType={setCertType} />
              </TabsContent>
            </Tabs>
          )}

          {/* Print-only view */}
          {selected && (
            <div className="hidden print:block">
              {tab === 'idcard' ? (
                <IdCardPrint student={selected} settings={settings} />
              ) : (
                <CertificatePrint student={selected} settings={settings} certType={certType} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function IdCardPreview({ student, settings }: { student: any; settings: any }) {
  return (
    <div className="flex justify-center py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-[340px] rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Front side */}
        <div className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-90">{settings?.school_name || 'School MS'}</p>
              <p className="text-[10px] opacity-75">Academic Year {settings?.academic_year || '2024-2025'}</p>
            </div>
            <GraduationCapIcon />
          </div>
        </div>
        <div className="bg-card p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20">
              <AvatarFallback className={`text-white ${getAvatarColor(student.firstName + student.lastName)}`}>
                {initials(`${student.firstName} ${student.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base truncate">{student.firstName} {student.lastName}</p>
              <p className="text-xs text-muted-foreground">{student.admissionNo}</p>
              <Badge variant="secondary" className="text-[10px] mt-1">{student.className}</Badge>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <InfoLine label="Father" value={student.fatherName || '-'} />
            <InfoLine label="DOB" value={formatDate(student.dob)} />
            <InfoLine label="Blood" value={student.bloodGroup || '-'} />
            <InfoLine label="Phone" value={student.phone || '-'} />
          </div>
          <div className="mt-3 pt-3 border-t flex items-center justify-between">
            <div className="text-[10px] text-muted-foreground">
              <p>Valid till: {new Date(new Date().getFullYear() + 1, 5, 30).toLocaleDateString()}</p>
              <p>Principal Signature: _______</p>
            </div>
            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
              <QrCode className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function CertificatePreview({ student, settings, certType, setCertType }: { student: any; settings: any; certType: string; setCertType: any }) {
  const certTypes = [
    { value: 'BONAFIDE', label: 'Bonafide Certificate' },
    { value: 'CHARACTER', label: 'Character Certificate' },
    { value: 'TRANSFER', label: 'Transfer Certificate' },
    { value: 'MIGRATION', label: 'Migration Certificate' },
  ]
  const certText: Record<string, string> = {
    BONAFIDE: 'is a bonafide student of this institution',
    CHARACTER: 'is known to be a student of good moral character',
    TRANSFER: 'has been a student of this institution and is hereby transferred',
    MIGRATION: 'is hereby permitted to migrate to another institution',
  }

  return (
    <div>
      <div className="mb-4 max-w-xs">
        <Label className="text-xs">Certificate Type</Label>
        <Select value={certType} onValueChange={setCertType}>
          <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
          <SelectContent>
            {certTypes.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-[600px] max-w-full bg-card border-4 border-double border-primary/30 p-10 shadow-xl"
        >
          {/* Header */}
          <div className="text-center border-b-2 border-primary/20 pb-4 mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCapIcon />
              </div>
              <div>
                <h2 className="text-xl font-bold">{settings?.school_name || 'School MS'}</h2>
                <p className="text-xs text-muted-foreground">{settings?.school_address || ''}</p>
              </div>
            </div>
            <h3 className="text-lg font-serif tracking-wide uppercase mt-3">{certTypes.find(c => c.value === certType)?.label}</h3>
          </div>

          {/* Body */}
          <div className="text-center space-y-4 text-sm leading-relaxed">
            <p className="text-muted-foreground italic">This is to certify that</p>
            <p className="text-xl font-bold">{student.firstName} {student.lastName}</p>
            <p className="text-muted-foreground">
              {certText[certType]}, studying in <span className="font-semibold">{student.className}</span>.
              Admission No: <span className="font-semibold">{student.admissionNo}</span>.
            </p>
            <p className="text-muted-foreground">
              Date of Birth: <span className="font-semibold">{formatDate(student.dob)}</span> ·
              Father's Name: <span className="font-semibold">{student.fatherName || '-'}</span>
            </p>
            <p className="text-muted-foreground">
              He/She bears a good moral character. This certificate is issued on {formatDate(new Date())} for the purpose as required by the student.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between mt-10 pt-6 border-t">
            <div className="text-center">
              <div className="h-12 border-b border-dashed w-32 mb-1" />
              <p className="text-xs text-muted-foreground">Clerk</p>
            </div>
            <div className="text-center">
              <div className="h-12 w-16 mx-auto mb-1 bg-muted/40 rounded flex items-center justify-center">
                <QrCode className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground">Scan to verify</p>
            </div>
            <div className="text-center">
              <div className="h-12 border-b border-dashed w-32 mb-1" />
              <p className="text-xs text-muted-foreground">Principal</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function IdCardPrint({ student, settings }: { student: any; settings: any }) {
  return (
    <div className="w-[340px] mx-auto">
      <IdCardPreview student={student} settings={settings} />
    </div>
  )
}

function CertificatePrint({ student, settings, certType }: { student: any; settings: any; certType: string }) {
  return <CertificatePreview student={student} settings={settings} certType={certType} setCertType={() => {}} />
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className="text-xs font-medium truncate">{value}</p>
    </div>
  )
}

function GraduationCapIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
    </svg>
  )
}
