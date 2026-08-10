import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCrudHandler } from '@/lib/api-helpers'

const handler = createCrudHandler(db.event, {
  searchFields: ['title', 'description'],
  defaultOrderBy: {"startDate":"asc"},
})

export const GET = handler.list
export const POST = handler.create
