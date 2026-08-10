'use client'

import { useState, useMemo } from 'react'
import { useList, useCreate, useDelete } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatCard } from '@/components/shared/stat-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useDashboard } from '@/hooks/use-data'
import { formatCurrency, formatDate } from '@/lib/constants'
import { TrendingUp, TrendingDown, Wallet, Banknote, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function AccountsModule() {
  const [tab, setTab] = useState('transactions')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ type: 'INCOME', method: 'CASH' })

  const { data, isLoading, refetch } = useList<any>('transactions')
  const { data: accounts } = useList<any>('accounts')
  const createMut = useCreate('transactions')
  const { data: dash } = useDashboard()

  const handleSubmit = async () => {
    if (!form.category || !form.amount) return
    await createMut.mutateAsync({ ...form, amount: Number(form.amount), date: new Date() })
    setDialogOpen(false)
    setForm({ type: 'INCOME', method: 'CASH' })
    refetch()
  }

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Income, expense and transaction management"
        onAdd={() => setDialogOpen(true)}
        addLabel="Add Transaction"
      />

      {dash && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard title="Monthly Income" value={formatCurrency(dash.stats.income)} icon={TrendingUp} color="emerald" />
          <StatCard title="Monthly Expense" value={formatCurrency(dash.stats.expense)} icon={TrendingDown} color="rose" />
          <StatCard title="Net Profit" value={formatCurrency(dash.stats.profit)} icon={Wallet} color={dash.stats.profit >= 0 ? 'emerald' : 'rose'} />
          <StatCard title="Bank Balance" value={formatCurrency((accounts?.items || []).reduce((s, a) => s + a.balance, 0))} icon={Banknote} color="violet" />
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Bank Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <DataTable
            columns={[
              {
                key: 'type', header: 'Type', cell: (row) => (
                  <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${row.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'}`}>
                    {row.type === 'INCOME' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {row.type}
                  </div>
                ),
              },
              { key: 'category', header: 'Category', cell: (row) => <span className="text-sm font-medium">{row.category}</span> },
              { key: 'description', header: 'Description', cell: (row) => <span className="text-sm text-muted-foreground">{row.description}</span> },
              { key: 'method', header: 'Method', cell: (row) => <Badge variant="outline">{row.method}</Badge> },
              { key: 'amount', header: 'Amount', cell: (row) => <span className={`text-sm font-semibold ${row.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{row.type === 'INCOME' ? '+' : '-'}{formatCurrency(row.amount)}</span> },
              { key: 'date', header: 'Date', cell: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.date)}</span> },
            ]}
            data={data?.items || []}
            loading={isLoading}
            getKey={(row) => row.id}
            emptyTitle="No transactions yet"
          />
        </TabsContent>

        <TabsContent value="accounts">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(accounts?.items || []).map((a) => (
              <Card key={a.id} className="overflow-hidden">
                <div className={`h-2 ${a.type === 'BANK' ? 'bg-gradient-to-r from-violet-500 to-violet-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-400'}`} />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Banknote className="h-8 w-8 text-muted-foreground" />
                    <Badge variant="outline">{a.type}</Badge>
                  </div>
                  <p className="text-sm font-medium">{a.name}</p>
                  <p className="text-2xl font-bold mt-2">{formatCurrency(a.balance)}</p>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {a.bankName && <p>{a.bankName}</p>}
                    {a.accountNo && <p className="font-mono">{a.accountNo}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Transaction</DialogTitle>
            <DialogDescription className="sr-only">Create a new income or expense transaction</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label className="text-sm">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Category</Label>
              <Input value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Salary, Fees Collection" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm">Amount</Label>
              <Input type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm">Payment Method</Label>
              <Select value={form.method} onValueChange={(v) => setForm({ ...form, method: v })}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['CASH', 'BANK', 'CARD', 'ONLINE', 'CHEQUE'].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Description</Label>
              <Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={createMut.isPending}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
