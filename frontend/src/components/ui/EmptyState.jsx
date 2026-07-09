import React from 'react'
import { motion } from 'framer-motion'
import { CalendarX, Calendar, Users, Table, Plus } from 'lucide-react'

const EmptyState = ({ 
  icon = 'calendar', 
  title = 'No data found', 
  description = 'Get started by creating your first item.',
  action = null 
}) => {
  const icons = {
    calendar: CalendarX,
    reservations: Calendar,
    users: Users,
    tables: Table,
    add: Plus,
  }
  
  const Icon = icons[icon] || Calendar

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="bg-slate-100 rounded-full p-6 mb-4">
        <Icon className="h-12 w-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6 max-w-sm">{description}</p>
      {action && action}
    </motion.div>
  )
}

export default EmptyState
