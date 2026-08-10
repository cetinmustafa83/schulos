'use client'

import { ResourceModule, col } from '@/components/shared/resource-module'

export function LessonPlanModule() {
  return (
    <ResourceModule
      resourceKey="lesson-plans"
      title="Lesson Plans"
      subtitle="Plan and organize teaching lessons"
      addLabel="Add Lesson"
      columns={[
        col.text('title', 'Title'),
        col.text('topic', 'Topic'),
        col.text('duration', 'Duration'),
        col.badge('status', 'Status'),
      ]}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true, fullWidth: true },
        { name: 'classId', label: 'Class ID', type: 'text' },
        { name: 'subjectId', label: 'Subject ID', type: 'text' },
        { name: 'topic', label: 'Topic', type: 'text', fullWidth: true },
        { name: 'overview', label: 'Overview', type: 'textarea', fullWidth: true },
        { name: 'objectives', label: 'Objectives', type: 'textarea', fullWidth: true },
        { name: 'activities', label: 'Activities', type: 'textarea', fullWidth: true },
        { name: 'resources', label: 'Resources', type: 'textarea', fullWidth: true },
        { name: 'duration', label: 'Duration', type: 'text', placeholder: 'e.g., 3 periods' },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'DRAFT', label: 'Draft' },
          { value: 'PUBLISHED', label: 'Published' },
        ], default: 'DRAFT' },
      ]}
    />
  )
}
