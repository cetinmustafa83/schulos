import { NextRequest, NextResponse } from 'next/server'

type PrismaDelegate = {
  findMany: (args?: any) => Promise<any[]>
  findUnique: (args: any) => Promise<any>
  create: (args: any) => Promise<any>
  update: (args: any) => Promise<any>
  delete: (args: any) => Promise<any>
  count: (args?: any) => Promise<number>
}

interface CrudOptions {
  searchFields?: string[]
  defaultOrderBy?: Record<string, 'asc' | 'desc'>
}

// Generic CRUD handler factory
export function createCrudHandler(delegate: PrismaDelegate, options: CrudOptions = {}) {
  return {
    async list(req: NextRequest) {
      try {
        const { searchParams } = new URL(req.url)
        const search = searchParams.get('search') || ''
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '50')
        const status = searchParams.get('status')
        const classId = searchParams.get('classId')

        const where: any = {}
        if (search && options.searchFields?.length) {
          where.OR = options.searchFields.map((f) => ({ [f]: { contains: search } }))
        }
        if (status) where.status = status
        if (classId) where.classId = classId

        const [items, total] = await Promise.all([
          delegate.findMany({
            where,
            orderBy: options.defaultOrderBy,
            skip: (page - 1) * limit,
            take: limit,
          }),
          delegate.count({ where }),
        ])

        return NextResponse.json({ items, total, page, limit })
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
      }
    },

    async create(req: NextRequest) {
      try {
        const body = await req.json()
        const item = await delegate.create({ data: body })
        return NextResponse.json(item, { status: 201 })
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
      }
    },

    async get(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
      try {
        const { id } = await params
        const item = await delegate.findUnique({ where: { id } })
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(item)
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
      }
    },

    async update(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
      try {
        const { id } = await params
        const body = await req.json()
        const item = await delegate.update({ where: { id }, data: body })
        return NextResponse.json(item)
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
      }
    },

    async remove(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
      try {
        const { id } = await params
        await delegate.delete({ where: { id } })
        return NextResponse.json({ success: true })
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
      }
    },
  }
}
