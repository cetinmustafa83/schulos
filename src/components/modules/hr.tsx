'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResourceModule, col } from '@/components/shared/resource-module'
import { Card, CardContent } from '@/components/ui/card'

export function HrModule() {
  const [tab, setTab] = useState('departments')
  return (
    <div>
      <PageHeader title="Human Resources" subtitle="Departments, designations and staff management" />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="designations">Designations</TabsTrigger>
        </TabsList>
        <TabsContent value="departments">
          <ResourceModule
            resourceKey="departments"
            title="Departments"
            subtitle="Organizational departments"
            addLabel="Add Department"
            columns={[
              col.text('name', 'Department'),
              col.text('hod', 'Head of Dept'),
            ]}
            fields={[
              { name: 'name', label: 'Department Name', type: 'text', required: true, fullWidth: true },
              { name: 'hod', label: 'Head of Department', type: 'text' },
            ]}
          />
        </TabsContent>
        <TabsContent value="designations">
          <ResourceModule
            resourceKey="designations"
            title="Designations"
            subtitle="Staff designations and roles"
            addLabel="Add Designation"
            columns={[
              col.text('name', 'Designation'),
            ]}
            fields={[
              { name: 'name', label: 'Designation', type: 'text', required: true, fullWidth: true },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
