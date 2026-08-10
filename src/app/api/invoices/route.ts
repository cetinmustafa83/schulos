import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCrudHandler } from '@/lib/api-helpers'

const handler = createCrudHandler(db.invoice, {
  searchFields: ['invoiceNo', 'feeType'],
  defaultOrderBy: { createdAt: 'desc' },
})

export const GET = handler.list
export const POST = handler.create
