'use client'

import { ResourceModule, col } from '@/components/shared/resource-module'

export function PayrollModule() {
  return (
    <ResourceModule
      resourceKey="payroll"
      title="Payroll"
      subtitle="Staff salary management and disbursement"
      addLabel="Add Payroll"
      columns={[
        col.text('staffId', 'Staff ID'),
        col.text('month', 'Month'),
        col.currency('basicSalary', 'Basic'),
        col.currency('allowance', 'Allowance'),
        col.currency('deduction', 'Deduction'),
        col.currency('netSalary', 'Net Salary'),
        col.badge('status', 'Status'),
      ]}
      fields={[
        { name: 'staffId', label: 'Staff ID', type: 'text', required: true },
        { name: 'month', label: 'Month (YYYY-MM)', type: 'text', required: true, placeholder: '2025-01' },
        { name: 'basicSalary', label: 'Basic Salary', type: 'number', required: true },
        { name: 'allowance', label: 'Allowance', type: 'number' },
        { name: 'deduction', label: 'Deduction', type: 'number' },
        { name: 'bonus', label: 'Bonus', type: 'number' },
        { name: 'netSalary', label: 'Net Salary', type: 'number', required: true },
        { name: 'status', label: 'Status', type: 'select', options: [
          { value: 'PENDING', label: 'Pending' },
          { value: 'PAID', label: 'Paid' },
        ], default: 'PENDING' },
      ]}
    />
  )
}
