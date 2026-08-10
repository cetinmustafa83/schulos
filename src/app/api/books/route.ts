import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCrudHandler } from '@/lib/api-helpers'

const handler = createCrudHandler(db.book, {
  searchFields: ['title', 'author', 'bookNo', 'isbn'],
  defaultOrderBy: {"title":"asc"},
})

export const GET = handler.list
export const POST = handler.create
