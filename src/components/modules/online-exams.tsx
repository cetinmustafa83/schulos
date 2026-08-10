'use client'

import { useState, useEffect, useMemo } from 'react'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResourceModule, col } from '@/components/shared/resource-module'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { QUESTION_TYPES, QUESTION_DIFFICULTIES, formatDate } from '@/lib/constants'
import { BookOpen, FileQuestion, CheckCircle2, Clock, Award, Play, ChevronLeft, ChevronRight, Flag, AlertCircle, Timer } from 'lucide-react'
import { useDashboard, useList } from '@/hooks/use-data'
import { StatCard } from '@/components/shared/stat-card'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function OnlineExamsModule() {
  const [tab, setTab] = useState('exams')
  const { data: dash } = useDashboard()

  return (
    <div>
      <PageHeader title="Online Examinations" subtitle="Create online tests, manage question bank, and take exams" />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard title="Published Exams" value={3} icon={FileQuestion} color="sky" />
        <StatCard title="Total Questions" value={8} icon={BookOpen} color="violet" />
        <StatCard title="Avg. Score" value="78%" icon={Award} color="emerald" />
        <StatCard title="Active Now" value={12} icon={Clock} color="amber" />
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="exams">Online Exams</TabsTrigger>
          <TabsTrigger value="take">Take Exam</TabsTrigger>
          <TabsTrigger value="questions">Question Bank</TabsTrigger>
        </TabsList>
        <TabsContent value="exams">
          <ResourceModule
            resourceKey="online-exams"
            title="Online Exams"
            subtitle="Create and manage online tests"
            addLabel="Create Exam"
            columns={[
              col.text('title', 'Exam Title'),
              col.text('totalQuestions', 'Questions'),
              col.text('duration', 'Duration'),
              col.date('startDate', 'Start Date'),
              col.badge('status', 'Status'),
            ]}
            fields={[
              { name: 'title', label: 'Title', type: 'text', required: true, fullWidth: true },
              { name: 'classId', label: 'Class ID', type: 'text' },
              { name: 'subjectId', label: 'Subject ID', type: 'text' },
              { name: 'totalQuestions', label: 'Total Questions', type: 'number', default: 10 },
              { name: 'marksPerQuestion', label: 'Marks per Question', type: 'number', default: 1 },
              { name: 'duration', label: 'Duration (minutes)', type: 'number', default: 60 },
              { name: 'startDate', label: 'Start Date', type: 'date', required: true },
              { name: 'endDate', label: 'End Date', type: 'date' },
              { name: 'status', label: 'Status', type: 'select', options: [
                { value: 'DRAFT', label: 'Draft' },
                { value: 'PUBLISHED', label: 'Published' },
                { value: 'COMPLETED', label: 'Completed' },
              ], default: 'DRAFT' },
            ]}
          />
        </TabsContent>
        <TabsContent value="take">
          <TakeExamPanel />
        </TabsContent>
        <TabsContent value="questions">
          <ResourceModule
            resourceKey="questions"
            title="Question Bank"
            subtitle="Build a repository of questions"
            addLabel="Add Question"
            columns={[
              { key: 'question', header: 'Question', cell: (row) => <span className="text-sm font-medium line-clamp-1">{row.question}</span> },
              {
                key: 'type', header: 'Type', cell: (row) => (
                  <Badge variant="outline" className="text-xs">{row.type.replace(/_/g, ' ')}</Badge>
                ),
              },
              {
                key: 'difficulty', header: 'Difficulty', cell: (row) => {
                  const colors: Record<string, string> = {
                    EASY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                    MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                    HARD: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
                  }
                  return <Badge variant="outline" className={`text-xs ${colors[row.difficulty] || ''}`}>{row.difficulty}</Badge>
                },
              },
              { key: 'answer', header: 'Answer', cell: (row) => <span className="text-sm text-muted-foreground">{row.answer || '-'}</span> },
            ]}
            fields={[
              { name: 'question', label: 'Question', type: 'textarea', required: true, fullWidth: true },
              { name: 'type', label: 'Type', type: 'select', options: QUESTION_TYPES.map(t => ({ value: t, label: t.replace(/_/g, ' ') })) },
              { name: 'options', label: 'Options (comma-separated for MCQ)', type: 'text', fullWidth: true, placeholder: 'Option A, Option B, Option C, Option D' },
              { name: 'answer', label: 'Correct Answer', type: 'text' },
              { name: 'subjectId', label: 'Subject ID', type: 'text' },
              { name: 'difficulty', label: 'Difficulty', type: 'select', options: QUESTION_DIFFICULTIES.map(d => ({ value: d, label: d })) },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// --- Take Exam Panel ---

function TakeExamPanel() {
  const [activeExam, setActiveExam] = useState<any>(null)
  const { data: exams } = useList<any>('online-exams')
  const { data: questions } = useList<any>('questions')

  const publishedExams = (exams?.items || []).filter(e => e.status === 'PUBLISHED')

  if (activeExam) {
    return <ExamRunner exam={activeExam} questions={(questions?.items || []).slice(0, activeExam.totalQuestions || 5)} onExit={() => setActiveExam(null)} />
  }

  return (
    <div>
      <Card className="mb-4">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="rounded-lg bg-sky-100 dark:bg-sky-950/40 p-2.5">
            <AlertCircle className="h-5 w-5 text-sky-600 dark:text-sky-400" />
          </div>
          <div>
            <p className="text-sm font-medium">Available Online Exams</p>
            <p className="text-xs text-muted-foreground">Click "Start Exam" to begin. The timer starts immediately.</p>
          </div>
        </CardContent>
      </Card>

      {publishedExams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="inline-flex rounded-2xl bg-muted p-4 mb-4">
              <FileQuestion className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold">No published exams</h3>
            <p className="text-sm text-muted-foreground mt-1">Create and publish an exam first to make it available for students.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publishedExams.map((exam) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-lg transition-shadow group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="rounded-lg bg-violet-100 dark:bg-violet-950/40 p-2.5">
                      <FileQuestion className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      Available
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{exam.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <FileQuestion className="h-3 w-3" /> {exam.totalQuestions} Qs
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {exam.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3" /> {exam.marksPerQuestion * exam.totalQuestions} marks
                    </span>
                  </div>
                  <Button className="w-full" size="sm" onClick={() => setActiveExam(exam)}>
                    <Play className="h-4 w-4 mr-1" /> Start Exam
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Exam Runner ---

function ExamRunner({ exam, questions, onExit }: { exam: any; questions: any[]; onExit: () => void }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  // Timer
  useEffect(() => {
    if (submitted) return
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [submitted])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const question = questions[currentQ]
  const options = useMemo(() => {
    if (!question?.options) return []
    try {
      const parsed = JSON.parse(question.options)
      return Array.isArray(parsed) ? parsed : parsed.split(',').map((s: string) => s.trim())
    } catch {
      return String(question.options).split(',').map((s: string) => s.trim())
    }
  }, [question])

  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / questions.length) * 100

  function handleSubmit() {
    let correct = 0
    for (const q of questions) {
      if (answers[q.id] === q.answer) correct++
    }
    const total = questions.length
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
    setResult({
      correct,
      total,
      wrong: total - correct,
      percentage,
      grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 60 ? 'C' : percentage >= 40 ? 'D' : 'F',
      passed: percentage >= 40,
    })
    setSubmitted(true)
    toast.success('Exam submitted successfully!')
  }

  function toggleFlag(qid: string) {
    setFlagged((prev) => {
      const next = new Set(prev)
      if (next.has(qid)) next.delete(qid)
      else next.add(qid)
      return next
    })
  }

  // Result screen
  if (submitted && result) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={cn('inline-flex rounded-full p-5 mb-4', result.passed ? 'bg-emerald-100 dark:bg-emerald-950/40' : 'bg-rose-100 dark:bg-rose-950/40')}
          >
            {result.passed ? <CheckCircle2 className="h-10 w-10 text-emerald-600" /> : <AlertCircle className="h-10 w-10 text-rose-600" />}
          </motion.div>
          <h2 className="text-2xl font-bold">{result.passed ? 'Congratulations!' : 'Better luck next time'}</h2>
          <p className="text-sm text-muted-foreground mt-1">{exam.title}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold text-emerald-600">{result.correct}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold text-rose-600">{result.wrong}</p>
              <p className="text-xs text-muted-foreground">Wrong</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold text-sky-600">{result.percentage}%</p>
              <p className="text-xs text-muted-foreground">Score</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-2xl font-bold text-violet-600">{result.grade}</p>
              <p className="text-xs text-muted-foreground">Grade</p>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            <Button variant="outline" onClick={onExit}>Back to Exams</Button>
            <Button onClick={() => { setSubmitted(false); setResult(null); setCurrentQ(0); setAnswers({}); setFlagged(new Set()); setTimeLeft(exam.duration * 60) }}>
              Retake Exam
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      {/* Main question area */}
      <div>
        {/* Timer bar */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn('rounded-lg p-2', timeLeft < 300 ? 'bg-rose-100 dark:bg-rose-950/40' : 'bg-sky-100 dark:bg-sky-950/40')}>
                  <Timer className={cn('h-5 w-5', timeLeft < 300 ? 'text-rose-600' : 'text-sky-600')} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time Remaining</p>
                  <p className={cn('text-xl font-bold font-mono', timeLeft < 300 && 'text-rose-600 animate-pulse')}>
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Question</p>
                <p className="text-sm font-medium">{currentQ + 1} of {questions.length}</p>
              </div>
            </div>
            <Progress value={progress} className="h-1.5" />
          </CardContent>
        </Card>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">Q{currentQ + 1}</Badge>
                      <Badge variant="outline" className="text-xs">{question?.type?.replace(/_/g, ' ') || 'MCQ'}</Badge>
                      <Badge variant="outline" className={cn('text-xs', question?.difficulty === 'EASY' ? 'text-emerald-600' : question?.difficulty === 'HARD' ? 'text-rose-600' : 'text-amber-600')}>
                        {question?.difficulty || 'MEDIUM'}
                      </Badge>
                    </div>
                    <CardTitle className="text-base leading-relaxed">{question?.question}</CardTitle>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn('shrink-0', flagged.has(question?.id) && 'text-amber-500')}
                    onClick={() => toggleFlag(question?.id)}
                    title="Flag for review"
                  >
                    <Flag className={cn('h-4 w-4', flagged.has(question?.id) && 'fill-current')} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {question?.type === 'FILL_BLANK' ? (
                  <Input
                    placeholder="Type your answer..."
                    value={answers[question?.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                    className="max-w-md"
                  />
                ) : question?.type === 'TRUE_FALSE' ? (
                  <RadioGroup
                    value={answers[question?.id] || ''}
                    onValueChange={(v) => setAnswers({ ...answers, [question.id]: v })}
                  >
                    <div className="space-y-2">
                      {['True', 'False'].map((opt) => (
                        <Label
                          key={opt}
                          htmlFor={`opt-${opt}`}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/40',
                            answers[question?.id] === opt && 'border-primary bg-primary/5'
                          )}
                        >
                          <RadioGroupItem value={opt} id={`opt-${opt}`} />
                          <span className="text-sm font-medium">{opt}</span>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <RadioGroup
                    value={answers[question?.id] || ''}
                    onValueChange={(v) => setAnswers({ ...answers, [question.id]: v })}
                  >
                    <div className="space-y-2">
                      {options.map((opt: string, i: number) => (
                        <Label
                          key={i}
                          htmlFor={`opt-${i}`}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors hover:bg-muted/40',
                            answers[question?.id] === opt && 'border-primary bg-primary/5'
                          )}
                        >
                          <RadioGroupItem value={opt} id={`opt-${i}`} />
                          <span className="text-sm font-medium">{opt}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{String.fromCharCode(65 + i)}</span>
                        </Label>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
            disabled={currentQ === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Previous
          </Button>
          {currentQ === questions.length - 1 ? (
            <Button onClick={() => setConfirmSubmit(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Submit Exam
            </Button>
          ) : (
            <Button onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Question palette sidebar */}
      <div>
        <Card className="sticky top-20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Question Palette</CardTitle>
            <CardDescription className="text-xs">{answeredCount}/{questions.length} answered</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, i) => {
                const isAnswered = !!answers[q.id]
                const isFlagged = flagged.has(q.id)
                const isCurrent = i === currentQ
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQ(i)}
                    className={cn(
                      'aspect-square rounded-lg text-sm font-medium transition-all border-2 relative',
                      isCurrent ? 'ring-2 ring-primary ring-offset-1' : '',
                      isAnswered
                        ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                    )}
                  >
                    {i + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500 border-2 border-background" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300" />
                <span className="text-muted-foreground">Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-muted/40 border border-border" />
                <span className="text-muted-foreground">Not answered ({questions.length - answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-muted-foreground">Flagged ({flagged.size})</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => setConfirmSubmit(true)}
            >
              Submit Exam
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 text-rose-500"
              onClick={onExit}
            >
              Exit Exam
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Submit confirmation */}
      <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Exam?</DialogTitle>
            <DialogDescription className="sr-only">Confirm exam submission</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Answered</span>
                <span className="font-medium text-emerald-600">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unanswered</span>
                <span className="font-medium text-rose-600">{questions.length - answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Flagged</span>
                <span className="font-medium text-amber-600">{flagged.size}</span>
              </div>
            </div>
            {answeredCount < questions.length && (
              <p className="text-sm text-amber-600 dark:text-amber-400 mt-3 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                You have {questions.length - answeredCount} unanswered questions.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmSubmit(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Confirm Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
