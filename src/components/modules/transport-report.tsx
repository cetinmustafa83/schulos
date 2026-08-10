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
import { Printer, Bus, Route as RouteIcon, Users, DollarSign, MapPin } from 'lucide-react'
import { formatCurrency } from '@/lib/constants'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { toast } from 'sonner'

export function TransportReportModule() {
  const { data: vehicles } = useList<any>('vehicles')
  const { data: routes } = useList<any>('routes')
  const { data: assignments } = useList<any>('transport-assignments', { limit: '500' })
  const { data: students } = useList<any>('students', { limit: '500' })

  const stats = useMemo(() => {
    const totalVehicles = vehicles?.items?.length || 0
    const totalRoutes = routes?.items?.length || 0
    const totalAssignments = assignments?.items?.length || 0
    const totalFare = (routes?.items || []).reduce((sum, r) => sum + (r.fare || 0) * (assignments?.items || []).filter(a => a.routeId === r.id).length, 0)

    // Students per vehicle
    const vehicleStats = (vehicles?.items || []).map(v => {
      const vAssignments = (assignments?.items || []).filter(a => a.vehicleId === v.id)
      return {
        name: v.vehicleNo,
        type: v.type,
        capacity: v.capacity,
        assigned: vAssignments.length,
        utilization: v.capacity > 0 ? Math.round((vAssignments.length / v.capacity) * 100) : 0,
        driver: v.driverName,
      }
    })

    // Students per route
    const routeStats = (routes?.items || []).map(r => {
      const rAssignments = (assignments?.items || []).filter(a => a.routeId === r.id)
      return {
        name: r.name,
        from: r.startPoint,
        to: r.endPoint,
        distance: r.distance,
        fare: r.fare,
        students: rAssignments.length,
        revenue: r.fare * rAssignments.length,
      }
    })

    // Assigned students detail
    const assignedStudents = (assignments?.items || []).map(a => {
      const student = (students?.items || []).find(s => s.id === a.studentId)
      const route = (routes?.items || []).find(r => r.id === a.routeId)
      const vehicle = (vehicles?.items || []).find(v => v.id === a.vehicleId)
      return {
        id: a.id,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        admissionNo: student?.admissionNo || '-',
        className: student?.className || '-',
        routeName: route?.name || '-',
        pickupPoint: a.pickupPoint || '-',
        vehicleNo: vehicle?.vehicleNo || '-',
        fare: route?.fare || 0,
      }
    })

    return { totalVehicles, totalRoutes, totalAssignments, totalFare, vehicleStats, routeStats, assignedStudents }
  }, [vehicles, routes, assignments, students])

  const vehicleUtilData = stats.vehicleStats.map(v => ({ name: v.name, utilized: v.assigned, capacity: v.capacity }))

  const routeRevenueData = stats.routeStats.map(r => ({ name: r.name, revenue: r.revenue, students: r.students }))

  const vehicleTypeData = useMemo(() => {
    const types: Record<string, number> = {}
    for (const v of vehicles?.items || []) {
      types[v.type] = (types[v.type] || 0) + 1
    }
    return Object.entries(types).map(([name, value]) => ({ name, value }))
  }, [vehicles])

  const PIE_COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6']

  const handlePrint = () => {
    window.print()
    toast.success('Print dialog opened')
  }

  return (
    <div>
      <PageHeader
        title="Transport Report"
        subtitle="Vehicle utilization, route revenue, and student assignments"
        extra={
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" /> Print Report
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Vehicles" value={stats.totalVehicles} icon={Bus} color="sky" />
        <StatCard title="Total Routes" value={stats.totalRoutes} icon={RouteIcon} color="violet" />
        <StatCard title="Students Assigned" value={stats.totalAssignments} icon={Users} color="emerald" subtitle="using transport" />
        <StatCard title="Total Revenue" value={formatCurrency(stats.totalFare)} icon={DollarSign} color="amber" subtitle="from transport fees" />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vehicle Utilization</CardTitle>
            <CardDescription>Assigned vs capacity per vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={vehicleUtilData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="utilized" stackId="a" fill="#10b981" name="Assigned" radius={[0, 0, 0, 0]} />
                <Bar dataKey="capacity" stackId="a" fill="#e5e7eb" name="Available" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Vehicle Types</CardTitle>
            <CardDescription>Distribution by vehicle type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={vehicleTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {vehicleTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle table */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Vehicle-wise Summary</CardTitle>
          <CardDescription>Capacity, assignments, and driver details</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Vehicle No</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead className="text-center">Capacity</TableHead>
                <TableHead className="text-center">Assigned</TableHead>
                <TableHead className="text-center">Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.vehicleStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No vehicles found</TableCell>
                </TableRow>
              ) : (
                stats.vehicleStats.map(v => (
                  <TableRow key={v.name} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{v.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs">{v.type}</Badge></TableCell>
                    <TableCell className="text-sm">{v.driver}</TableCell>
                    <TableCell className="text-center text-sm">{v.capacity}</TableCell>
                    <TableCell className="text-center text-sm font-medium">{v.assigned}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={v.utilization >= 80 ? 'text-rose-600' : v.utilization >= 50 ? 'text-amber-600' : 'text-emerald-600'}>
                        {v.utilization}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Route table */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Route-wise Summary</CardTitle>
          <CardDescription>Students, distance, and revenue per route</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead>Route</TableHead>
                <TableHead>From → To</TableHead>
                <TableHead className="text-center">Distance</TableHead>
                <TableHead className="text-center">Fare</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead className="text-center">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.routeStats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No routes found</TableCell>
                </TableRow>
              ) : (
                stats.routeStats.map(r => (
                  <TableRow key={r.name} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {r.from} → {r.to}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm">{r.distance} km</TableCell>
                    <TableCell className="text-center text-sm">{formatCurrency(r.fare)}</TableCell>
                    <TableCell className="text-center text-sm font-medium">{r.students}</TableCell>
                    <TableCell className="text-center text-sm font-semibold text-emerald-600">{formatCurrency(r.revenue)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assigned students table */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Transport Assignments</CardTitle>
              <CardDescription>Students using school transport ({stats.assignedStudents.length} total)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 sticky top-0">
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Pickup Point</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead className="text-center">Fare</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.assignedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-8">No transport assignments</TableCell>
                  </TableRow>
                ) : (
                  stats.assignedStudents.map(s => (
                    <TableRow key={s.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <UserAvatar name={s.studentName} size="sm" />
                          <div>
                            <p className="text-sm font-medium">{s.studentName}</p>
                            <p className="text-xs text-muted-foreground">{s.admissionNo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{s.className}</TableCell>
                      <TableCell className="text-sm">{s.routeName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.pickupPoint}</TableCell>
                      <TableCell className="text-sm font-mono">{s.vehicleNo}</TableCell>
                      <TableCell className="text-center text-sm font-medium">{formatCurrency(s.fare)}</TableCell>
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
