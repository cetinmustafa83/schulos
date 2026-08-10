'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResourceModule, col } from '@/components/shared/resource-module'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bus, Route as RouteIcon } from 'lucide-react'

export function TransportModule() {
  const [tab, setTab] = useState('vehicles')
  return (
    <div>
      <PageHeader title="Transportation" subtitle="Vehicles, routes and student assignments" />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="vehicles"><Bus className="h-4 w-4 mr-1 inline" />Vehicles</TabsTrigger>
          <TabsTrigger value="routes"><RouteIcon className="h-4 w-4 mr-1 inline" />Routes</TabsTrigger>
        </TabsList>
        <TabsContent value="vehicles">
          <ResourceModule
            resourceKey="vehicles"
            title="Vehicles"
            subtitle="School buses and transport vehicles"
            addLabel="Add Vehicle"
            columns={[
              col.text('vehicleNo', 'Vehicle No'),
              col.text('type', 'Type'),
              col.text('capacity', 'Capacity'),
              col.text('driverName', 'Driver'),
              col.text('driverPhone', 'Driver Phone'),
              col.badge('status', 'Status'),
            ]}
            fields={[
              { name: 'vehicleNo', label: 'Vehicle No', type: 'text', required: true },
              { name: 'type', label: 'Type', type: 'select', options: [
                { value: 'BUS', label: 'Bus' },
                { value: 'VAN', label: 'Van' },
                { value: 'CAR', label: 'Car' },
              ]},
              { name: 'capacity', label: 'Capacity', type: 'number', default: 30 },
              { name: 'driverName', label: 'Driver Name', type: 'text' },
              { name: 'driverPhone', label: 'Driver Phone', type: 'tel' },
              { name: 'helperName', label: 'Helper Name', type: 'text' },
              { name: 'status', label: 'Status', type: 'select', options: [
                { value: 'ACTIVE', label: 'Active' },
                { value: 'MAINTENANCE', label: 'Maintenance' },
                { value: 'DISABLED', label: 'Disabled' },
              ], default: 'ACTIVE' },
            ]}
          />
        </TabsContent>
        <TabsContent value="routes">
          <ResourceModule
            resourceKey="routes"
            title="Routes"
            subtitle="Transport routes and fare structure"
            addLabel="Add Route"
            columns={[
              col.text('name', 'Route Name'),
              col.text('startPoint', 'From'),
              col.text('endPoint', 'To'),
              col.text('distance', 'Distance'),
              col.currency('fare', 'Fare'),
            ]}
            fields={[
              { name: 'name', label: 'Route Name', type: 'text', required: true, fullWidth: true },
              { name: 'startPoint', label: 'Start Point', type: 'text' },
              { name: 'endPoint', label: 'End Point', type: 'text' },
              { name: 'distance', label: 'Distance (km)', type: 'number' },
              { name: 'fare', label: 'Fare', type: 'number' },
              { name: 'vehicleId', label: 'Vehicle ID', type: 'text' },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
