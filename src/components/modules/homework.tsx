'use client'

import { ResourceModule, col } from '@/components/shared/resource-module'

export function HomeworkModule() {
  return (
    <ResourceModule
      resourceKey="homework"
      title="Homework"
      subtitle="Assign and track student homework"
      addLabel="Add Homework"
      columns={[
        col.text('title', 'Title'),
        col.text('description', 'Description'),
        col.date('dueDate', 'Due Date'),
        col.badge('status', 'Status'),
      ]}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true, fullWidth: true },
        { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
        { name: 'classId', label: 'Class ID', type: 'text' },
        { name: 'subjectId', label: 'Subject ID', type: 'text' },
        { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'ASSIGNED', label: 'Assigned' },
          { value: 'SUBMITTED', label: 'Submitted' },
          { value: 'EVALUATED', label: 'Evaluated' },
        ], default: 'ASSIGNED' },
      ]}
    />
  )
}
