'use client'

import { ResourceModule, col } from '@/components/shared/resource-module'
import { StatusBadge } from '@/components/shared/status-badge'
import { GENDERS, BLOOD_GROUPS, DEPARTMENTS } from '@/lib/constants'

const DESIGNATIONS = ['Principal', 'Vice Principal', 'Senior Teacher', 'Teacher', 'Assistant Teacher', 'Librarian', 'Accountant', 'Clerk', 'Driver', 'Security']
const DEPT_OPTIONS = ['Mathematics', 'Science', 'Languages', 'Social Studies', 'Computer Science', 'Physical Education', 'Arts', 'Administration']

export function StaffModule() {
  return (
    <ResourceModule
      resourceKey="staff"
      title="Teachers & Staff"
      subtitle="Manage staff directory, designations and details"
      addLabel="Add Staff"
      columns={[
        col.avatar('firstName', 'staffId'),
        col.text('department', 'Department'),
        col.text('designation', 'Designation'),
        col.text('phone', 'Phone'),
        col.text('email', 'Email'),
        col.text('salary', 'Salary', (v) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v || 0)),
        col.badge('status', 'Status'),
      ]}
      fields={[
        { name: 'staffId', label: 'Staff ID', type: 'text', required: true, placeholder: 'TCH-1001' },
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'lastName', label: 'Last Name', type: 'text', required: true },
        { name: 'gender', label: 'Gender', type: 'select', options: GENDERS.map(g => ({ value: g, label: g })) },
        { name: 'dob', label: 'Date of Birth', type: 'date' },
        { name: 'bloodGroup', label: 'Blood Group', type: 'select', options: BLOOD_GROUPS.map(b => ({ value: b, label: b })) },
        { name: 'phone', label: 'Phone', type: 'tel' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'department', label: 'Department', type: 'select', options: DEPT_OPTIONS.map(d => ({ value: d, label: d })) },
        { name: 'designation', label: 'Designation', type: 'select', options: DESIGNATIONS.map(d => ({ value: d, label: d })) },
        { name: 'qualification', label: 'Qualification', type: 'text' },
        { name: 'experience', label: 'Experience', type: 'text' },
        { name: 'salary', label: 'Salary', type: 'number' },
        { name: 'joiningDate', label: 'Joining Date', type: 'date' },
        { name: 'address', label: 'Address', type: 'textarea', fullWidth: true },
        { name: 'city', label: 'City', type: 'text' },
        { name: 'status', label: 'Status', type: 'select', options: [{ value: 'ACTIVE', label: 'Active' }, { value: 'DISABLED', label: 'Disabled' }] },
      ]}
    />
  )
}
