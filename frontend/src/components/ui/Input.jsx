import React from 'react'
import { cn } from '../../styles/theme'
import { Mail, Lock, User, Calendar, Clock, Users } from 'lucide-react'

const Input = React.forwardRef(({ 
  label, 
  icon, 
  error, 
  className = '', 
  ...props 
}, ref) => {
  const iconMap = {
    email: Mail,
    password: Lock,
    name: User,
    date: Calendar,
    time: Clock,
    guests: Users,
  }
  
  const Icon = iconMap[icon] || icon
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2.5 rounded-lg border border-slate-300',
            'text-slate-900 placeholder-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-all duration-200',
            Icon && 'pl-10',
            error && 'border-error-500 focus:ring-error-500',
            className
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
