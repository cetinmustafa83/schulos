'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useList, useCreate, useUpdate, useDelete } from '@/hooks/use-data'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BookPlus, BookOpen, Trash2, Pencil, Plus, ChevronLeft, ChevronRight, Eraser, Undo2, Redo2, Download, Archive, Notebook as NotebookIcon, Type, Pen, Highlighter } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/constants'

interface Stroke {
  points: { x: number; y: number; pressure?: number }[]
  color: string
  width: number
  tool: 'pen' | 'highlighter' | 'eraser'
}

interface NotebookPageData {
  id?: string
  pageNumber: number
  title?: string
  content?: string
  strokes: Stroke[]
  background: string
}

const PEN_COLORS = ['#1e293b', '#0ea5e9', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff']
const BACKGROUNDS = [
  { value: 'lined', label: 'Lined' },
  { value: 'grid', label: 'Grid' },
  { value: 'blank', label: 'Blank' },
  { value: 'dotted', label: 'Dotted' },
]
const COVER_COLORS = [
  { value: '#0ea5e9', label: 'Sky' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#f43f5e', label: 'Rose' },
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#1e293b', label: 'Slate' },
]

export function DigitalNotebookModule() {
  const [selectedNotebook, setSelectedNotebook] = useState<any>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', color: '#0ea5e9', cover: 'lined', ownerType: 'TEACHER', ownerId: 'current-user' })

  const { data, isLoading, refetch } = useList<any>('notebooks')
  const createMut = useCreate('notebooks')
  const deleteMut = useDelete('notebooks')

  const handleCreate = async () => {
    if (!form.title) {
      toast.error('Title is required')
      return
    }
    const nb = await createMut.mutateAsync(form)
    setCreateOpen(false)
    setForm({ title: '', description: '', color: '#0ea5e9', cover: 'lined', ownerType: 'TEACHER', ownerId: 'current-user' })
    refetch()
    toast.success('Notebook created')
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMut.mutateAsync(deleteId)
    setDeleteId(null)
    refetch()
    toast.success('Notebook deleted')
  }

  if (selectedNotebook) {
    return <NotebookEditor notebook={selectedNotebook} onBack={() => { setSelectedNotebook(null); refetch() }} />
  }

  return (
    <div>
      <PageHeader
        title="Digital Notebook"
        subtitle="Create digital notebooks with iPad Pencil drawing support"
        onAdd={() => setCreateOpen(true)}
        addLabel="New Notebook"
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-sky-100 dark:bg-sky-950/40 p-2.5">
              <NotebookIcon className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{data?.total || 0}</p>
              <p className="text-xs text-muted-foreground">Total Notebooks</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 dark:bg-emerald-950/40 p-2.5">
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(data?.items || []).filter(n => !n.isArchived).length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 dark:bg-amber-950/40 p-2.5">
              <Archive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{(data?.items || []).filter(n => n.isArchived).length}</p>
              <p className="text-xs text-muted-foreground">Archived</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-violet-100 dark:bg-violet-950/40 p-2.5">
              <Pen className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-bold">Pencil Ready</p>
              <p className="text-xs text-muted-foreground">Touch & stylus</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notebook grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : (data?.items || []).length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="inline-flex rounded-2xl bg-muted p-4 mb-4">
              <NotebookIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold">No notebooks yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Create your first digital notebook. Supports iPad Pencil, touch drawing, and text input.
            </p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <BookPlus className="h-4 w-4 mr-1" /> Create Notebook
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(data?.items || []).map((nb) => (
            <motion.div
              key={nb.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
            >
              <Card
                className="overflow-hidden cursor-pointer group relative"
                onClick={() => setSelectedNotebook(nb)}
              >
                {/* Cover */}
                <div
                  className="h-24 relative"
                  style={{ background: `linear-gradient(135deg, ${nb.color || '#0ea5e9'}, ${nb.color || '#0ea5e9'}cc)` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <NotebookIcon className="h-8 w-8 text-white/80" />
                  </div>
                  {nb.isArchived && (
                    <Badge className="absolute top-2 right-2 bg-black/30 text-white">
                      <Archive className="h-3 w-3 mr-1" /> Archived
                    </Badge>
                  )}
                </div>
                {/* Body */}
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm truncate">{nb.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{nb.description || 'No description'}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-[10px]">{nb.ownerType}</Badge>
                    <span className="text-[10px] text-muted-foreground">{formatDate(nb.updatedAt)}</span>
                  </div>
                </CardContent>
                {/* Delete on hover */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 bg-black/20 hover:bg-rose-500 text-white"
                  onClick={(e) => { e.stopPropagation(); setDeleteId(nb.id) }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Notebook</DialogTitle>
            <DialogDescription className="sr-only">Create a new digital notebook with drawing support</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm">Title <span className="text-rose-500">*</span></Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Mathematics Notes" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm">Owner Type</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {['TEACHER', 'STUDENT'].map(t => (
                  <button
                    key={t}
                    onClick={() => setForm({ ...form, ownerType: t })}
                    className={cn(
                      'rounded-lg border p-2 text-sm font-medium transition-colors',
                      form.ownerType === t ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-muted'
                    )}
                  >
                    {t === 'TEACHER' ? 'Teacher' : 'Student'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm">Cover Color</Label>
              <div className="flex gap-2 mt-1.5">
                {COVER_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setForm({ ...form, color: c.value })}
                    className={cn(
                      'h-8 w-8 rounded-full ring-2 ring-offset-2 transition-all',
                      form.color === c.value ? 'ring-primary scale-110' : 'ring-transparent'
                    )}
                    style={{ backgroundColor: c.value }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label className="text-sm">Page Style</Label>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {BACKGROUNDS.map(b => (
                  <button
                    key={b.value}
                    onClick={() => setForm({ ...form, cover: b.value })}
                    className={cn(
                      'rounded-lg border p-2 text-xs font-medium transition-colors',
                      form.cover === b.value ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-muted'
                    )}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMut.isPending}>
              {createMut.isPending ? 'Creating...' : 'Create Notebook'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this notebook?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the notebook and all its pages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-500 hover:bg-rose-600">
              {deleteMut.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ==================== Notebook Editor ====================

function NotebookEditor({ notebook, onBack }: { notebook: any; onBack: () => void }) {
  const { data: pagesData, refetch } = useList<any>('notebook-pages', { notebookId: notebook.id })
  const [pages, setPages] = useState<NotebookPageData[]>([])
  const [currentPageIdx, setCurrentPageIdx] = useState(0)
  const [showText, setShowText] = useState(false)
  const [textContent, setTextContent] = useState('')
  const [pageTitle, setPageTitle] = useState('')
  const createPageMut = useCreate('notebook-pages')
  const updatePageMut = useUpdate('notebook-pages')

  // Sync pages from API (use useMemo to avoid setState in effect)
  const apiPages = useMemo(() => {
    if (!pagesData?.items || pagesData.items.length === 0) return []
    return pagesData.items.map((p: any) => ({
      id: p.id,
      pageNumber: p.pageNumber,
      title: p.title || '',
      content: p.content || '',
      strokes: p.strokes ? (typeof p.strokes === 'string' ? JSON.parse(p.strokes) : p.strokes) : [],
      background: p.background || notebook.cover || 'lined',
    }))
  }, [pagesData, notebook.cover, notebook.id])

  // Use apiPages if available, otherwise local state
  const effectivePages = apiPages.length > 0 ? apiPages : pages

  // Auto-create first page when notebook is empty
  const hasCreatedFirst = useRef(false)
  useEffect(() => {
    if (pagesData && pagesData.items?.length === 0 && !hasCreatedFirst.current) {
      hasCreatedFirst.current = true
      createPageMut.mutateAsync({
        notebookId: notebook.id,
        pageNumber: 1,
        title: 'Page 1',
        strokes: '[]',
        background: notebook.cover || 'lined',
      })
    }
  }, [pagesData, notebook.id, notebook.cover, createPageMut])

  const currentPage = effectivePages[currentPageIdx]

  const savePage = useCallback(async (page: NotebookPageData) => {
    if (!page.id) return
    await updatePageMut.mutateAsync({
      id: page.id,
      data: {
        title: pageTitle,
        content: textContent,
        strokes: JSON.stringify(page.strokes),
        background: page.background,
      },
    })
  }, [pageTitle, textContent, updatePageMut])

  const handleAddPage = async () => {
    const newPageNum = effectivePages.length + 1
    const newPage: NotebookPageData = {
      pageNumber: newPageNum,
      title: `Page ${newPageNum}`,
      strokes: [],
      background: notebook.cover || 'lined',
    }
    const created = await createPageMut.mutateAsync({
      notebookId: notebook.id,
      pageNumber: newPageNum,
      title: `Page ${newPageNum}`,
      strokes: '[]',
      background: notebook.cover || 'lined',
    })
    setPages([...effectivePages, { ...newPage, id: created.id }])
    setCurrentPageIdx(effectivePages.length)
    setTextContent('')
    setPageTitle(`Page ${newPageNum}`)
    refetch()
    toast.success(`Page ${newPageNum} added`)
  }

  if (!currentPage) {
    return <div className="flex items-center justify-center py-12 text-sm text-muted-foreground">Loading notebook...</div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: notebook.color || '#0ea5e9' }}>
              <NotebookIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold leading-none">{notebook.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{effectivePages.length} pages</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAddPage} disabled={createPageMut.isPending}>
            <Plus className="h-4 w-4 mr-1" /> Add Page
          </Button>
        </div>
      </div>

      {/* Page navigation */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <Button variant="outline" size="sm" onClick={() => setCurrentPageIdx(Math.max(0, currentPageIdx - 1))} disabled={currentPageIdx === 0}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Page</span>
          <Input
            value={pageTitle || `Page ${currentPageIdx + 1}`}
            onChange={(e) => setPageTitle(e.target.value)}
            className="h-7 w-40 text-sm"
            placeholder={`Page ${currentPageIdx + 1}`}
          />
          <span className="text-muted-foreground">of {effectivePages.length}</span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setCurrentPageIdx(Math.min(effectivePages.length - 1, currentPageIdx + 1))} disabled={currentPageIdx === effectivePages.length - 1}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0">
        <DrawingCanvas
          key={currentPageIdx}
          page={currentPage}
          onChange={(strokes) => {
            const newPages = [...effectivePages]
            newPages[currentPageIdx] = { ...currentPage, strokes }
            setPages(newPages)
          }}
          onSave={(strokes) => {
            const newPages = [...effectivePages]
            newPages[currentPageIdx] = { ...currentPage, strokes }
            setPages(newPages)
            savePage({ ...currentPage, strokes })
          }}
          showText={showText}
          textContent={textContent}
          onTextChange={setTextContent}
        />
      </div>

      {/* Page thumbnails */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t overflow-x-auto">
        {effectivePages.map((p, i) => (
          <button
            key={i}
            onClick={() => { setCurrentPageIdx(i); setTextContent(p.content || ''); setPageTitle(p.title || `Page ${i + 1}`) }}
            className={cn(
              'shrink-0 h-16 w-12 rounded border-2 flex items-center justify-center text-xs font-medium transition-all',
              i === currentPageIdx ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted'
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

// ==================== Drawing Canvas (iPad Pencil Support) ====================

function DrawingCanvas({ page, onChange, onSave, showText, textContent, onTextChange }: {
  page: NotebookPageData
  onChange: (strokes: Stroke[]) => void
  onSave: (strokes: Stroke[]) => void
  showText: boolean
  textContent: string
  onTextChange: (v: string) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)
  const [tool, setTool] = useState<'pen' | 'highlighter' | 'eraser'>('pen')
  const [color, setColor] = useState('#1e293b')
  const [width, setWidth] = useState(2)
  const [history, setHistory] = useState<Stroke[][]>([page.strokes])
  const [historyIdx, setHistoryIdx] = useState(0)

  const strokes = page.strokes

  const drawBackground = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)

    if (page.background === 'lined') {
      ctx.strokeStyle = '#e0e7ff'
      ctx.lineWidth = 1
      const lineSpacing = 28
      for (let y = lineSpacing; y < h; y += lineSpacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
    } else if (page.background === 'grid') {
      ctx.strokeStyle = '#e0e7ff'
      ctx.lineWidth = 0.5
      const spacing = 20
      for (let x = 0; x < w; x += spacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
      }
      for (let y = 0; y < h; y += spacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
    } else if (page.background === 'dotted') {
      ctx.fillStyle = '#c7d2fe'
      const spacing = 20
      for (let x = spacing; x < w; x += spacing) {
        for (let y = spacing; y < h; y += spacing) {
          ctx.beginPath()
          ctx.arc(x, y, 1, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
  }

  const redraw = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    drawBackground(ctx, rect.width, rect.height)

    // Draw all strokes
    for (const stroke of strokes) {
      drawStroke(ctx, stroke)
    }
  }

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    if (stroke.points.length < 2) return
    ctx.save()
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    if (stroke.tool === 'highlighter') {
      ctx.globalAlpha = 0.3
      ctx.lineWidth = stroke.width * 4
    } else if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = stroke.width * 6
    } else {
      ctx.lineWidth = stroke.width
    }
    ctx.strokeStyle = stroke.color
    ctx.beginPath()
    const first = stroke.points[0]
    ctx.moveTo(first.x, first.y)
    for (let i = 1; i < stroke.points.length; i++) {
      const p = stroke.points[i]
      // Use quadratic curves for smoother lines
      const prev = stroke.points[i - 1]
      const midX = (prev.x + p.x) / 2
      const midY = (prev.y + p.y) / 2
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY)
    }
    ctx.stroke()
    ctx.restore()
  }

  // Resize canvas
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
        redraw()
      }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [strokes, page.background])

  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure || 1,
    }
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    canvasRef.current?.setPointerCapture(e.pointerId)
    const pos = getPos(e)
    const newStroke: Stroke = {
      points: [pos],
      color: tool === 'eraser' ? '#ffffff' : color,
      width: width * (pos.pressure || 1),
      tool,
    }
    setCurrentStroke(newStroke)
    setIsDrawing(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing || !currentStroke) return
    e.preventDefault()
    const pos = getPos(e)
    const updatedStroke = {
      ...currentStroke,
      points: [...currentStroke.points, pos],
      width: width * (pos.pressure || 1),
    }
    setCurrentStroke(updatedStroke)

    // Draw incrementally for performance
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    // Redraw just the current stroke
    redraw()
    drawStroke(ctx, updatedStroke)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing || !currentStroke) return
    e.preventDefault()
    canvasRef.current?.releasePointerCapture(e.pointerId)
    const newStrokes = [...strokes, currentStroke]
    onChange(newStrokes)

    // Save to history
    const newHistory = history.slice(0, historyIdx + 1)
    newHistory.push(newStrokes)
    setHistory(newHistory)
    setHistoryIdx(newHistory.length - 1)

    setCurrentStroke(null)
    setIsDrawing(false)

    // Auto-save
    onSave(newStrokes)
  }

  const undo = () => {
    if (historyIdx > 0) {
      const newIdx = historyIdx - 1
      setHistoryIdx(newIdx)
      const prevStrokes = history[newIdx]
      onChange(prevStrokes)
      onSave(prevStrokes)
    }
  }

  const redo = () => {
    if (historyIdx < history.length - 1) {
      const newIdx = historyIdx + 1
      setHistoryIdx(newIdx)
      const nextStrokes = history[newIdx]
      onChange(nextStrokes)
      onSave(nextStrokes)
    }
  }

  const clearCanvas = () => {
    onChange([])
    onSave([])
    setHistory((prev) => [...prev, []])
    setHistoryIdx(history.length)
    toast.success('Canvas cleared')
  }

  const downloadPage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `page-${page.pageNumber}.png`
    link.href = canvas.toDataURL()
    link.click()
    toast.success('Page downloaded as PNG')
  }

  const toolBtn = (t: typeof tool, icon: any, label: string) => (
    <button
      onClick={() => setTool(t)}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        tool === t ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
      )}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Drawing toolbar */}
      <div className="flex items-center gap-2 mb-2 p-2 rounded-lg border bg-card">
        <div className="flex items-center gap-1">
          {toolBtn('pen', <Pen className="h-4 w-4" />, 'Pen')}
          {toolBtn('highlighter', <Highlighter className="h-4 w-4" />, 'Highlight')}
          {toolBtn('eraser', <Eraser className="h-4 w-4" />, 'Eraser')}
        </div>
        <div className="h-6 w-px bg-border" />
        {/* Colors */}
        <div className="flex items-center gap-1">
          {PEN_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                'h-6 w-6 rounded-full ring-2 ring-offset-1 transition-all',
                color === c ? 'ring-primary scale-110' : 'ring-transparent'
              )}
              style={{ backgroundColor: c, border: c === '#ffffff' ? '1px solid #e2e8f0' : 'none' }}
            />
          ))}
        </div>
        <div className="h-6 w-px bg-border" />
        {/* Width */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Size</span>
          <input
            type="range"
            min={1}
            max={10}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-xs font-mono w-6">{width}</span>
        </div>
        <div className="h-6 w-px bg-border" />
        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={historyIdx === 0} title="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={historyIdx === history.length - 1} title="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={clearCanvas} title="Clear">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={downloadPage} title="Download PNG">
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className={cn('h-8 w-8', showText && 'bg-primary/10 text-primary')} onClick={() => {}} title="Toggle text">
            <Type className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas area */}
      <div ref={containerRef} className="flex-1 min-h-0 relative rounded-lg border overflow-hidden bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="absolute inset-0 touch-none"
          style={{ touchAction: 'none' }}
        />
        {/* iPad Pencil indicator */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-full bg-black/5 px-2.5 py-1 text-xs text-muted-foreground">
          <Pen className="h-3 w-3" />
          <span>Pencil & Touch Ready</span>
        </div>
      </div>
    </div>
  )
}
