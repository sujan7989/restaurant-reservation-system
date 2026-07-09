import React from 'react'
import { cn } from '../../styles/theme'

const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse bg-slate-200 rounded', className)}
      {...props}
    />
  )
}

export const SkeletonCard = () => (
  <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
    <Skeleton className="h-6 w-3/4 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6 mb-2" />
    <Skeleton className="h-4 w-4/6" />
  </div>
)

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 bg-white rounded-lg border border-slate-200">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/5" />
        <Skeleton className="h-4 w-1/6" />
        <Skeleton className="h-4 w-1/5" />
        <Skeleton className="h-4 w-1/6" />
      </div>
    ))}
  </div>
)

export default Skeleton
