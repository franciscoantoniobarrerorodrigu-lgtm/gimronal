import React from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center bg-zinc-900/20 border border-zinc-800/50 rounded-xl border-dashed", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50 mb-4">
        <Icon className="h-8 w-8 text-zinc-400" />
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-zinc-100">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-400 mt-2 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}
