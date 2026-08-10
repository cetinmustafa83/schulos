import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCrudHandler } from '@/lib/api-helpers'

const handler = createCrudHandler(db.feeType, {
  searchFields: ['name', 'code'],
  defaultOrderBy: { createdAt: 'desc' },
})

export const GET = handler.list
export const POST = handler.create
