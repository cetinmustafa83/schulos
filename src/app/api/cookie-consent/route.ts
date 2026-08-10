import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    if (sessionId) {
      const consent = await db.cookieConsent.findUnique({ where: { sessionId } })
      return NextResponse.json(consent || { consentGiven: false })
    }
    const all = await db.cookieConsent.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
    return NextResponse.json({ items: all, total: all.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { sessionId } = body
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 })
    const consent = await db.cookieConsent.upsert({
      where: { sessionId },
      update: { ...body, consentGiven: true, updatedAt: new Date() },
      create: { ...body, consentGiven: true },
    })
    return NextResponse.json(consent)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
