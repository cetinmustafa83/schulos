import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCrudHandler } from '@/lib/api-helpers'

const handler = createCrudHandler(db.notebookPage, {
  searchFields: ['title', 'content'],
  defaultOrderBy: { pageNumber: 'asc' },
})

export const GET = handler.list
export const POST = handler.create
