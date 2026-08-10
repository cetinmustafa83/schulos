import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar,
  ClipboardCheck, FileText, DollarSign, Wallet, Building2,
  Library, Package, Bus, BedDouble, Megaphone, BarChart3,
  Settings, ShieldCheck, MessageSquare, FileQuestion,
  ClipboardList, UserCog, Banknote, CalendarClock,
  FileBarChart, IdCard, Bell, Award, Notebook, Shield, Gift, Rocket, type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  key: string
  label: string
  icon: LucideIcon
  badge?: string
  roles?: string[] // if defined, only show for these roles
}

export interface NavGroup {
  title: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Academics',
    items: [
      { key: 'students', label: 'Students', icon: GraduationCap },
      { key: 'student-promotion', label: 'Student Promotion', icon: GraduationCap },
      { key: 'id-card', label: 'ID Cards & Certificates', icon: IdCard },
      { key: 'staff', label: 'Teachers & Staff', icon: Users },
      { key: 'academics', label: 'Academics', icon: BookOpen, roles: ['ADMIN', 'TEACHER'] },
      { key: 'attendance', label: 'Attendance', icon: ClipboardCheck },
      { key: 'attendance-report', label: 'Attendance Report', icon: FileBarChart },
      { key: 'exams', label: 'Examinations', icon: FileText },
      { key: 'report-card', label: 'Report Cards', icon: Award },
      { key: 'online-exams', label: 'Online Exams', icon: FileQuestion },
      { key: 'homework', label: 'Homework', icon: ClipboardList },
      { key: 'lesson-plan', label: 'Lesson Plan', icon: BookOpen },
      { key: 'study-materials', label: 'Study Materials', icon: FileText },
      { key: 'notebook', label: 'Digital Notebook', icon: Notebook },
      { key: 'routine', label: 'Class Routine', icon: CalendarClock },
    ],
  },
  {
    title: 'Finance',
    items: [
      { key: 'fees', label: 'Fees Collection', icon: DollarSign },
      { key: 'fee-dues-report', label: 'Fee Dues Report', icon: FileBarChart },
      { key: 'accounts', label: 'Accounts', icon: Banknote, roles: ['ADMIN', 'ACCOUNTANT'] },
      { key: 'payroll', label: 'Payroll', icon: Wallet, roles: ['ADMIN', 'ACCOUNTANT'] },
    ],
  },
  {
    title: 'Administration',
    items: [
      { key: 'hr', label: 'Human Resources', icon: UserCog, roles: ['ADMIN'] },
      { key: 'leaves', label: 'Leave Management', icon: CalendarClock },
      { key: 'library', label: 'Library', icon: Library },
      { key: 'library-report', label: 'Library Report', icon: FileBarChart },
      { key: 'inventory', label: 'Inventory', icon: Package, roles: ['ADMIN'] },
      { key: 'transport', label: 'Transportation', icon: Bus },
      { key: 'transport-report', label: 'Transport Report', icon: FileBarChart },
      { key: 'dormitory', label: 'Dormitory', icon: BedDouble },
      { key: 'dormitory-report', label: 'Dormitory Report', icon: FileBarChart },
      { key: 'front-office', label: 'Front Office', icon: Building2, roles: ['ADMIN'] },
    ],
  },
  {
    title: 'Communication',
    items: [
      { key: 'communication', label: 'Notices & Events', icon: Megaphone },
      { key: 'notifications', label: 'Notifications', icon: Bell },
      { key: 'calendar', label: 'Calendar', icon: Calendar },
      { key: 'chat', label: 'Messages', icon: MessageSquare },
    ],
  },
  {
    title: 'Reports & System',
    items: [
      { key: 'reports', label: 'Reports', icon: BarChart3 },
      { key: 'roles', label: 'Roles & Permission', icon: ShieldCheck, roles: ['ADMIN'] },
      { key: 'data-protection', label: 'Data Protection (DSGVO)', icon: Shield },
      { key: 'settings', label: 'System Settings', icon: Settings, roles: ['ADMIN'] },
      { key: 'setup', label: 'Setup Wizard', icon: Rocket },
      { key: 'about', label: 'About & Contribute', icon: Gift },
    ],
  },
]

export const MODULE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'School overview and key metrics' },
  students: { title: 'Students', subtitle: 'Manage student admissions, profiles and records' },
  'student-promotion': { title: 'Student Promotion', subtitle: 'Promote students to next class at year end' },
  'id-card': { title: 'ID Cards & Certificates', subtitle: 'Generate and print student ID cards and certificates' },
  staff: { title: 'Teachers & Staff', subtitle: 'Manage staff directory and details' },
  academics: { title: 'Academics', subtitle: 'Classes, sections, subjects and assignments' },
  attendance: { title: 'Attendance', subtitle: 'Track student and staff attendance' },
  'attendance-report': { title: 'Attendance Report', subtitle: 'Monthly class-wise attendance breakdown' },
  exams: { title: 'Examinations', subtitle: 'Manage exams, schedules and marks' },
  'report-card': { title: 'Report Cards', subtitle: 'Generate and print student progress reports' },
  'online-exams': { title: 'Online Examinations', subtitle: 'Question bank and online tests' },
  homework: { title: 'Homework', subtitle: 'Assign and track homework' },
  'lesson-plan': { title: 'Lesson Plan', subtitle: 'Plan and organize lessons' },
  'study-materials': { title: 'Study Materials', subtitle: 'Upload and share learning resources' },
  notebook: { title: 'Digital Notebook', subtitle: 'Create digital notebooks with iPad Pencil support' },
  routine: { title: 'Class Routine', subtitle: 'View and manage class timetables' },
  fees: { title: 'Fees Collection', subtitle: 'Invoices, payments and dues' },
  'fee-dues-report': { title: 'Fee Dues Report', subtitle: 'Outstanding fees and overdue tracking' },
  accounts: { title: 'Accounts', subtitle: 'Income, expense and transactions' },
  payroll: { title: 'Payroll', subtitle: 'Staff salary management' },
  hr: { title: 'Human Resources', subtitle: 'Departments, designations and staff management' },
  leaves: { title: 'Leave Management', subtitle: 'Apply and approve leave requests' },
  library: { title: 'Library', subtitle: 'Books, members and issue management' },
  'library-report': { title: 'Library Report', subtitle: 'Book inventory and issue analytics' },
  inventory: { title: 'Inventory', subtitle: 'Items, suppliers and stock management' },
  transport: { title: 'Transportation', subtitle: 'Vehicles, routes and assignments' },
  'transport-report': { title: 'Transport Report', subtitle: 'Vehicle utilization and route revenue report' },
  dormitory: { title: 'Dormitory', subtitle: 'Hostel rooms and student allotment' },
  'dormitory-report': { title: 'Dormitory Report', subtitle: 'Occupancy and revenue analytics' },
  'front-office': { title: 'Front Office', subtitle: 'Admission queries, visitors and logs' },
  communication: { title: 'Communication', subtitle: 'Notices, events and announcements' },
  notifications: { title: 'Notifications Center', subtitle: 'All your notifications in one place' },
  calendar: { title: 'Calendar', subtitle: 'Events, exams, and holidays calendar view' },
  chat: { title: 'Messages', subtitle: 'Internal messaging system' },
  reports: { title: 'Reports', subtitle: 'Comprehensive analytics and reports' },
  roles: { title: 'Roles & Permission', subtitle: 'Manage user roles and access control' },
  'data-protection': { title: 'Data Protection (DSGVO)', subtitle: 'EU GDPR and German data protection compliance' },
  settings: { title: 'System Settings', subtitle: 'School configuration and preferences' },
  setup: { title: 'Setup Wizard', subtitle: 'Step-by-step school setup guide' },
  about: { title: 'About & Contribute', subtitle: 'Free and open source school management system' },
}
