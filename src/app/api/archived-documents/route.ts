import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId') || session.user.schoolId
    if (!schoolId) return NextResponse.json([])
    
    const category = searchParams.get('category')
    const documentType = searchParams.get('documentType')
    const search = searchParams.get('search')
    
    const where: any = { schoolId }
    if (category) where.category = category
    if (documentType) where.documentType = documentType
    if (search) where.OR = [
      { title: { contains: search } },
      { ocrText: { contains: search } },
      { tags: { contains: search } },
    ]
    
    const docs = await db.archivedDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json(docs)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    
    const role = session.user.role
    if (role !== 'SCHOOL_ADMIN' && role !== 'SUPER_ADMIN' && role !== 'TEACHER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const body = await request.json()
    const doc = await db.archivedDocument.create({
      data: { ...body, schoolId: session.user.schoolId, uploadedBy: session.user.id },
    })
    return NextResponse.json(doc, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
