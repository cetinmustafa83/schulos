'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { initials, getAvatarColor } from '@/lib/constants'

export function UserAvatar({ name, size = 'md', className }: { name: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizes = {
    sm: 'h-7 w-7 text-xs',
    md: 'h-9 w-9 text-sm',
    lg: 'h-12 w-12 text-base',
  }
  return (
    <Avatar className={cn(sizes[size], className)}>
      <AvatarFallback className={cn('text-white font-medium', getAvatarColor(name))}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
