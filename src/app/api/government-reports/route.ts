import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const schoolId = session.user.schoolId
    if (!schoolId) return NextResponse.json([])
    
    const reports = await db.governmentReport.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reports)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const role = session.user.role
    if (role !== 'SCHOOL_ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await request.json()
    const report = await db.governmentReport.create({
      data: { ...body, schoolId: session.user.schoolId!, createdBy: session.user.id },
    })
    return NextResponse.json(report, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
