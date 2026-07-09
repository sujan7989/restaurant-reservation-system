import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Button from './ui/Button'
import Card from './ui/Card'
import { UtensilsCrossed, Calendar, Clock, Users, Star, Shield, Zap } from 'lucide-react'

const LandingPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const features = [
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Reserve your table in seconds with our intuitive booking system'
    },
    {
      icon: Clock,
      title: 'Real-time Availability',
      description: 'Check table availability instantly for any date and time'
    },
    {
      icon: Users,
      title: 'Group Reservations',
      description: 'Perfect for solo diners or large groups'
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: Zap,
      title: 'Instant Confirmations',
      description: 'Get immediate confirmation for your reservations'
    },
    {
      icon: Star,
      title: 'Premium Experience',
      description: 'Enjoy a seamless dining reservation experience'
    }
  ]

  const stats = [
    { value: '500+', label: 'Daily Reservations' },
    { value: '50+', label: 'Tables Available' },
    { value: '98%', label: 'Customer Satisfaction' },
    { value: '24/7', label: 'Booking Support' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-primary-800/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <UtensilsCrossed className="h-4 w-4" />
              <span>Premium Restaurant Reservations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6">
              Reserve Your Perfect
              <span className="block text-primary-600 mt-2">Dining Experience</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
              Effortlessly book tables at your favorite restaurant. Real-time availability, 
              instant confirmations, and a seamless reservation experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Button onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')} size="lg">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button onClick={() => navigate('/register')} size="lg">
                    Get Started Free
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/login')} size="lg">
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {stats.map((stat, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-3xl font-bold text-primary-600 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our reservation platform provides all the tools you need for a seamless dining experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Reserve Your Table?
            </h2>
            <p className="text-lg text-primary-100 mb-8">
              Join thousands of satisfied diners who book their tables with us
            </p>
            {user ? (
              <Button
                onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}
                variant="secondary"
                size="lg"
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => navigate('/register')}
                variant="secondary"
                size="lg"
              >
                Create Free Account
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <UtensilsCrossed className="h-5 w-5 text-primary-400" />
            <span className="text-white font-semibold">Restaurant Reservations</span>
          </div>
          <p className="text-sm">
            © 2024 Restaurant Reservation System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
