'use client'

import { useState } from 'react'
import { useList } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable, type Column } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ResourceModule, col } from '@/components/shared/resource-module'
import { useDashboard } from '@/hooks/use-data'
import { StatCard } from '@/components/shared/stat-card'
import { Book, Library, BookCheck, AlertCircle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/constants'

export function LibraryModule() {
  const [tab, setTab] = useState('books')
  const { data: dash } = useDashboard()

  return (
    <div>
      <PageHeader title="Library" subtitle="Books, members and issue management" />
      {dash && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
          <StatCard title="Total Books" value={dash.stats.totalBooks} icon={Book} color="violet" />
          <StatCard title="Available" value={dash.stats.availableBooks} icon={Library} color="emerald" />
          <StatCard title="Issued" value={dash.stats.issuedBooks} icon={BookCheck} color="amber" />
          <StatCard title="Overdue" value={dash.stats.overdueBooks} icon={AlertCircle} color="rose" />
        </div>
      )}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="issues">Issued Books</TabsTrigger>
        </TabsList>
        <TabsContent value="books">
          <ResourceModule
            resourceKey="books"
            title="Books"
            subtitle="Library catalog and inventory"
            addLabel="Add Book"
            columns={[
              col.text('bookNo', 'Book No'),
              col.text('title', 'Title'),
              col.text('author', 'Author'),
              col.text('category', 'Category'),
              col.text('publisher', 'Publisher'),
              {
                key: 'copies', header: 'Copies', cell: (row) => (
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="text-xs">{row.availableCopies}/{row.totalCopies}</Badge>
                  </div>
                ),
              },
              col.currency('price', 'Price'),
            ]}
            fields={[
              { name: 'bookNo', label: 'Book No', type: 'text', required: true },
              { name: 'title', label: 'Title', type: 'text', required: true, fullWidth: true },
              { name: 'author', label: 'Author', type: 'text', required: true },
              { name: 'category', label: 'Category', type: 'select', options: ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Reference', 'Children', 'Textbook'].map(c => ({ value: c, label: c })) },
              { name: 'publisher', label: 'Publisher', type: 'text' },
              { name: 'edition', label: 'Edition', type: 'text' },
              { name: 'isbn', label: 'ISBN', type: 'text' },
              { name: 'price', label: 'Price', type: 'number' },
              { name: 'totalCopies', label: 'Total Copies', type: 'number', default: 1 },
              { name: 'availableCopies', label: 'Available Copies', type: 'number', default: 1 },
              { name: 'rackNo', label: 'Rack No', type: 'text' },
            ]}
          />
        </TabsContent>
        <TabsContent value="issues">
          <BookIssuesPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BookIssuesPanel() {
  const { data, isLoading } = useList<any>('book-issues')
  const { data: books } = useList<any>('books')
  const { data: students } = useList<any>('students')
  const bookMap = new Map((books?.items || []).map((b) => [b.id, b]))
  const studentMap = new Map((students?.items || []).map((s) => [s.id, s]))

  return (
    <DataTable
      columns={[
        {
          key: 'bookId', header: 'Book', cell: (row) => {
            const b = bookMap.get(row.bookId)
            return b ? (
              <div>
                <p className="text-sm font-medium">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.bookNo} • {b.author}</p>
              </div>
            ) : <span className="text-sm">-</span>
          },
        },
        {
          key: 'memberId', header: 'Member', cell: (row) => {
            const s = studentMap.get(row.memberId)
            return s ? <span className="text-sm">{s.firstName} {s.lastName}</span> : <span className="text-sm">{row.memberType}</span>
          },
        },
        col.date('issueDate', 'Issue Date'),
        col.date('dueDate', 'Due Date'),
        col.date('returnDate', 'Return Date'),
        col.currency('fine', 'Fine'),
        col.badge('status', 'Status'),
      ]}
      data={data?.items || []}
      loading={isLoading}
      getKey={(row) => row.id}
      emptyTitle="No books issued"
    />
  )
}
