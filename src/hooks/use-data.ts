'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(data.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

// Generic list fetch
export function useList<T = any>(key: string, params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  return useQuery<{ items: T[]; total: number }>({
    queryKey: [key, params],
    queryFn: () => fetchJson(`/api/${key}${query}`),
  })
}

// Generic single fetch
export function useItem<T = any>(key: string, id?: string) {
  return useQuery<T>({
    queryKey: [key, id],
    queryFn: () => fetchJson(`/api/${key}/${id}`),
    enabled: !!id,
  })
}

// Generic create
export function useCreate(key: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => fetchJson(`/api/${key}`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] })
      toast.success('Created successfully')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

// Generic update
export function useUpdate(key: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetchJson(`/api/${key}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] })
      toast.success('Updated successfully')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

// Generic delete
export function useDelete(key: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => fetchJson(`/api/${key}/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] })
      toast.success('Deleted successfully')
    },
    onError: (e: any) => toast.error(e.message),
  })
}

// Dashboard data
export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => fetchJson('/api/dashboard'),
    refetchInterval: 60000,
  })
}

// Settings
export function useSettings() {
  return useQuery<Record<string, string>>({
    queryKey: ['settings'],
    queryFn: () => fetchJson('/api/settings'),
  })
}
