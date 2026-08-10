import { db } from './src/lib/db'

const CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10']
const SECTIONS = ['A', 'B', 'C']
const SUBJECTS = [
  { name: 'Mathematics', code: 'MATH' },
  { name: 'English', code: 'ENG' },
  { name: 'Science', code: 'SCI' },
  { name: 'Social Studies', code: 'SOC' },
  { name: 'Physics', code: 'PHY' },
  { name: 'Chemistry', code: 'CHE' },
  { name: 'Biology', code: 'BIO' },
  { name: 'Computer Science', code: 'CS' },
  { name: 'History', code: 'HIS' },
  { name: 'Geography', code: 'GEO' },
  { name: 'Turkish', code: 'TUR' },
  { name: 'Art', code: 'ART' },
]

const FIRST_NAMES_M = ['Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'İbrahim', 'Hasan', 'Osman', 'Yusuf', 'Murat', 'Emre', 'Burak', 'Cem', 'Deniz', 'Eren', 'Fatih', 'Gökhan', 'Kerem', 'Onur', 'Serkan']
const FIRST_NAMES_F = ['Ayşe', 'Fatma', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Meryem', 'Şeyma', 'Sultan', 'Hanife', 'Dilara', 'Ece', 'Buse', 'Ceren', 'Deniz', 'Esra', 'Gül', 'İrem', 'Merve', 'Selin']
const LAST_NAMES = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Kara', 'Koç', 'Kurt', 'Özkan', 'Şimşek']

const DEPARTMENTS = ['Mathematics', 'Science', 'Languages', 'Social Studies', 'Computer Science', 'Physical Education', 'Arts', 'Administration']
const DESIGNATIONS = ['Principal', 'Vice Principal', 'Senior Teacher', 'Teacher', 'Assistant Teacher', 'Librarian', 'Accountant', 'Clerk', 'Driver', 'Security']

function randomItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randomItems<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}
function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randomFloat(min: number, max: number) { return Math.round((Math.random() * (max - min) + min) * 100) / 100 }

async function seed() {
  console.log('🌱 Seeding database...')

  // Settings
  const settings = [
    { id: 'school_name', value: 'Atatürk Anatolian High School' },
    { id: 'school_address', value: 'Cumhuriyet Cad. No:42, Kadıköy, İstanbul' },
    { id: 'school_phone', value: '+90 216 555 0042' },
    { id: 'school_email', value: 'info@ataturk-anadolu.edu.tr' },
    { id: 'school_logo', value: '' },
    { id: 'academic_year', value: '2024-2025' },
    { id: 'currency', value: '₺' },
    { id: 'language', value: 'en' },
  ]
  for (const s of settings) {
    await db.setting.upsert({ where: { id: s.id }, update: { value: s.value }, create: s })
  }

  // Departments & Designations
  for (const d of DEPARTMENTS) {
    await db.department.create({ data: { name: d } })
  }
  for (const d of DESIGNATIONS) {
    await db.designation.create({ data: { name: d } })
  }

  // Users
  const adminUser = await db.user.create({
    data: { email: 'admin@school.edu.tr', name: 'System Administrator', role: 'ADMIN', phone: '+90 555 000 0001' },
  })

  // Classrooms
  const classRooms = []
  for (const c of CLASSES) {
    const room = await db.classRoom.create({
      data: { name: c, numericName: c.replace('Class ', ''), capacity: 40, roomNo: `R-${randomInt(100, 350)}` },
    })
    classRooms.push(room)
  }

  // Sections
  for (const cls of classRooms) {
    for (const sec of SECTIONS) {
      await db.section.create({ data: { name: sec, classId: cls.id, capacity: 35 } })
    }
  }

  // Subjects
  const subjects = []
  for (const s of SUBJECTS) {
    const sub = await db.subject.create({
      data: { name: s.name, code: s.code, type: randomItem(['CORE', 'OPTIONAL']) },
    })
    subjects.push(sub)
  }

  // Staff / Teachers
  const teachers = []
  const teacherRoles = ['TEACHER', 'ACCOUNTANT', 'LIBRARIAN']
  for (let i = 0; i < 28; i++) {
    const gender = Math.random() > 0.4 ? 'Male' : 'Female'
    const first = gender === 'Male' ? randomItem(FIRST_NAMES_M) : randomItem(FIRST_NAMES_F)
    const last = randomItem(LAST_NAMES)
    const dept = randomItem(DEPARTMENTS)
    const desig = i === 0 ? 'Principal' : i < 3 ? 'Vice Principal' : randomItem(['Senior Teacher', 'Teacher', 'Assistant Teacher'])
    const staff = await db.staff.create({
      data: {
        staffId: `TCH-${String(1001 + i)}`,
        firstName: first,
        lastName: last,
        gender,
        phone: `+90 555 ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}.${i}@school.edu.tr`,
        department: dept,
        designation: desig,
        category: 'Teaching',
        qualification: randomItem(['B.Ed', 'M.Sc', 'M.A', 'Ph.D', 'B.Sc']),
        experience: `${randomInt(1, 25)} years`,
        salary: randomFloat(25000, 75000),
        bloodGroup: randomItem(['A+', 'B+', 'O+', 'AB+', 'A-', 'O-']),
        joiningDate: new Date(2018 + randomInt(0, 6), randomInt(0, 11), randomInt(1, 28)),
        address: `${randomInt(1, 200)} ${randomItem(['Atatürk', 'İnönü', 'Cumhuriyet', 'Gül', 'Lale'])} St, İstanbul`,
        city: 'İstanbul',
      },
    })
    teachers.push(staff)
    // Create user for teacher
    await db.user.create({
      data: {
        email: staff.email || `${first.toLowerCase()}.${last.toLowerCase()}.${i}@school.edu.tr`,
        name: `${first} ${last}`,
        role: randomItem(teacherRoles),
        phone: staff.phone,
      },
    })
  }

  // Assign class teachers
  for (let i = 0; i < classRooms.length; i++) {
    await db.classRoom.update({ where: { id: classRooms[i].id }, data: { classTeacherId: teachers[i % teachers.length].id } })
  }
  // Assign subjects to teachers
  for (const sub of subjects) {
    const t = randomItem(teachers)
    await db.subject.update({ where: { id: sub.id }, data: { teacherId: t.id } })
  }

  // Students
  const students = []
  const firstNamesAll = [...FIRST_NAMES_M, ...FIRST_NAMES_F]
  for (let i = 0; i < 220; i++) {
    const gender = Math.random() > 0.5 ? 'Male' : 'Female'
    const first = gender === 'Male' ? randomItem(FIRST_NAMES_M) : randomItem(FIRST_NAMES_F)
    const last = randomItem(LAST_NAMES)
    const cls = randomItem(classRooms)
    const sec = randomItem(SECTIONS)
    const father = `${randomItem(FIRST_NAMES_M)} ${last}`
    const mother = `${randomItem(FIRST_NAMES_F)} ${last}`
    const studEmail = `${first.toLowerCase()}.${last.toLowerCase()}${i}@student.edu.tr`
    const guardianEmail = `guardian.${last.toLowerCase()}.${i}@gmail.com`
    const stud = await db.student.create({
      data: {
        admissionNo: `STU-${String(20240001 + i)}`,
        firstName: first,
        lastName: last,
        gender,
        dob: new Date(2006 + randomInt(0, 8), randomInt(0, 11), randomInt(1, 28)),
        bloodGroup: randomItem(['A+', 'B+', 'O+', 'AB+', 'A-', 'O-']),
        phone: `+90 555 ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        email: studEmail,
        address: `${randomInt(1, 200)} ${randomItem(['Atatürk', 'İnönü', 'Cumhuriyet'])} St, İstanbul`,
        city: 'İstanbul',
        state: 'İstanbul',
        country: 'Turkey',
        category: randomItem(['General', 'OBC', 'SC', 'ST']),
        className: `${cls.name} - ${sec}`,
        classId: cls.id,
        section: sec,
        rollNo: String(randomInt(1, 40)),
        fatherName: father,
        motherName: mother,
        guardianName: father,
        guardianPhone: `+90 532 ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        guardianEmail,
        guardianOccupation: randomItem(['Engineer', 'Doctor', 'Teacher', 'Business', 'Government', 'Retired']),
        house: randomItem(['Red', 'Blue', 'Green', 'Yellow']),
        height: `${randomInt(140, 185)} cm`,
        weight: `${randomInt(35, 80)} kg`,
        status: Math.random() > 0.95 ? 'DISABLED' : 'ACTIVE',
        admissionDate: new Date(2022 + randomInt(0, 3), randomInt(0, 11), randomInt(1, 28)),
      },
    })
    students.push(stud)
    // Parent user
    await db.user.create({
      data: {
        email: guardianEmail,
        name: father,
        role: 'PARENT',
        phone: stud.guardianPhone,
      },
    })
  }

  // Attendance for last 30 days for first 50 students
  const today = new Date()
  for (let d = 0; d < 30; d++) {
    const date = new Date(today)
    date.setDate(today.getDate() - d)
    if (date.getDay() === 0 || date.getDay() === 6) continue
    const sampleStudents = randomItems(students, 60)
    for (const st of sampleStudents) {
      const r = Math.random()
      const status = r > 0.85 ? 'ABSENT' : r > 0.78 ? 'LATE' : 'PRESENT'
      await db.attendance.create({
        data: {
          studentId: st.id,
          date,
          status,
          classId: st.classId,
        },
      })
    }
  }

  // Staff attendance for last 30 days
  for (let d = 0; d < 30; d++) {
    const date = new Date(today)
    date.setDate(today.getDate() - d)
    if (date.getDay() === 0 || date.getDay() === 6) continue
    for (const t of teachers) {
      const r = Math.random()
      const status = r > 0.95 ? 'ABSENT' : r > 0.9 ? 'LEAVE' : 'PRESENT'
      await db.staffAttendance.create({
        data: {
          staffId: t.id,
          date,
          status,
          inTime: status === 'PRESENT' ? '08:45' : undefined,
          outTime: status === 'PRESENT' ? '16:30' : undefined,
        },
      })
    }
  }

  // Class routines
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const timeSlots = [
    { start: '09:00', end: '09:45' },
    { start: '09:50', end: '10:35' },
    { start: '10:50', end: '11:35' },
    { start: '11:40', end: '12:25' },
    { start: '13:15', end: '14:00' },
    { start: '14:05', end: '14:50' },
    { start: '14:55', end: '15:40' },
  ]
  for (const cls of classRooms.slice(0, 5)) {
    for (const day of days) {
      for (let s = 0; s < timeSlots.length; s++) {
        const sub = randomItem(subjects)
        await db.classRoutine.create({
          data: {
            classId: cls.id,
            day,
            startTime: timeSlots[s].start,
            endTime: timeSlots[s].end,
            subjectId: sub.id,
            teacherId: randomItem(teachers).id,
            roomNo: cls.roomNo,
          },
        })
      }
    }
  }

  // Exams
  const examTypes = ['FIRST_TERM', 'SECOND_TERM', 'FINAL', 'MID_TERM', 'QUIZ']
  for (let i = 0; i < 5; i++) {
    await db.exam.create({
      data: {
        name: `${examTypes[i]} Exam 2024-2025`,
        type: examTypes[i],
        startDate: new Date(2024, 8 + i, 15),
        endDate: new Date(2024, 8 + i, 25),
        description: `${examTypes[i].replace('_', ' ')} examination for all classes`,
      },
    })
  }
  const exams = await db.exam.findMany()

  // Marks for first exam (first 80 students)
  const firstExam = exams[0]
  for (const st of students.slice(0, 80)) {
    for (const sub of randomItems(subjects, 5)) {
      await db.mark.create({
        data: {
          examId: firstExam.id,
          studentId: st.id,
          subjectId: sub.id,
          classId: st.classId || '',
          marksObtained: randomFloat(40, 98),
          totalMarks: 100,
          grade: randomItem(['A+', 'A', 'B+', 'B', 'C']),
        },
      })
    }
  }

  // Fee groups and types
  const feeGroups = ['Tuition Fees', 'Transport Fees', 'Hostel Fees', 'Examination Fees', 'Library Fees']
  const feeGroupIds = []
  for (const g of feeGroups) {
    const fg = await db.feeGroup.create({ data: { name: g, description: `${g} for academic year` } })
    feeGroupIds.push(fg)
  }
  const feeTypes = [
    { name: 'Tuition Fee', code: 'TF', amount: 15000, frequency: 'QUARTERLY' },
    { name: 'Bus Fee', code: 'BF', amount: 3500, frequency: 'MONTHLY' },
    { name: 'Hostel Fee', code: 'HF', amount: 25000, frequency: 'QUARTERLY' },
    { name: 'Exam Fee', code: 'EF', amount: 2000, frequency: 'ONETIME' },
    { name: 'Library Fee', code: 'LF', amount: 500, frequency: 'YEARLY' },
    { name: 'Lab Fee', code: 'LABF', amount: 1500, frequency: 'YEARLY' },
    { name: 'Sports Fee', code: 'SF', amount: 800, frequency: 'YEARLY' },
    { name: 'Admission Fee', code: 'AF', amount: 5000, frequency: 'ONETIME' },
  ]
  for (const ft of feeTypes) {
    await db.feeType.create({
      data: { ...ft, groupId: randomItem(feeGroupIds).id },
    })
  }

  // Invoices
  const invoiceStatuses = ['PAID', 'UNPAID', 'PARTIAL', 'OVERDUE']
  let invCounter = 0
  for (const st of students) {
    // Create 2-3 invoices per student
    for (let i = 0; i < randomInt(2, 3); i++) {
      invCounter++
      const ft = randomItem(feeTypes)
      const status = randomItem(invoiceStatuses)
      const amount = ft.amount
      const paidAmount = status === 'PAID' ? amount : status === 'PARTIAL' ? amount * 0.5 : 0
      const dueDate = new Date(today)
      dueDate.setDate(today.getDate() + randomInt(-30, 60))
      await db.invoice.create({
        data: {
          invoiceNo: `INV-${String(20240001 + invCounter)}`,
          studentId: st.id,
          classId: st.classId,
          feeType: ft.name,
          amount,
          paidAmount,
          discount: Math.random() > 0.8 ? amount * 0.1 : 0,
          status,
          dueDate,
          paymentMethod: status === 'PAID' ? randomItem(['CASH', 'BANK', 'ONLINE']) : null,
        },
      })
    }
  }

  // Accounts
  const accounts = [
    { name: 'Main Bank Account', type: 'BANK', balance: 450000, bankName: 'İş Bankası', accountNo: 'TR1234567890' },
    { name: 'Cash Account', type: 'CASH', balance: 25000 },
    { name: 'Salary Account', type: 'BANK', balance: 180000, bankName: 'Ziraat Bank', accountNo: 'TR9876543210' },
  ]
  for (const a of accounts) {
    await db.account.create({ data: a })
  }

  // Transactions
  for (let i = 0; i < 40; i++) {
    const isIncome = Math.random() > 0.5
    await db.transaction.create({
      data: {
        type: isIncome ? 'INCOME' : 'EXPENSE',
        category: isIncome ? randomItem(['Fees Collection', 'Donation', 'Grant', 'Other Income']) : randomItem(['Salary', 'Utility Bill', 'Maintenance', 'Office Supplies', 'Transport Fuel']),
        amount: randomFloat(500, 50000),
        method: randomItem(['CASH', 'BANK', 'ONLINE']),
        date: new Date(today.getTime() - randomInt(0, 60) * 86400000),
        description: `Transaction #${i + 1}`,
      },
    })
  }

  // Payroll for current month
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  for (const t of teachers) {
    const basic = t.salary || 30000
    const allowance = basic * 0.2
    const deduction = basic * 0.1
    const bonus = Math.random() > 0.7 ? 2000 : 0
    await db.payroll.create({
      data: {
        staffId: t.id,
        month: currentMonth,
        basicSalary: basic,
        allowance,
        deduction,
        bonus,
        netSalary: basic + allowance + bonus - deduction,
        status: Math.random() > 0.5 ? 'PAID' : 'PENDING',
        paidDate: Math.random() > 0.5 ? new Date(today.getTime() - randomInt(0, 15) * 86400000) : null,
      },
    })
  }

  // Books
  const bookTitles = ['Physics for All', 'Modern Mathematics', 'World History', 'English Grammar', 'Biology Today', 'Chemistry Basics', 'Computer Programming', 'Geography Atlas', 'Turkish Literature', 'Art and Culture', 'Calculus Made Easy', 'Organic Chemistry', 'Data Structures', 'World Wars', 'Environmental Science', 'Algebra and Geometry', 'Shakespeare Collection', 'Modern Physics', 'Astrology', 'Microeconomics']
  const authors = ['John Smith', 'Mary Johnson', 'David Brown', 'Sarah Williams', 'James Davis', 'Linda Miller', 'Robert Wilson', 'Jennifer Moore', 'Michael Taylor', 'Patricia Anderson']
  for (let i = 0; i < 80; i++) {
    const title = randomItem(bookTitles)
    await db.book.create({
      data: {
        bookNo: `BK-${String(10001 + i)}`,
        title: `${title} - Vol ${randomInt(1, 5)}`,
        author: randomItem(authors),
        category: randomItem(['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Reference', 'Children']),
        publisher: randomItem(['Pearson', 'Oxford', 'McGraw Hill', 'Penguin', 'Cambridge']),
        edition: `${randomInt(1, 8)}th Edition`,
        isbn: `978-${randomInt(1000000000, 9999999999)}`,
        price: randomFloat(50, 500),
        totalCopies: randomInt(2, 8),
        availableCopies: randomInt(0, 5),
        rackNo: `Rack-${String.fromCharCode(65 + randomInt(0, 9))}-${randomInt(1, 20)}`,
      },
    })
  }
  const books = await db.book.findMany()
  // Book issues
  for (let i = 0; i < 30; i++) {
    const student = randomItem(students)
    const book = randomItem(books)
    const issueDate = new Date(today.getTime() - randomInt(0, 30) * 86400000)
    const dueDate = new Date(issueDate.getTime() + 14 * 86400000)
    const returned = Math.random() > 0.5
    await db.bookIssue.create({
      data: {
        bookId: book.id,
        memberId: student.id,
        memberType: 'STUDENT',
        issueDate,
        dueDate,
        returnDate: returned ? new Date(dueDate.getTime() - randomInt(0, 3) * 86400000) : null,
        status: returned ? 'RETURNED' : dueDate < today ? 'OVERDUE' : 'ISSUED',
        fine: dueDate < today && !returned ? randomFloat(5, 30) : 0,
      },
    })
  }

  // Notices
  const noticeData = [
    { title: 'Annual Sports Day', content: 'Annual Sports Day will be held on 15th of next month. All students are requested to participate.', category: 'EVENT', audience: 'ALL' },
    { title: 'Half-Yearly Exam Schedule', content: 'Half-yearly examination schedule has been published. Please check the examination module.', category: 'EXAM', audience: 'STUDENTS' },
    { title: 'Holiday - Republic Day', content: 'School will remain closed on October 29th for Republic Day celebration.', category: 'HOLIDAY', audience: 'ALL' },
    { title: 'Parent-Teacher Meeting', content: 'PTM scheduled for this Saturday from 9 AM to 1 PM. Parents are requested to attend.', category: 'GENERAL', audience: 'PARENTS' },
    { title: 'Library Books Return Reminder', content: 'All students with overdue books are requested to return them by end of this week.', category: 'URGENT', audience: 'STUDENTS' },
    { title: 'Staff Meeting', content: 'Monthly staff meeting on Friday at 3 PM in the conference hall.', category: 'GENERAL', audience: 'STAFF' },
    { title: 'New Admission Open', content: 'Admissions open for academic year 2025-2026. Apply before January 31st.', category: 'GENERAL', audience: 'ALL' },
    { title: 'Diwali Vacation', content: 'School will remain closed from Nov 10 to Nov 15 for Diwali.', category: 'HOLIDAY', audience: 'ALL' },
  ]
  for (const n of noticeData) {
    await db.notice.create({
      data: {
        ...n,
        publishDate: new Date(today.getTime() - randomInt(0, 15) * 86400000),
        expiryDate: new Date(today.getTime() + randomInt(5, 60) * 86400000),
      },
    })
  }

  // Events
  const events = [
    { title: 'Annual Day Function', startDate: new Date(today.getFullYear(), today.getMonth() + 1, 20), endDate: new Date(today.getFullYear(), today.getMonth() + 1, 20), location: 'School Auditorium', type: 'EVENT' },
    { title: 'Science Exhibition', startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10), location: 'Science Block', type: 'EVENT' },
    { title: 'Inter-School Quiz Competition', startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5), location: 'Conference Hall', type: 'EVENT' },
    { title: 'Republic Day Holiday', startDate: new Date(today.getFullYear(), 9, 29), type: 'HOLIDAY' },
    { title: 'Mid-term Break', startDate: new Date(today.getFullYear(), today.getMonth() + 1, 1), endDate: new Date(today.getFullYear(), today.getMonth() + 1, 3), type: 'HOLIDAY' },
  ]
  for (const e of events) {
    await db.event.create({ data: e })
  }

  // Homework
  for (let i = 0; i < 25; i++) {
    const cls = randomItem(classRooms)
    const sub = randomItem(subjects)
    await db.homework.create({
      data: {
        title: `${sub.name} - Chapter ${randomInt(1, 10)} Exercises`,
        description: `Complete exercises from chapter ${randomInt(1, 10)}. Submit by due date.`,
        classId: cls.id,
        subjectId: sub.id,
        teacherId: randomItem(teachers).id,
        dueDate: new Date(today.getTime() + randomInt(1, 14) * 86400000),
        status: randomItem(['ASSIGNED', 'SUBMITTED', 'EVALUATED']),
      },
    })
  }

  // Lesson plans
  for (let i = 0; i < 15; i++) {
    const cls = randomItem(classRooms)
    const sub = randomItem(subjects)
    await db.lessonPlan.create({
      data: {
        title: `${sub.name} - Lesson ${i + 1}`,
        classId: cls.id,
        subjectId: sub.id,
        topic: `${sub.name} Chapter ${randomInt(1, 8)}`,
        overview: 'Comprehensive lesson plan covering fundamental concepts with practical examples.',
        objectives: 'Students will understand core concepts and apply them to solve problems.',
        activities: 'Group discussion, problem solving, presentation',
        resources: 'Textbook, worksheets, multimedia content',
        duration: `${randomInt(2, 5)} periods`,
        status: randomItem(['DRAFT', 'PUBLISHED']),
      },
    })
  }

  // Study materials
  const materialTypes = [
    { type: 'PDF', fileName: 'lecture_notes.pdf', fileType: 'application/pdf' },
    { type: 'VIDEO', fileName: 'tutorial_video.mp4', fileType: 'video/mp4' },
    { type: 'IMAGE', fileName: 'diagram.png', fileType: 'image/png' },
    { type: 'DOC', fileName: 'worksheet.docx', fileType: 'application/docx' },
  ]
  for (let i = 0; i < 20; i++) {
    const m = randomItem(materialTypes)
    await db.studyMaterial.create({
      data: {
        title: `${randomItem(subjects).name} - ${m.type} Material ${i + 1}`,
        type: m.type,
        classId: randomItem(classRooms).id,
        subjectId: randomItem(subjects).id,
        teacherId: randomItem(teachers).id,
        fileName: m.fileName,
        fileType: m.fileType,
        fileSize: `${randomFloat(0.5, 25)} MB`,
        description: 'Study material for student reference',
      },
    })
  }

  // Vehicles & Routes
  const vehicles = [
    { vehicleNo: '34 ABC 001', type: 'BUS', capacity: 45, driverName: 'Mustafa Arslan', driverPhone: '+90 555 111 2233' },
    { vehicleNo: '34 DEF 002', type: 'BUS', capacity: 40, driverName: 'Hasan Yıldız', driverPhone: '+90 555 222 3344' },
    { vehicleNo: '34 GHI 003', type: 'BUS', capacity: 50, driverName: 'Ali Demir', driverPhone: '+90 555 333 4455' },
    { vehicleNo: '34 JKL 004', type: 'VAN', capacity: 18, driverName: 'Osman Kaya', driverPhone: '+90 555 444 5566' },
    { vehicleNo: '34 MNO 005', type: 'BUS', capacity: 45, driverName: 'Yusuf Şahin', driverPhone: '+90 555 555 6677' },
  ]
  const vehicleIds = []
  for (const v of vehicles) {
    const veh = await db.vehicle.create({ data: v })
    vehicleIds.push(veh)
  }
  const routeData = [
    { name: 'Route A - North', startPoint: 'Kadıköy', endPoint: 'School', distance: 12, fare: 800 },
    { name: 'Route B - South', startPoint: 'Bostancı', endPoint: 'School', distance: 8, fare: 600 },
    { name: 'Route C - East', startPoint: 'Üsküdar', endPoint: 'School', distance: 15, fare: 900 },
    { name: 'Route D - West', startPoint: 'Bakırköy', endPoint: 'School', distance: 18, fare: 1000 },
    { name: 'Route E - Central', startPoint: 'Şişli', endPoint: 'School', distance: 10, fare: 700 },
  ]
  const routeIds = []
  for (const r of routeData) {
    const route = await db.route.create({ data: { ...r, vehicleId: randomItem(vehicleIds).id } })
    routeIds.push(route)
  }
  // Transport assignments for some students
  for (const st of randomItems(students, 80)) {
    const route = randomItem(routeIds)
    await db.transportAssignment.create({
      data: {
        studentId: st.id,
        routeId: route.id,
        vehicleId: route.vehicleId,
        pickupPoint: `${route.startPoint} Stop ${randomInt(1, 5)}`,
      },
    })
  }

  // Dormitory
  const dorms = [
    { name: 'Boys Hostel - Block A', type: 'BOYS', wardenName: 'Murat Yılmaz', wardenPhone: '+90 555 666 7788', capacity: 60 },
    { name: 'Girls Hostel - Block B', type: 'GIRLS', wardenName: 'Ayşe Kara', wardenPhone: '+90 555 777 8899', capacity: 60 },
  ]
  for (const d of dorms) {
    const dorm = await db.dormitory.create({ data: d })
    for (let r = 1; r <= 30; r++) {
      await db.dormitoryRoom.create({
        data: {
          dormitoryId: dorm.id,
          roomNo: `${dorm.name.charAt(0)}-${String(r).padStart(3, '0')}`,
          roomType: randomItem(['SINGLE', 'SHARED']),
          capacity: randomItem([1, 2, 3]),
          occupied: randomInt(0, 2),
          fee: randomFloat(5000, 8000),
        },
      })
    }
  }
  // Assign some students to dorm rooms
  const dormRooms = await db.dormitoryRoom.findMany()
  for (const st of randomItems(students, 40)) {
    const room = randomItem(dormRooms)
    await db.student.update({ where: { id: st.id }, data: { dormitoryRoomId: room.id } })
  }

  // Leaves
  for (let i = 0; i < 12; i++) {
    const isStaff = Math.random() > 0.5
    await db.leave.create({
      data: {
        applicantId: isStaff ? randomItem(teachers).id : randomItem(students).id,
        applicantType: isStaff ? 'STAFF' : 'STUDENT',
        leaveType: randomItem(['CASUAL', 'SICK', 'EARNED', 'OTHER']),
        startDate: new Date(today.getTime() - randomInt(0, 30) * 86400000),
        endDate: new Date(today.getTime() + randomInt(0, 5) * 86400000),
        reason: randomItem(['Personal work', 'Medical reasons', 'Family function', 'Fever', 'Out of station']),
        status: randomItem(['PENDING', 'APPROVED', 'REJECTED']),
      },
    })
  }

  // Inventory
  const items = [
    { name: 'Chalk Box', category: 'Stationery', unit: 'BOX', quantity: 250, minStock: 50, price: 25 },
    { name: 'Whiteboard Marker', category: 'Stationery', unit: 'PCS', quantity: 180, minStock: 30, price: 15 },
    { name: 'A4 Paper Ream', category: 'Stationery', unit: 'REAM', quantity: 85, minStock: 20, price: 120 },
    { name: 'Desk', category: 'Furniture', unit: 'PCS', quantity: 320, minStock: 20, price: 850 },
    { name: 'Chair', category: 'Furniture', unit: 'PCS', quantity: 640, minStock: 50, price: 250 },
    { name: 'Projector', category: 'Electronics', unit: 'PCS', quantity: 12, minStock: 2, price: 8500 },
    { name: 'Computer', category: 'Electronics', unit: 'PCS', quantity: 45, minStock: 5, price: 15000 },
    { name: 'Printer Ink', category: 'Consumables', unit: 'PCS', quantity: 28, minStock: 10, price: 350 },
    { name: 'First Aid Kit', category: 'Medical', unit: 'PCS', quantity: 8, minStock: 3, price: 500 },
    { name: 'Cricket Bat', category: 'Sports', unit: 'PCS', quantity: 15, minStock: 5, price: 800 },
    { name: 'Football', category: 'Sports', unit: 'PCS', quantity: 12, minStock: 4, price: 450 },
    { name: 'Lab Equipment Set', category: 'Science', unit: 'SET', quantity: 8, minStock: 2, price: 3500 },
  ]
  for (const it of items) {
    await db.inventoryItem.create({
      data: { ...it, store: randomItem(['Main Store', 'Lab Store', 'Office Store']), supplier: randomItem(['ABC Suppliers', 'XYZ Traders', 'Global Supplies']) },
    })
  }

  // Admission queries
  const queryStatuses = ['NEW', 'FOLLOW_UP', 'CONVERTED', 'LOST']
  for (let i = 0; i < 15; i++) {
    await db.admissionQuery.create({
      data: {
        name: `${randomItem(firstNamesAll)} ${randomItem(LAST_NAMES)}`,
        phone: `+90 555 ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        email: `query${i}@gmail.com`,
        classApplied: randomItem(CLASSES),
        source: randomItem(['Website', 'Walk-in', 'Referral', 'Newspaper Ad']),
        status: randomItem(queryStatuses),
        followUpDate: new Date(today.getTime() + randomInt(-5, 15) * 86400000),
        notes: randomItem(['Interested in science stream', 'Wants hostel facility', 'Asking about fee structure', 'Needs scholarship info']),
      },
    })
  }

  // Visitors
  for (let i = 0; i < 10; i++) {
    await db.visitor.create({
      data: {
        name: `${randomItem(firstNamesAll)} ${randomItem(LAST_NAMES)}`,
        phone: `+90 555 ${randomInt(100, 999)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
        purpose: randomItem(['Parent meeting', 'Admission enquiry', 'Document submission', 'Official visit']),
        whomToMeet: randomItem(teachers).email,
        inTime: '10:00',
        outTime: '11:00',
      },
    })
  }

  // Question bank
  const questions = [
    { question: 'What is the capital of Turkey?', options: JSON.stringify(['İstanbul', 'Ankara', 'İzmir', 'Bursa']), answer: 'Ankara', type: 'MCQ', subjectId: subjects[1].id, difficulty: 'EASY' },
    { question: 'Water is composed of which two elements?', options: JSON.stringify(['Oxygen and Carbon', 'Hydrogen and Oxygen', 'Nitrogen and Hydrogen', 'Carbon and Hydrogen']), answer: 'Hydrogen and Oxygen', type: 'MCQ', subjectId: subjects[5].id, difficulty: 'EASY' },
    { question: 'The Earth revolves around the Sun.', options: JSON.stringify(['True', 'False']), answer: 'True', type: 'TRUE_FALSE', subjectId: subjects[1].id, difficulty: 'EASY' },
    { question: '2 + 2 = ?', options: JSON.stringify(['3', '4', '5', '6']), answer: '4', type: 'MCQ', subjectId: subjects[0].id, difficulty: 'EASY' },
    { question: 'Photosynthesis produces ___ and oxygen.', options: JSON.stringify([]), answer: 'glucose', type: 'FILL_BLANK', subjectId: subjects[6].id, difficulty: 'MEDIUM' },
    { question: 'The Great Wall is located in which country?', options: JSON.stringify(['India', 'China', 'Japan', 'Korea']), answer: 'China', type: 'MCQ', subjectId: subjects[3].id, difficulty: 'EASY' },
    { question: 'CPU stands for Central Processing Unit.', options: JSON.stringify(['True', 'False']), answer: 'True', type: 'TRUE_FALSE', subjectId: subjects[7].id, difficulty: 'EASY' },
    { question: 'The chemical symbol for Gold is ___.', options: JSON.stringify([]), answer: 'Au', type: 'FILL_BLANK', subjectId: subjects[5].id, difficulty: 'MEDIUM' },
  ]
  for (const q of questions) {
    await db.questionBank.create({ data: q })
  }

  // Online exams
  for (let i = 0; i < 3; i++) {
    await db.onlineExam.create({
      data: {
        title: `Online Test ${i + 1} - ${randomItem(subjects).name}`,
        classId: randomItem(classRooms).id,
        subjectId: randomItem(subjects).id,
        totalQuestions: 20,
        marksPerQuestion: 1,
        duration: 30,
        startDate: new Date(today.getTime() + i * 86400000),
        endDate: new Date(today.getTime() + (i + 2) * 86400000),
        status: i === 0 ? 'PUBLISHED' : 'DRAFT',
      },
    })
  }

  // Front office logs
  const logs = [
    { type: 'PHONE_CALL', title: 'Parent inquiry about admission', person: 'Mr. Yılmaz', status: 'RESOLVED' },
    { type: 'PHONE_CALL', title: 'Follow-up call to parent', person: 'Mrs. Kaya', status: 'PENDING' },
    { type: 'POSTAL_RECEIVE', title: 'Official letter from education board', person: 'Ministry', status: 'RESOLVED' },
    { type: 'POSTAL_DISPATCH', title: 'Sent results to district office', person: 'District Office', status: 'RESOLVED' },
    { type: 'COMPLAIN', title: 'Water cooler not working in Block B', person: 'Student', status: 'PENDING' },
    { type: 'COMPLAIN', title: 'Lights not working in classroom 105', person: 'Teacher', status: 'RESOLVED' },
  ]
  for (const l of logs) {
    await db.frontLog.create({ data: { ...l, description: l.title, date: new Date(today.getTime() - randomInt(0, 10) * 86400000) } })
  }

  // Roles
  const roles = [
    { name: 'Super Admin', description: 'Full access to all modules', permissions: JSON.stringify(['*']) },
    { name: 'Principal', description: 'Access to all academic and admin modules', permissions: JSON.stringify(['dashboard', 'students', 'staff', 'academics', 'attendance', 'exams', 'reports', 'communication']) },
    { name: 'Teacher', description: 'Access to teaching-related modules', permissions: JSON.stringify(['dashboard', 'students', 'attendance', 'exams', 'homework', 'lesson_plan', 'study_material']) },
    { name: 'Accountant', description: 'Access to fees and accounts modules', permissions: JSON.stringify(['dashboard', 'fees', 'accounts', 'reports']) },
    { name: 'Librarian', description: 'Access to library module', permissions: JSON.stringify(['dashboard', 'library']) },
    { name: 'Parent', description: 'View children info', permissions: JSON.stringify(['dashboard', 'children', 'attendance', 'fees', 'homework']) },
    { name: 'Student', description: 'View own info', permissions: JSON.stringify(['dashboard', 'attendance', 'exams', 'homework', 'study_material', 'library']) },
  ]
  for (const r of roles) {
    await db.role.create({ data: r })
  }

  console.log('✅ Seeding complete!')
  console.log(`  - ${students.length} students`)
  console.log(`  - ${teachers.length} staff`)
  console.log(`  - ${classRooms.length} classes`)
  console.log(`  - ${subjects.length} subjects`)
  console.log(`  - ${books.length} books`)
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
