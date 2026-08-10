'use client'

import { ResourceModule, col } from '@/components/shared/resource-module'
import { Badge } from '@/components/ui/badge'
import { FileText, Image as ImageIcon, Video, Music, File } from 'lucide-react'

const TYPE_ICONS: Record<string, any> = {
  PDF: FileText, IMAGE: ImageIcon, VIDEO: Video, AUDIO: Music, DOC: File,
}

const TYPE_COLORS: Record<string, string> = {
  PDF: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
  IMAGE: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
  VIDEO: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
  AUDIO: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  DOC: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
}

export function StudyMaterialsModule() {
  return (
    <ResourceModule
      resourceKey="study-materials"
      title="Study Materials"
      subtitle="Upload and share learning resources"
      addLabel="Upload Material"
      columns={[
        {
          key: 'title', header: 'Title', cell: (row) => (
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${TYPE_COLORS[row.type] || 'bg-muted'}`}>
                {(() => {
                  const Icon = TYPE_ICONS[row.type] || File
                  return <Icon className="h-4 w-4" />
                })()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{row.title}</p>
                <p className="text-xs text-muted-foreground">{row.fileName}</p>
              </div>
            </div>
          ),
        },
        {
          key: 'type', header: 'Type', cell: (row) => (
            <Badge variant="outline" className={TYPE_COLORS[row.type] || ''}>{row.type}</Badge>
          ),
        },
        col.text('fileSize', 'Size'),
        col.badge('status', 'Status'),
      ]}
      fields={[
        { name: 'title', label: 'Title', type: 'text', required: true, fullWidth: true },
        { name: 'type', label: 'Type', type: 'select', required: true, options: [
          { value: 'PDF', label: 'PDF Document' },
          { value: 'IMAGE', label: 'Image' },
          { value: 'VIDEO', label: 'Video' },
          { value: 'AUDIO', label: 'Audio' },
          { value: 'DOC', label: 'Document' },
        ]},
        { name: 'classId', label: 'Class ID', type: 'text' },
        { name: 'subjectId', label: 'Subject ID', type: 'text' },
        { name: 'fileName', label: 'File Name', type: 'text' },
        { name: 'fileType', label: 'File Type', type: 'text' },
        { name: 'fileSize', label: 'File Size', type: 'text', placeholder: 'e.g., 2.5 MB' },
        { name: 'url', label: 'URL', type: 'text', fullWidth: true },
        { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
      ]}
    />
  )
}
