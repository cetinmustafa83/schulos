'use client'

import { ResourceModule, col } from '@/components/shared/resource-module'

export function RolesModule() {
  return (
    <ResourceModule
      resourceKey="roles"
      title="Roles & Permissions"
      subtitle="Manage user roles and access control"
      addLabel="Add Role"
      columns={[
        col.text('name', 'Role Name'),
        col.text('description', 'Description'),
        col.text('permissions', 'Permissions'),
      ]}
      fields={[
        { name: 'name', label: 'Role Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', fullWidth: true },
        { name: 'permissions', label: 'Permissions (JSON array)', type: 'textarea', fullWidth: true, placeholder: '["dashboard","students"]' },
      ]}
    />
  )
}
