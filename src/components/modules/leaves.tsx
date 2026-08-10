'use client'

import { ResourceModule, col } from '@/components/shared/resource-module'

export function LeavesModule() {
  return (
    <ResourceModule
      resourceKey="leaves"
      title="Leave Management"
      subtitle="Apply for and approve leave requests"
      addLabel="Apply Leave"
      columns={[
        col.text('applicantId', 'Applicant'),
        col.text('applicantType', 'Type'),
        col.text('leaveType', 'Leave Type'),
        col.date('startDate', 'From'),
        col.date('endDate', 'To'),
        col.text('reason', 'Reason'),
        col.badge('status', 'Status'),
      ]}
      fields={[
        { name: 'applicantId', label: 'Applicant ID', type: 'text', required: true },
        { name: 'applicantType', label: 'Applicant Type', type: 'select', options: [
          { value: 'STAFF', label: 'Staff' },
          { value: 'STUDENT', label: 'Student' },
        ], default: 'STAFF' },
        { name: 'leaveType', label: 'Leave Type', type: 'select', options: [
          { value: 'CASUAL', label: 'Casual' },
          { value: 'SICK', label: 'Sick' },
          { value: 'EARNED', label: 'Earned' },
          { value: 'OTHER', label: 'Other' },
        ], default: 'CASUAL' },
        { name: 'startDate', label: 'Start Date', type: 'date', required: true },
        { name: 'endDate', label: 'End Date', type: 'date', required: true },
        { name: 'reason', label: 'Reason', type: 'textarea', required: true, fullWidth: true },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'PENDING', label: 'Pending' },
          { value: 'APPROVED', label: 'Approved' },
          { value: 'REJECTED', label: 'Rejected' },
        ], default: 'PENDING' },
      ]}
    />
  )
}
