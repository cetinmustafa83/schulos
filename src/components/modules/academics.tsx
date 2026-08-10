'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResourceModule, col } from '@/components/shared/resource-module'
import { Card, CardContent } from '@/components/ui/card'
import { useDashboard } from '@/hooks/use-data'
import { StatCard } from '@/components/shared/stat-card'
import { BookOpen, Layers, FileText } from 'lucide-react'

export function AcademicsModule() {
  const [tab, setTab] = useState('classes')
  const { data: dash } = useDashboard()

  return (
    <div>
      <PageHeader title="Academics" subtitle="Classes, sections, subjects and assignments" />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Total Classes" value={dash?.stats.classes || 0} icon={BookOpen} color="sky" />
        <StatCard title="Subjects" value={dash?.stats.subjects || 0} icon={FileText} color="violet" />
        <StatCard title="Departments" value={dash?.stats.departments || 0} icon={Layers} color="emerald" />
        <StatCard title="Active Students" value={dash?.stats.students || 0} icon={BookOpen} color="amber" />
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
        </TabsList>
        <TabsContent value="classes">
          <ResourceModule
            resourceKey="classes"
            title="Classes"
            subtitle="Manage school classes and rooms"
            addLabel="Add Class"
            columns={[
              col.text('name', 'Class Name'),
              col.text('numericName', 'Numeric'),
              col.text('roomNo', 'Room No'),
              col.text('capacity', 'Capacity'),
            ]}
            fields={[
              { name: 'name', label: 'Class Name', type: 'text', required: true, placeholder: 'e.g., Class 10' },
              { name: 'numericName', label: 'Numeric Name', type: 'text', placeholder: 'e.g., 10' },
              { name: 'capacity', label: 'Capacity', type: 'number', default: 40 },
              { name: 'roomNo', label: 'Room No', type: 'text' },
            ]}
          />
        </TabsContent>
        <TabsContent value="sections">
          <ResourceModule
            resourceKey="sections"
            title="Sections"
            subtitle="Manage class sections"
            addLabel="Add Section"
            columns={[
              col.text('name', 'Section'),
              col.text('classId', 'Class ID'),
              col.text('capacity', 'Capacity'),
            ]}
            fields={[
              { name: 'name', label: 'Section Name', type: 'text', required: true, placeholder: 'e.g., A, B, C' },
              { name: 'classId', label: 'Class ID', type: 'text', required: true },
              { name: 'capacity', label: 'Capacity', type: 'number', default: 35 },
            ]}
          />
        </TabsContent>
        <TabsContent value="subjects">
          <ResourceModule
            resourceKey="subjects"
            title="Subjects"
            subtitle="Manage subjects and curriculum"
            addLabel="Add Subject"
            columns={[
              col.text('name', 'Subject'),
              col.text('code', 'Code'),
              col.badge('type', 'Type'),
            ]}
            fields={[
              { name: 'name', label: 'Subject Name', type: 'text', required: true },
              { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'e.g., MATH' },
              { name: 'type', label: 'Type', type: 'select', options: [
                { value: 'CORE', label: 'Core' },
                { value: 'OPTIONAL', label: 'Optional' },
              ], default: 'CORE' },
              { name: 'classId', label: 'Class ID', type: 'text' },
              { name: 'teacherId', label: 'Teacher ID', type: 'text' },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
