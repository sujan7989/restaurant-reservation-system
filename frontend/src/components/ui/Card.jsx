import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../styles/theme'

const Card = React.forwardRef(({ children, className = '', hover = false, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(
        'bg-white rounded-xl shadow-md border border-slate-200',
        hover && 'hover:shadow-lg transition-shadow duration-200',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  )
})

Card.displayName = 'Card'

export default Card
