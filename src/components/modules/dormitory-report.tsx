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
import { Printer, BedDouble, Home, Users, DollarSign, DoorOpen, CheckCircle2, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function DormitoryReportModule() {
  const { data: dorms } = useList<any>('dormitories')
  const { data: rooms } = useList<any>('dormitory-rooms', { limit: '500' })
  const { data: students } = useList<any>('students', { limit: '500' })

  const stats = useMemo(() => {
    const totalDorms = dorms?.items?.length || 0
    const totalRooms = rooms?.items?.length || 0
    const totalCapacity = (rooms?.items || []).reduce((sum, r) => sum + r.capacity, 0)
    const totalOccupied = (rooms?.items || []).reduce((sum, r) => sum + r.occupied, 0)
    const totalRevenue = (rooms?.items || []).reduce((sum, r) => sum + (r.fee * r.occupied), 0)
    const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0

    // Per dormitory stats
    const dormStats = (dorms?.items || []).map(d => {
      const dRooms = (rooms?.items || []).filter(r => r.dormitoryId === d.id)
      const dCapacity = dRooms.reduce((s, r) => s + r.capacity, 0)
      const dOccupied = dRooms.reduce((s, r) => s + r.occupied, 0)
      const dRevenue = dRooms.reduce((s, r) => s + r.fee * r.occupied, 0)
      const dRate = dCapacity > 0 ? Math.round((dOccupied / dCapacity) * 100) : 0
      return {
        id: d.id,
        name: d.name,
        type: d.type,
        warden: d.wardenName,
        capacity: dCapacity,
        occupied: dOccupied,
        available: dCapacity - dOccupied,
        rate: dRate,
        revenue: dRevenue,
        roomCount: dRooms.length,
      }
    })

    // Room type distribution
    const typeMap: Record<string, number> = {}
    for (const r of rooms?.items || []) {
      typeMap[r.roomType] = (typeMap[r.roomType] || 0) + 1
    }
    const typeData = Object.entries(typeMap).map(([name, value]) => ({ name, value }))

    // Students in dorms
    const dormStudents = (students?.items || []).filter(s => s.dormitoryRoomId)

    // Room detail list
    const roomDetails = (rooms?.items || []).map(r => {
      const dorm = (dorms?.items || []).find(d => d.id === r.dormitoryId)
      return {
        id: r.id,
        roomNo: r.roomNo,
        dormName: dorm?.name || '-',
        type: r.roomType,
        capacity: r.capacity,
        occupied: r.occupied,
        available: r.capacity - r.occupied,
        fee: r.fee,
        revenue: r.fee * r.occupied,
        rate: r.capacity > 0 ? Math.round((r.occupied / r.capacity) * 100) : 0,
      }
    })

    return { totalDorms, totalRooms, totalCapacity, totalOccupied, totalRevenue, occupancyRate, dormStats, typeData, dormStudents, roomDetails }
  }, [dorms, rooms, students])

  const PIE_COLORS = ['#10b981', '#f59e0b', '#0ea5e9', '#8b5cf6']

  const handlePrint = () => {
    window.print()
    toast.success('Print dialog opened')
  }

  return (
    <div>
      <PageHeader
        title="Dormitory Report"
        subtitle="Occupancy, revenue, and room allocation analytics"
        extra={
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" /> Print Report
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Dormitories" value={stats.totalDorms} icon={Home} color="sky" />
        <StatCard title="Total Rooms" value={stats.totalRooms} icon={DoorOpen} color="violet" />
        <StatCard title="Occupancy Rate" value={`${stats.occupancyRate}%`} icon={BedDouble} color="emerald" subtitle={`${stats.totalOccupied}/${stats.totalCapacity} beds`} />
        <StatCard title="Monthly Revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="amber" subtitle="from dormitory fees" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dormitory Occupancy</CardTitle>
            <CardDescription>Occupied vs available beds per dormitory</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.dormStats}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="occupied" stackId="a" fill="#10b981" name="Occupied" radius={[0, 0, 0, 0]} />
                <Bar dataKey="available" stackId="a" fill="#e5e7eb" name="Available" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Room Type Distribution</CardTitle>
            <CardDescription>Breakdown by room type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={stats.typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {stats.typeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Dormitory summary table */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Dormitory-wise Summary</CardTitle>
          <CardDescription>Capacity, occupancy, and revenue per dormitory</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Dormitory</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Warden</TableHead>
                <TableHead className="text-center">Rooms</TableHead>
                <TableHead className="text-center">Capacity</TableHead>
                <TableHead className="text-center">Occupied</TableHead>
                <TableHead className="text-center">Rate</TableHead>
                <TableHead className="text-center">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.dormStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No dormitories found</TableCell>
                </TableRow>
              ) : (
                stats.dormStats.map(d => (
                  <TableRow key={d.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{d.type}</Badge></TableCell>
                    <TableCell className="text-sm">{d.warden || '-'}</TableCell>
                    <TableCell className="text-center text-sm">{d.roomCount}</TableCell>
                    <TableCell className="text-center text-sm">{d.capacity}</TableCell>
                    <TableCell className="text-center text-sm font-medium">{d.occupied}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={d.rate >= 80 ? 'text-rose-600' : d.rate >= 50 ? 'text-amber-600' : 'text-emerald-600'}>
                        {d.rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-sm font-semibold text-emerald-600">{formatCurrency(d.revenue)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Room detail table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Room-wise Details</CardTitle>
              <CardDescription>Individual room occupancy and fees ({stats.roomDetails.length} rooms)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 sticky top-0">
                  <TableHead>Room No</TableHead>
                  <TableHead>Dormitory</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-center">Capacity</TableHead>
                  <TableHead className="text-center">Occupied</TableHead>
                  <TableHead className="text-center">Available</TableHead>
                  <TableHead className="text-center">Fee</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.roomDetails.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">No rooms found</TableCell>
                  </TableRow>
                ) : (
                  stats.roomDetails.map(r => (
                    <TableRow key={r.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-sm">{r.roomNo}</TableCell>
                      <TableCell className="text-sm">{r.dormName}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{r.type}</Badge></TableCell>
                      <TableCell className="text-center text-sm">{r.capacity}</TableCell>
                      <TableCell className="text-center text-sm font-medium">{r.occupied}</TableCell>
                      <TableCell className="text-center text-sm">
                        <span className={r.available > 0 ? 'text-emerald-600' : 'text-rose-600'}>{r.available}</span>
                      </TableCell>
                      <TableCell className="text-center text-sm">{formatCurrency(r.fee)}</TableCell>
                      <TableCell className="text-center">
                        {r.available > 0 ? (
                          <Badge variant="outline" className="text-emerald-600 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" /> Available
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-rose-600 text-xs">
                            <XCircle className="h-3 w-3 mr-0.5" /> Full
                          </Badge>
                        )}
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
