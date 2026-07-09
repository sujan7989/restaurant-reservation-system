import React from 'react'
import { cn } from '../../styles/theme'

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-100 text-success-800',
    error: 'bg-error-100 text-error-800',
    warning: 'bg-warning-100 text-warning-800',
    confirmed: 'bg-success-100 text-success-800',
    cancelled: 'bg-error-100 text-error-800',
    admin: 'bg-primary-100 text-primary-800',
    customer: 'bg-slate-100 text-slate-800',
  }
  
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants[variant],
      className
    )}>
      {children}
    </span>
  )
}

export default Badge
