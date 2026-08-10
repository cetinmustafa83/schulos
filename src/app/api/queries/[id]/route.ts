import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCrudHandler } from '@/lib/api-helpers'

const handler = createCrudHandler(db.admissionQuery, {
  searchFields: ['name', 'phone', 'classApplied'],
  defaultOrderBy: { createdAt: 'desc' },
})

export const GET = handler.get
export const PUT = handler.update
export const DELETE = handler.remove
