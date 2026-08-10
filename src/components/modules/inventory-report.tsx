'use client'

import { useState, useMemo } from 'react'
import { useList } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatCard } from '@/components/shared/stat-card'
import { Printer, Package, AlertTriangle, TrendingDown, Boxes, Store, DollarSign, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { toast } from 'sonner'

export function InventoryReportModule() {
  const { data: items } = useList<any>('inventory', { limit: '500' })

  const stats = useMemo(() => {
    const all = items?.items || []
    const totalItems = all.length
    const totalValue = all.reduce((s, i) => s + (i.price * i.quantity), 0)
    const lowStock = all.filter(i => i.quantity <= (i.minStock || 0))
    const outOfStock = all.filter(i => i.quantity === 0)
    const totalStock = all.reduce((s, i) => s + i.quantity, 0)

    // By category
    const catMap: Record<string, { count: number; value: number; stock: number }> = {}
    for (const i of all) {
      const cat = i.category || 'Uncategorized'
      if (!catMap[cat]) catMap[cat] = { count: 0, value: 0, stock: 0 }
      catMap[cat].count++
      catMap[cat].value += i.price * i.quantity
      catMap[cat].stock += i.quantity
    }
    const byCategory = Object.entries(catMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.value - a.value)

    // By store
    const storeMap: Record<string, { count: number; value: number }> = {}
    for (const i of all) {
      const store = i.store || 'Main Store'
      if (!storeMap[store]) storeMap[store] = { count: 0, value: 0 }
      storeMap[store].count++
      storeMap[store].value += i.price * i.quantity
    }
    const byStore = Object.entries(storeMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.value - a.value)

    // By supplier
    const supplierMap: Record<string, { count: number; value: number }> = {}
    for (const i of all) {
      const sup = i.supplier || 'Unknown'
      if (!supplierMap[sup]) supplierMap[sup] = { count: 0, value: 0 }
      supplierMap[sup].count++
      supplierMap[sup].value += i.price * i.quantity
    }
    const bySupplier = Object.entries(supplierMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.value - a.value)

    return { totalItems, totalValue, lowStock, outOfStock, totalStock, byCategory, byStore, bySupplier }
  }, [items])

  const PIE_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

  const handlePrint = () => {
    window.print()
    toast.success('Print dialog opened')
  }

  return (
    <div>
      <PageHeader
        title="Inventory Report"
        subtitle="Stock levels, valuation, and supplier analysis"
        extra={<Button variant="outline" onClick={handlePrint}><Printer className="h-4 w-4 mr-1" /> Print</Button>}
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Items" value={stats.totalItems} icon={Package} color="sky" subtitle={`${stats.totalStock} units`} />
        <StatCard title="Total Value" value={formatCurrency(stats.totalValue)} icon={DollarSign} color="emerald" subtitle="inventory value" />
        <StatCard title="Low Stock" value={stats.lowStock.length} icon={AlertTriangle} color="amber" subtitle="need reorder" />
        <StatCard title="Out of Stock" value={stats.outOfStock.length} icon={TrendingDown} color="rose" subtitle="items depleted" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Value by Category</CardTitle>
            <CardDescription>Inventory value distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.byCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 6, 6, 0]} name="Value" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Items by Store</CardTitle>
            <CardDescription>Distribution across stores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stats.byStore} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.byStore.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low stock alerts */}
      {stats.lowStock.length > 0 && (
        <Card className="mb-4 border-amber-200 dark:border-amber-900/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Low Stock Alerts
                </CardTitle>
                <CardDescription>Items at or below minimum stock level</CardDescription>
              </div>
              <Badge variant="destructive" className="text-xs">{stats.lowStock.length} items</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Current Stock</TableHead>
                  <TableHead className="text-center">Min Stock</TableHead>
                  <TableHead className="text-center">Shortage</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.lowStock.map(item => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-sm">{item.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{item.category}</Badge></TableCell>
                    <TableCell className="text-center text-sm font-medium">{item.quantity}</TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">{item.minStock || 0}</TableCell>
                    <TableCell className="text-center text-sm text-rose-600 font-medium">{(item.minStock || 0) - item.quantity}</TableCell>
                    <TableCell className="text-center">
                      {item.quantity === 0 ? (
                        <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-amber-600">Low</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Category summary */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Category-wise Summary</CardTitle>
          <CardDescription>Items, stock, and value per category</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Category</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-center">Total Stock</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.byCategory.map(c => (
                <TableRow key={c.name} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-center text-sm">{c.count}</TableCell>
                  <TableCell className="text-center text-sm">{c.stock}</TableCell>
                  <TableCell className="text-right text-sm font-semibold text-emerald-600">{formatCurrency(c.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Supplier summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Supplier-wise Summary</CardTitle>
          <CardDescription>Items and value per supplier</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Supplier</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.bySupplier.map(s => (
                <TableRow key={s.name} className="hover:bg-muted/30">
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-center text-sm">{s.count}</TableCell>
                  <TableCell className="text-right text-sm font-semibold">{formatCurrency(s.value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
