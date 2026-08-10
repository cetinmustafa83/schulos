'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResourceModule, col } from '@/components/shared/resource-module'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function DormitoryModule() {
  const [tab, setTab] = useState('dorms')
  return (
    <div>
      <PageHeader title="Dormitory" subtitle="Hostel management and room allotment" />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="dorms">Dormitories</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
        </TabsList>
        <TabsContent value="dorms">
          <ResourceModule
            resourceKey="dormitories"
            title="Dormitories"
            subtitle="Hostel buildings and wardens"
            addLabel="Add Dormitory"
            columns={[
              col.text('name', 'Name'),
              col.text('type', 'Type'),
              col.text('wardenName', 'Warden'),
              col.text('wardenPhone', 'Warden Phone'),
              col.text('capacity', 'Capacity'),
            ]}
            fields={[
              { name: 'name', label: 'Name', type: 'text', required: true, fullWidth: true },
              { name: 'type', label: 'Type', type: 'select', options: [
                { value: 'BOYS', label: 'Boys' },
                { value: 'GIRLS', label: 'Girls' },
                { value: 'MIXED', label: 'Mixed' },
              ]},
              { name: 'wardenName', label: 'Warden Name', type: 'text' },
              { name: 'wardenPhone', label: 'Warden Phone', type: 'tel' },
              { name: 'capacity', label: 'Capacity', type: 'number', default: 50 },
            ]}
          />
        </TabsContent>
        <TabsContent value="rooms">
          <ResourceModule
            resourceKey="dormitory-rooms"
            title="Rooms"
            subtitle="Dormitory rooms and occupancy"
            addLabel="Add Room"
            columns={[
              col.text('roomNo', 'Room No'),
              col.text('roomType', 'Type'),
              col.text('capacity', 'Capacity'),
              col.text('occupied', 'Occupied'),
              {
                key: 'availability', header: 'Status', cell: (row) => {
                  const avail = row.capacity - row.occupied
                  return (
                    <Badge variant="outline" className={avail > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {avail > 0 ? `${avail} available` : 'Full'}
                    </Badge>
                  )
                },
              },
              col.currency('fee', 'Fee'),
            ]}
            fields={[
              { name: 'dormitoryId', label: 'Dormitory ID', type: 'text', required: true },
              { name: 'roomNo', label: 'Room No', type: 'text', required: true },
              { name: 'roomType', label: 'Room Type', type: 'select', options: [
                { value: 'SINGLE', label: 'Single' },
                { value: 'SHARED', label: 'Shared' },
                { value: 'DORMITORY', label: 'Dormitory' },
              ], default: 'SHARED' },
              { name: 'capacity', label: 'Capacity', type: 'number', default: 2 },
              { name: 'occupied', label: 'Occupied', type: 'number', default: 0 },
              { name: 'fee', label: 'Fee', type: 'number' },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
