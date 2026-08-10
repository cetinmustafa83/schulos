import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCrudHandler } from '@/lib/api-helpers'

const handler = createCrudHandler(db.book, {
  searchFields: ['title', 'author', 'bookNo', 'isbn'],
  defaultOrderBy: {"title":"asc"},
})

export const GET = handler.get
export const PUT = handler.update
export const DELETE = handler.remove
