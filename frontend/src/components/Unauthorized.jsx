import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button'
import { ShieldX } from 'lucide-react'

const Unauthorized = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-error-100 rounded-full mb-6">
          <ShieldX className="h-10 w-10 text-error-600" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">403</h1>
        <h2 className="text-2xl font-semibold text-slate-700 mb-4">Access Denied</h2>
        <p className="text-slate-600 mb-8">
          You don't have permission to access this page. Please log in with the appropriate account.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate('/login')} variant="secondary">
            Sign In
          </Button>
          <Button onClick={() => navigate('/')}>
            Go to Homepage
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default Unauthorized
