// Shared constants for the school management system

export const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
  ACCOUNTANT: 'ACCOUNTANT',
  LIBRARIAN: 'LIBRARIAN',
} as const

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrator',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
  ACCOUNTANT: 'Accountant',
  LIBRARIAN: 'Librarian',
}

export const ROLE_BADGE_COLORS: Record<string, string> = {
  ADMIN: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  TEACHER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  STUDENT: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  PARENT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  ACCOUNTANT: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  LIBRARIAN: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
}

export const STATUS_BADGE_COLORS: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  PAID: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  RETURNED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  CONVERTED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  RESOLVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  PRESENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  UNPAID: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  ABSENT: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  REJECTED: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  OVERDUE: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  LOST: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  DISABLED: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300',
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  PARTIAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  LATE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  ISSUED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  ASSIGNED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  DRAFT: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300',
  NEW: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  FOLLOW_UP: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  SUBMITTED: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  EVALUATED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}

export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const TIME_SLOTS = [
  '09:00 - 09:45',
  '09:50 - 10:35',
  '10:50 - 11:35',
  '11:40 - 12:25',
  '13:15 - 14:00',
  '14:05 - 14:50',
  '14:55 - 15:40',
]

export const STUDENT_CATEGORIES = ['General', 'OBC', 'SC', 'ST']
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
export const HOUSES = ['Red', 'Blue', 'Green', 'Yellow']
export const GENDERS = ['Male', 'Female']

export const FEE_FREQUENCIES = ['ONETIME', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY']
export const INVOICE_STATUSES = ['UNPAID', 'PARTIAL', 'PAID', 'OVERDUE']
export const PAYMENT_METHODS = ['CASH', 'BANK', 'CARD', 'ONLINE', 'CHEQUE']

export const EXAM_TYPES = ['FIRST_TERM', 'SECOND_TERM', 'MID_TERM', 'FINAL', 'QUIZ', 'UNIT_TEST']
export const MARK_GRADES = [
  { min: 90, grade: 'A+', color: 'emerald' },
  { min: 80, grade: 'A', color: 'emerald' },
  { min: 70, grade: 'B+', color: 'sky' },
  { min: 60, grade: 'B', color: 'sky' },
  { min: 50, grade: 'C', color: 'amber' },
  { min: 40, grade: 'D', color: 'orange' },
  { min: 0, grade: 'F', color: 'rose' },
]

export const ATTENDANCE_STATUSES = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE']

export const QUESTION_TYPES = ['MCQ', 'TRUE_FALSE', 'FILL_BLANK']
export const QUESTION_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD']

export const BOOK_CATEGORIES = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Reference', 'Children', 'Textbook']

export const FILE_TYPES = [
  { ext: 'pdf', icon: 'FileText', color: 'text-rose-500' },
  { ext: 'jpg', icon: 'Image', color: 'text-sky-500' },
  { ext: 'png', icon: 'Image', color: 'text-sky-500' },
  { ext: 'jpeg', icon: 'Image', color: 'text-sky-500' },
  { ext: 'doc', icon: 'FileText', color: 'text-blue-500' },
  { ext: 'docx', icon: 'FileText', color: 'text-blue-500' },
  { ext: 'mp4', icon: 'Video', color: 'text-violet-500' },
  { ext: 'mp3', icon: 'Music', color: 'text-amber-500' },
]

export const NOTICE_CATEGORIES = [
  { value: 'GENERAL', label: 'General', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300' },
  { value: 'EVENT', label: 'Event', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' },
  { value: 'HOLIDAY', label: 'Holiday', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  { value: 'EXAM', label: 'Exam', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' },
  { value: 'URGENT', label: 'Urgent', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
]

export function getGrade(marks: number, total: number = 100): string {
  const percent = (marks / total) * 100
  for (const g of MARK_GRADES) {
    if (percent >= g.min) return g.grade
  }
  return 'F'
}

export function getGradeColor(grade: string): string {
  const found = MARK_GRADES.find((g) => g.grade === grade)
  if (!found) return 'zinc'
  return found.color
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function timeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(d)
}

export function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export const AVATAR_COLORS = [
  'bg-rose-500', 'bg-emerald-500', 'bg-sky-500', 'bg-amber-500',
  'bg-violet-500', 'bg-teal-500', 'bg-pink-500', 'bg-orange-500',
  'bg-cyan-500', 'bg-lime-500',
]

export function getAvatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
