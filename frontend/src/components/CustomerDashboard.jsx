import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../utils/axios'
import Card from './ui/Card'
import Button from './ui/Button'
import Input from './ui/Input'
import Badge from './ui/Badge'
import Modal from './ui/Modal'
import ConfirmDialog from './ui/ConfirmDialog'
import EmptyState from './ui/EmptyState'
import { Calendar, Clock, Users, UtensilsCrossed, LogOut, Plus, X, CalendarX, TrendingUp, CheckCircle, XCircle } from 'lucide-react'

const CustomerDashboard = () => {
  const [reservations, setReservations] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [availableTables, setAvailableTables] = useState([])
  const [loading, setLoading] = useState(false)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(null)
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    numberOfGuests: '',
    tableId: ''
  })
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const fetchReservations = async () => {
    setLoading(true)
    try {
      const response = await api.get('/reservations')
      setReservations(response.data.reservations || [])
    } catch (err) {
      addToast('Failed to fetch reservations', 'error')
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const checkAvailability = async () => {
    if (!formData.date || !formData.timeSlot || !formData.numberOfGuests) {
      addToast('Please fill in date, time slot, and number of guests first', 'warning')
      return
    }

    setCheckingAvailability(true)
    try {
      const response = await api.get('/reservations/available', {
        params: {
          date: formData.date,
          timeSlot: formData.timeSlot,
          numberOfGuests: formData.numberOfGuests
        }
      })
      setAvailableTables(response.data.availableTables || [])
      if ((response.data.availableTables || []).length === 0) {
        addToast('No tables available for the selected date and time', 'warning')
      }
    } catch (err) {
      addToast('Failed to check availability', 'error')
      setAvailableTables([])
    } finally {
      setCheckingAvailability(false)
    }
  }

  const handleCreateReservation = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/reservations', formData)
      addToast('Reservation created successfully!', 'success')
      setShowCreateForm(false)
      setFormData({ date: '', timeSlot: '', numberOfGuests: '', tableId: '' })
      setAvailableTables([])
      fetchReservations()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create reservation', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelReservation = async (reservationId) => {
    try {
      await api.delete(`/reservations/${reservationId}`)
      addToast('Reservation cancelled successfully', 'success')
      setConfirmCancel(null)
      fetchReservations()
    } catch (err) {
      addToast('Failed to cancel reservation', 'error')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <UtensilsCrossed className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Restaurant Reservations</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-slate-600">
                <span className="font-medium">{user?.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-primary-100 p-3 rounded-lg">
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>
              <span className="text-xs text-slate-500">Total</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{reservations.length}</div>
            <div className="text-sm text-slate-600">My Reservations</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-success-100 p-3 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success-600" />
              </div>
              <span className="text-xs text-slate-500">Upcoming</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {reservations.filter(r => {
                return r.status === 'confirmed' && new Date(r.date) >= new Date()
              }).length}
            </div>
            <div className="text-sm text-slate-600">Upcoming Reservations</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-error-100 p-3 rounded-lg">
                <XCircle className="h-5 w-5 text-error-600" />
              </div>
              <span className="text-xs text-slate-500">Cancelled</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {reservations.filter(r => r.status === 'cancelled').length}
            </div>
            <div className="text-sm text-slate-600">Cancelled Reservations</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-warning-100 p-3 rounded-lg">
                <Clock className="h-5 w-5 text-warning-600" />
              </div>
              <span className="text-xs text-slate-500">Today</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {reservations.filter(r => {
                const today = new Date().toDateString()
                return new Date(r.date).toDateString() === today
              }).length}
            </div>
            <div className="text-sm text-slate-600">Today's Reservations</div>
          </Card>
        </motion.div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">My Reservations</h2>
            <p className="text-slate-600 mt-1">Manage your restaurant bookings</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? 'Cancel' : 'New Reservation'}
          </Button>
        </div>

        {/* Create Reservation Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Create New Reservation</h3>
                <form onSubmit={handleCreateReservation} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Date"
                      name="date"
                      type="date"
                      icon="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Time Slot</label>
                      <select
                        name="timeSlot"
                        value={formData.timeSlot}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select a time slot</option>
                        <option value="11:00-13:00">11:00 - 13:00 (Lunch)</option>
                        <option value="13:00-15:00">13:00 - 15:00 (Late Lunch)</option>
                        <option value="17:00-19:00">17:00 - 19:00 (Early Dinner)</option>
                        <option value="19:00-21:00">19:00 - 21:00 (Dinner)</option>
                        <option value="21:00-23:00">21:00 - 23:00 (Late Dinner)</option>
                      </select>
                    </div>
                    <Input
                      label="Number of Guests"
                      name="numberOfGuests"
                      type="number"
                      icon="guests"
                      value={formData.numberOfGuests}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={checkAvailability}
                    loading={checkingAvailability}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Check Availability
                  </Button>
                  {availableTables && availableTables.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Table</label>
                      <select
                        name="tableId"
                        value={formData.tableId}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select a table</option>
                        {availableTables.map(table => (
                          <option key={table._id} value={table._id}>
                            Table {table.tableNumber} (Capacity: {table.capacity}) - {table.location}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!formData.tableId}
                  >
                    Create Reservation
                  </Button>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reservations List */}
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="h-6 bg-slate-200 rounded w-1/4 mb-4 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="No reservations yet"
            description="You haven't made any reservations. Click the button above to create your first one."
          />
        ) : (
          <div className="grid gap-4">
            {reservations.map((reservation, index) => (
              <motion.div
                key={reservation._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant={reservation.status}>
                          {reservation.status}
                        </Badge>
                        <span className="text-sm text-slate-500">
                          #{reservation._id.slice(-6)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 mb-1">Date</p>
                          <p className="font-medium text-slate-900 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            {formatDate(reservation.date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Time</p>
                          <p className="font-medium text-slate-900 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            {reservation.timeSlot}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Table</p>
                          <p className="font-medium text-slate-900">
                            Table {reservation.table?.tableNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Guests</p>
                          <p className="font-medium text-slate-900 flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            {reservation.numberOfGuests}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmCancel(reservation._id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Confirm Cancel Dialog */}
      <ConfirmDialog
        isOpen={!!confirmCancel}
        onClose={() => setConfirmCancel(null)}
        onConfirm={() => handleCancelReservation(confirmCancel)}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this reservation? This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="No, Keep It"
        variant="danger"
      />
    </div>
  )
}

export default CustomerDashboard
