import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const schoolId = session.user.schoolId
    if (!schoolId) return NextResponse.json([])
    
    const metrics = await db.ecoMetric.findMany({
      where: { schoolId },
      orderBy: { date: 'desc' },
      take: 365,
    })
    
    // Aggregate totals
    const totals = metrics.reduce((acc, m) => ({
      paperSavedSheets: acc.paperSavedSheets + m.paperSavedSheets,
      paperSavedGrams: acc.paperSavedGrams + m.paperSavedGrams,
      co2SavedKg: acc.co2SavedKg + m.co2SavedKg,
      waterSavedLiters: acc.waterSavedLiters + m.waterSavedLiters,
      treesSaved: acc.treesSaved + m.treesSaved,
    }), { paperSavedSheets: 0, paperSavedGrams: 0, co2SavedKg: 0, waterSavedLiters: 0, treesSaved: 0 })
    
    return NextResponse.json({ metrics, totals })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const body = await request.json()
    const metric = await db.ecoMetric.create({
      data: { ...body, schoolId: session.user.schoolId! },
    })
    return NextResponse.json(metric, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
