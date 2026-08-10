'use client'

import { useState, useMemo } from 'react'
import { useList, useUpdate, useCreate } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useDashboard, useSettings } from '@/hooks/use-data'
import { StatCard } from '@/components/shared/stat-card'
import { formatCurrency, formatDate, INVOICE_STATUSES, PAYMENT_METHODS } from '@/lib/constants'
import { DollarSign, Wallet, AlertCircle, CheckCircle2, TrendingUp, Printer, Receipt, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export function FeesModule() {
  const [tab, setTab] = useState('invoices')
  return (
    <div>
      <PageHeader title="Fees Collection" subtitle="Invoices, payments, receipts and dues management" />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="types">Fee Types</TabsTrigger>
          <TabsTrigger value="groups">Fee Groups</TabsTrigger>
        </TabsList>
        <TabsContent value="invoices"><InvoicesPanel /></TabsContent>
        <TabsContent value="receipts"><ReceiptsPanel /></TabsContent>
        <TabsContent value="types"><FeeTypesPanel /></TabsContent>
        <TabsContent value="groups"><FeeGroupsPanel /></TabsContent>
      </Tabs>
    </div>
  )
}

function InvoicesPanel() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [payDialog, setPayDialog] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [payAmount, setPayAmount] = useState(0)

  useMemo(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const params: Record<string, string> = {}
  if (debouncedSearch) params.search = debouncedSearch
  if (statusFilter) params.status = statusFilter

  const { data, isLoading, refetch } = useList<any>('invoices', params)
  const { data: students } = useList<any>('students')
  const updateMut = useUpdate('invoices')
  const { data: dash } = useDashboard()
  const studentMap = new Map((students?.items || []).map((s) => [s.id, s]))

  const handlePay = async () => {
    if (!payDialog) return
    const newPaid = payDialog.paidAmount + payAmount
    const status = newPaid >= payDialog.amount ? 'PAID' : newPaid > 0 ? 'PARTIAL' : payDialog.status
    await updateMut.mutateAsync({
      id: payDialog.id,
      data: {
        paidAmount: newPaid,
        status,
        paymentMethod,
        paidDate: new Date(),
      },
    })
    toast.success(`Payment of ${formatCurrency(payAmount)} recorded`)
    setPayDialog(null)
    setPayAmount(0)
    refetch()
  }

  return (
    <div className="space-y-4">
      {dash && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Billed" value={formatCurrency(dash.stats.totalFees)} icon={DollarSign} color="violet" />
          <StatCard title="Collected" value={formatCurrency(dash.stats.collectedFees)} icon={CheckCircle2} color="emerald" />
          <StatCard title="Pending" value={formatCurrency(dash.stats.pendingFees)} icon={Wallet} color="rose" />
          <StatCard title="Overdue" value={dash.stats.overdueCount} icon={AlertCircle} color="amber" subtitle="invoices" />
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Search by invoice no, fee type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter || 'ALL'} onValueChange={(v) => setStatusFilter(v === 'ALL' ? '' : v)}>
              <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                {INVOICE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={[
          { key: 'invoiceNo', header: 'Invoice', cell: (row) => <span className="text-sm font-medium">{row.invoiceNo}</span> },
          {
            key: 'studentId', header: 'Student', cell: (row) => {
              const s = studentMap.get(row.studentId)
              return <span className="text-sm">{s ? `${s.firstName} ${s.lastName}` : 'Unknown'}</span>
            },
          },
          { key: 'feeType', header: 'Fee Type', cell: (row) => <span className="text-sm">{row.feeType}</span> },
          { key: 'amount', header: 'Amount', cell: (row) => <span className="text-sm font-medium">{formatCurrency(row.amount)}</span> },
          { key: 'paidAmount', header: 'Paid', cell: (row) => <span className="text-sm text-emerald-600 dark:text-emerald-400">{formatCurrency(row.paidAmount)}</span> },
          { key: 'dueDate', header: 'Due Date', cell: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.dueDate)}</span> },
          { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
          {
            key: '_pay', header: '', className: 'text-right', headerClassName: 'w-[100px]', cell: (row) => (
              row.status !== 'PAID' ? (
                <Button size="sm" variant="outline" onClick={() => { setPayDialog(row); setPayAmount(row.amount - row.paidAmount) }}>
                  Pay
                </Button>
              ) : <span className="text-xs text-emerald-600">Paid</span>
            ),
          },
        ]}
        data={data?.items || []}
        loading={isLoading}
        getKey={(row) => row.id}
        emptyTitle="No invoices found"
      />

      <Dialog open={!!payDialog} onOpenChange={(open) => !open && setPayDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment - {payDialog?.invoiceNo}</DialogTitle>
            <DialogDescription className="sr-only">Record a payment for this invoice</DialogDescription>
          </DialogHeader>
          {payDialog && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted p-3 space-y-1">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Amount</span><span className="font-medium">{formatCurrency(payDialog.amount)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Already Paid</span><span className="font-medium text-emerald-600">{formatCurrency(payDialog.paidAmount)}</span></div>
                <div className="flex justify-between text-sm border-t pt-1 mt-1"><span className="text-muted-foreground">Balance Due</span><span className="font-bold">{formatCurrency(payDialog.amount - payDialog.paidAmount)}</span></div>
              </div>
              <div>
                <Label className="text-sm">Payment Amount</Label>
                <Input type="number" value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayDialog(null)}>Cancel</Button>
            <Button onClick={handlePay} disabled={updateMut.isPending}>Record Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FeeTypesPanel() {
  const { data, isLoading } = useList<any>('fee-types')
  const { data: groups } = useList<any>('fee-groups')
  const groupMap = new Map((groups?.items || []).map((g) => [g.id, g.name]))

  return (
    <DataTable
      columns={[
        { key: 'name', header: 'Fee Type', cell: (row) => <span className="text-sm font-medium">{row.name}</span> },
        { key: 'code', header: 'Code', cell: (row) => <Badge variant="outline">{row.code}</Badge> },
        { key: 'groupId', header: 'Group', cell: (row) => <span className="text-sm">{groupMap.get(row.groupId) || '-'}</span> },
        { key: 'amount', header: 'Amount', cell: (row) => <span className="text-sm font-medium">{formatCurrency(row.amount)}</span> },
        { key: 'frequency', header: 'Frequency', cell: (row) => <span className="text-sm text-muted-foreground">{row.frequency}</span> },
      ]}
      data={data?.items || []}
      loading={isLoading}
      getKey={(row) => row.id}
      emptyTitle="No fee types configured"
    />
  )
}

function FeeGroupsPanel() {
  const { data, isLoading } = useList<any>('fee-groups')
  return (
    <DataTable
      columns={[
        { key: 'name', header: 'Group Name', cell: (row) => <span className="text-sm font-medium">{row.name}</span> },
        { key: 'description', header: 'Description', cell: (row) => <span className="text-sm text-muted-foreground">{row.description || '-'}</span> },
      ]}
      data={data?.items || []}
      loading={isLoading}
      getKey={(row) => row.id}
      emptyTitle="No fee groups"
    />
  )
}

function ReceiptsPanel() {
  const [selected, setSelected] = useState<any>(null)
  const { data, isLoading } = useList<any>('invoices', { limit: '500' })
  const { data: students } = useList<any>('students', { limit: '500' })
  const { data: settings } = useSettings()

  const paidInvoices = (data?.items || []).filter(i => i.paidAmount > 0)
  const studentMap = new Map((students?.items || []).map(s => [s.id, s]))

  const handlePrint = () => {
    window.print()
    toast.success('Print dialog opened')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      {/* Paid invoices list */}
      <Card className="print:hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Receipt className="h-4 w-4 text-primary" /> Paid Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            {paidInvoices.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No paid invoices</p>
            ) : (
              paidInvoices.slice(0, 50).map((inv) => {
                const student = studentMap.get(inv.studentId)
                return (
                  <button
                    key={inv.id}
                    onClick={() => setSelected(inv)}
                    className={`w-full flex items-center gap-3 p-3 border-b last:border-0 text-left hover:bg-muted/30 transition-colors ${selected?.id === inv.id ? 'bg-primary/5' : ''}`}
                  >
                    <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/40 p-2 shrink-0">
                      <Receipt className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{inv.invoiceNo}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {student ? `${student.firstName} ${student.lastName}` : 'Unknown'} · {inv.feeType}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">{formatCurrency(inv.paidAmount)}</p>
                      <p className="text-[10px] text-muted-foreground">{inv.paidDate ? formatDate(inv.paidDate) : formatDate(inv.issueDate)}</p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Receipt preview */}
      <div>
        {!selected ? (
          <Card className="border-dashed print:hidden">
            <CardContent className="p-12 text-center">
              <div className="inline-flex rounded-2xl bg-muted p-4 mb-4">
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold">Select an invoice</h3>
              <p className="text-sm text-muted-foreground mt-1">Choose a paid invoice from the list to view its receipt.</p>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="flex justify-end gap-2 mb-3 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Print Receipt
              </Button>
            </div>
            <ReceiptPrint invoice={selected} student={studentMap.get(selected.studentId)} settings={settings} />
          </div>
        )}
      </div>

      {/* Print-only view */}
      {selected && (
        <div className="hidden print:block">
          <ReceiptPrint invoice={selected} student={studentMap.get(selected.studentId)} settings={settings} />
        </div>
      )}
    </div>
  )
}

function ReceiptPrint({ invoice, student, settings }: { invoice: any; student: any; settings: any }) {
  if (!invoice) return null
  const balance = invoice.amount - invoice.discount - invoice.paidAmount
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border-2 border-primary/20 rounded-xl p-8 shadow-xl print:shadow-none print:border-0 print:rounded-none"
    >
      {/* Header */}
      <div className="text-center border-b-2 border-primary/20 pb-4 mb-5">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{settings?.school_name || 'School MS'}</h2>
            <p className="text-xs text-muted-foreground">{settings?.school_address || ''}</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-2 mt-2 px-4 py-1 rounded-full bg-primary/10">
          <Receipt className="h-4 w-4 text-primary" />
          <h3 className="text-base font-serif tracking-wide uppercase">Fee Receipt</h3>
        </div>
      </div>

      {/* Receipt info */}
      <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <span className="text-muted-foreground min-w-[80px]">Receipt No:</span>
            <span className="font-medium font-mono">{invoice.invoiceNo}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground min-w-[80px]">Date:</span>
            <span className="font-medium">{invoice.paidDate ? formatDate(invoice.paidDate) : formatDate(invoice.issueDate)}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground min-w-[80px]">Method:</span>
            <span className="font-medium">{invoice.paymentMethod || 'CASH'}</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex gap-2">
            <span className="text-muted-foreground min-w-[80px]">Student:</span>
            <span className="font-medium">{student ? `${student.firstName} ${student.lastName}` : '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground min-w-[80px]">Adm. No:</span>
            <span className="font-medium">{student?.admissionNo || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground min-w-[80px]">Class:</span>
            <span className="font-medium">{student?.className || '-'}</span>
          </div>
        </div>
      </div>

      {/* Fee breakdown table */}
      <div className="rounded-lg border overflow-hidden mb-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 border-b">
              <th className="text-left p-3 font-semibold">Description</th>
              <th className="text-right p-3 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3">{invoice.feeType}</td>
              <td className="p-3 text-right font-medium">{formatCurrency(invoice.amount)}</td>
            </tr>
            {invoice.discount > 0 && (
              <tr className="border-b">
                <td className="p-3 text-emerald-600">Discount</td>
                <td className="p-3 text-right font-medium text-emerald-600">- {formatCurrency(invoice.discount)}</td>
              </tr>
            )}
            {invoice.fine > 0 && (
              <tr className="border-b">
                <td className="p-3 text-rose-600">Late Fine</td>
                <td className="p-3 text-right font-medium text-rose-600">+ {formatCurrency(invoice.fine)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-primary/5 border-t-2">
              <td className="p-3 font-semibold">Total Paid</td>
              <td className="p-3 text-right font-bold text-lg text-emerald-600">{formatCurrency(invoice.paidAmount)}</td>
            </tr>
            {balance > 0 && (
              <tr className="bg-rose-50 dark:bg-rose-950/20">
                <td className="p-3 font-semibold text-rose-700 dark:text-rose-400">Balance Due</td>
                <td className="p-3 text-right font-bold text-rose-600">{formatCurrency(balance)}</td>
              </tr>
            )}
          </tfoot>
        </table>
      </div>

      {/* Amount in words (mock) */}
      <div className="mb-5 text-sm">
        <span className="text-muted-foreground">Amount in words: </span>
        <span className="font-medium italic">{numberToWords(invoice.paidAmount)} Turkish Lira Only</span>
      </div>

      {/* Signatures */}
      <div className="flex items-end justify-between mt-8 pt-6 border-t">
        <div className="text-center">
          <div className="h-10 border-b border-dashed w-28 mb-1" />
          <p className="text-xs text-muted-foreground">Cashier</p>
        </div>
        <div className="text-center">
          <div className="h-10 w-16 mx-auto mb-1 bg-muted/40 rounded flex items-center justify-center">
            <Receipt className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-[10px] text-muted-foreground">Official Stamp</p>
        </div>
        <div className="text-center">
          <div className="h-10 border-b border-dashed w-28 mb-1" />
          <p className="text-xs text-muted-foreground">Accountant</p>
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-4">
        This is a computer-generated receipt · Generated on {formatDate(new Date())}
      </p>
    </motion.div>
  )
}

// Simple number to words (for receipt)
function numberToWords(num: number): string {
  if (num === 0) return 'Zero'
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']

  const intPart = Math.floor(num)
  if (intPart < 10) return ones[intPart]
  if (intPart < 20) return teens[intPart - 10]
  if (intPart < 100) return tens[Math.floor(intPart / 10)] + (intPart % 10 ? ' ' + ones[intPart % 10] : '')
  if (intPart < 1000) return ones[Math.floor(intPart / 100)] + ' Hundred' + (intPart % 100 ? ' ' + numberToWords(intPart % 100) : '')
  if (intPart < 1000000) return numberToWords(Math.floor(intPart / 1000)) + ' Thousand' + (intPart % 1000 ? ' ' + numberToWords(intPart % 1000) : '')
  return numberToWords(Math.floor(intPart / 1000000)) + ' Million' + (intPart % 1000000 ? ' ' + numberToWords(intPart % 1000000) : '')
}
