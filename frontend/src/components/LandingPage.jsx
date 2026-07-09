import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'
import { UtensilsCrossed } from 'lucide-react'

const LandingPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Image */}
      <section className="relative h-screen min-h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80" />
        </div>

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary-600 p-2 rounded-lg">
                <UtensilsCrossed className="h-6 w-6 text-white" />
              </div>
              <span className="text-primary-400 font-medium text-lg">Restaurant Reservation System</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Restaurant Reservation
              <span className="block text-primary-400 mt-2">Management System</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl">
              Manage reservations, tables, and guest bookings with real-time availability and secure role-based access.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <Button 
                  onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')} 
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => navigate('/register')} 
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Get Started
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/login')} 
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-slate-400 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © 2024 Restaurant Reservation Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
