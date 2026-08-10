import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCrudHandler } from '@/lib/api-helpers'

const handler = createCrudHandler(db.vehicle, {
  searchFields: ['vehicleNo', 'driverName', 'type'],
  defaultOrderBy: { createdAt: 'desc' },
})

export const GET = handler.list
export const POST = handler.create
