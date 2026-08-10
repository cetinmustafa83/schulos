'use client'

import { ResourceModule, col } from '@/components/shared/resource-module'

export function InventoryModule() {
  return (
    <ResourceModule
      resourceKey="inventory"
      title="Inventory"
      subtitle="Items, suppliers and stock management"
      addLabel="Add Item"
      columns={[
        col.text('name', 'Item'),
        col.text('category', 'Category'),
        col.text('quantity', 'Qty'),
        col.text('minStock', 'Min Stock'),
        col.currency('price', 'Price'),
        col.text('store', 'Store'),
        col.text('supplier', 'Supplier'),
      ]}
      fields={[
        { name: 'name', label: 'Item Name', type: 'text', required: true, fullWidth: true },
        { name: 'category', label: 'Category', type: 'text' },
        { name: 'unit', label: 'Unit', type: 'select', options: [
          { value: 'PCS', label: 'Pieces' },
          { value: 'BOX', label: 'Box' },
          { value: 'REAM', label: 'Ream' },
          { value: 'SET', label: 'Set' },
          { value: 'KG', label: 'Kg' },
        ], default: 'PCS' },
        { name: 'quantity', label: 'Quantity', type: 'number' },
        { name: 'minStock', label: 'Min Stock', type: 'number' },
        { name: 'price', label: 'Price', type: 'number' },
        { name: 'store', label: 'Store', type: 'text' },
        { name: 'supplier', label: 'Supplier', type: 'text' },
      ]}
    />
  )
}
