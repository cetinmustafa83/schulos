import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const schoolId = session.user.schoolId
    if (!schoolId) return NextResponse.json(null)
    
    const config = await db.storageConfig.findUnique({ where: { schoolId } })
    return NextResponse.json(config)
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
    const schoolId = session.user.schoolId!
    const body = await request.json()
    
    const config = await db.storageConfig.upsert({
      where: { schoolId },
      update: { ...body },
      create: { ...body, schoolId },
    })
    return NextResponse.json(config)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
