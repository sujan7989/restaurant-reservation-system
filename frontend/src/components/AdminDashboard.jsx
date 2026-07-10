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
import ConfirmDialog from './ui/ConfirmDialog'
import EmptyState from './ui/EmptyState'
import { Calendar, Clock, Users, UtensilsCrossed, LogOut, Plus, Table as TableIcon, X, Filter, CalendarX, TrendingUp, CheckCircle, XCircle, Search } from 'lucide-react'

const AdminDashboard = () => {
  const [reservations, setReservations] = useState([])
  const [tables, setTables] = useState([])
  const [activeTab, setActiveTab] = useState('reservations')
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [showTableForm, setShowTableForm] = useState(false)
  const [editingReservation, setEditingReservation] = useState(null)
  const [editingTable, setEditingTable] = useState(null)
  const [filterDate, setFilterDate] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const { user, logout } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [reservationForm, setReservationForm] = useState({
    tableId: '',
    date: '',
    timeSlot: '',
    numberOfGuests: ''
  })

  const [tableForm, setTableForm] = useState({
    tableNumber: '',
    capacity: '',
    location: ''
  })

  const fetchReservations = async () => {
    setLoading(true)
    try {
      const params = filterDate && filterDate.trim() ? { date: filterDate } : {}
      const response = await api.get('/reservations', { params })
      setReservations(response.data.reservations || [])
    } catch (err) {
      addToast('Failed to fetch reservations', 'error')
      setReservations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTables = async () => {
    setLoading(true)
    try {
      const response = await api.get('/tables')
      setTables(response.data.tables || [])
    } catch (err) {
      addToast('Failed to fetch tables', 'error')
      setTables([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
    fetchTables()
  }, [filterDate])

  const handleCreateReservation = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/reservations', reservationForm)
      addToast('Reservation created successfully!', 'success')
      setShowReservationForm(false)
      setReservationForm({ tableId: '', date: '', timeSlot: '', numberOfGuests: '' })
      fetchReservations()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create reservation', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateReservation = async (e) => {
    e.preventDefault()
    
    if (!reservationForm.tableId) {
      addToast('Please select a table', 'warning')
      return
    }
    
    setLoading(true)

    try {
      await api.put(`/reservations/${editingReservation?._id}`, reservationForm)
      addToast('Reservation updated successfully!', 'success')
      setEditingReservation(null)
      setShowReservationForm(false)
      setReservationForm({ tableId: '', date: '', timeSlot: '', numberOfGuests: '' })
      fetchReservations()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update reservation', 'error')
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
      const message = err.response?.data?.message || 'Failed to cancel reservation'
      if (err.response?.status === 409) {
        addToast(message, 'warning')
      } else if (err.response?.status === 403) {
        addToast(message, 'error')
      } else if (err.response?.status === 404) {
        addToast(message, 'error')
      } else {
        addToast(message, 'error')
      }
    }
  }

  const handleEditReservation = (reservation) => {
    setEditingReservation(reservation)
    setReservationForm({
      tableId: reservation.table?._id || '',
      date: reservation.date ? reservation.date.split('T')[0] : '',
      timeSlot: reservation.timeSlot || '',
      numberOfGuests: reservation.numberOfGuests || 1
    })
    setShowReservationForm(true)
  }

  const handleCreateTable = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/tables', tableForm)
      addToast('Table created successfully!', 'success')
      setShowTableForm(false)
      setTableForm({ tableNumber: '', capacity: '', location: '' })
      fetchTables()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create table', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTable = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.put(`/tables/${editingTable?._id}`, tableForm)
      addToast('Table updated successfully!', 'success')
      setEditingTable(null)
      setShowTableForm(false)
      setTableForm({ tableNumber: '', capacity: '', location: '' })
      fetchTables()
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update table', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTable = async (tableId) => {
    try {
      await api.delete(`/tables/${tableId}`)
      addToast('Table deleted successfully', 'success')
      setConfirmDelete(null)
      fetchTables()
    } catch (err) {
      addToast('Failed to delete table', 'error')
    }
  }

  const handleEditTable = (table) => {
    setEditingTable(table)
    setTableForm({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      location: table.location || ''
    })
    setShowTableForm(true)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
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
              <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="admin">Admin</Badge>
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
            <div className="text-sm text-slate-600">Total Reservations</div>
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

          <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-primary-100 p-3 rounded-lg">
                <TableIcon className="h-5 w-5 text-primary-600" />
              </div>
              <span className="text-xs text-slate-500">Active</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{tables.length}</div>
            <div className="text-sm text-slate-600">Active Tables</div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-success-100 p-3 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success-600" />
              </div>
              <span className="text-xs text-slate-500">Available</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {tables.length - reservations.filter(r => {
                const today = new Date().toDateString()
                return new Date(r.date).toDateString() === today && r.status === 'confirmed'
              }).length}
            </div>
            <div className="text-sm text-slate-600">Available Tables</div>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={activeTab === 'reservations' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('reservations')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Reservations
          </Button>
          <Button
            variant={activeTab === 'tables' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('tables')}
          >
            <TableIcon className="h-4 w-4 mr-2" />
            Tables
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'reservations' && (
            <motion.div
              key="reservations"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">All Reservations</h2>
                  <p className="text-slate-600 mt-1">Manage restaurant bookings</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div className="relative flex-1 sm:flex-none">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="all">All Status</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="relative flex-1 sm:flex-none">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <Button onClick={() => setShowReservationForm(!showReservationForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {showReservationForm ? 'Cancel' : 'New'}
                  </Button>
                </div>
              </div>

              {/* Create/Edit Reservation Form */}
              <AnimatePresence>
                {showReservationForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8"
                  >
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-6">
                        {editingReservation ? 'Edit Reservation' : 'Create New Reservation'}
                      </h3>
                      <form onSubmit={editingReservation ? handleUpdateReservation : handleCreateReservation} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">User Email</label>
                            <input
                              type="email"
                              value={editingReservation?.user?.email || ''}
                              disabled
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-slate-100 text-slate-500 cursor-not-allowed"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Table</label>
                            <select
                              name="tableId"
                              value={reservationForm.tableId}
                              onChange={(e) => setReservationForm({ ...reservationForm, tableId: e.target.value })}
                              required
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            >
                              <option value="">Select a table</option>
                              {tables.map(table => (
                                <option key={table?._id} value={table?._id}>
                                  Table {table?.tableNumber} (Capacity: {table?.capacity})
                                </option>
                              ))}
                            </select>
                          </div>
                          <Input
                            label="Date"
                            name="date"
                            type="date"
                            icon="date"
                            value={reservationForm.date}
                            onChange={(e) => setReservationForm({ ...reservationForm, date: e.target.value })}
                            required
                          />
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Time Slot</label>
                            <select
                              name="timeSlot"
                              value={reservationForm.timeSlot}
                              onChange={(e) => setReservationForm({ ...reservationForm, timeSlot: e.target.value })}
                              required
                              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                            >
                              <option value="">Select a time slot</option>
                              <option value="11:00-13:00">11:00 - 13:00</option>
                              <option value="13:00-15:00">13:00 - 15:00</option>
                              <option value="17:00-19:00">17:00 - 19:00</option>
                              <option value="19:00-21:00">19:00 - 21:00</option>
                              <option value="21:00-23:00">21:00 - 23:00</option>
                            </select>
                          </div>
                          <Input
                            label="Number of Guests"
                            name="numberOfGuests"
                            type="number"
                            icon="guests"
                            value={reservationForm.numberOfGuests}
                            onChange={(e) => setReservationForm({ ...reservationForm, numberOfGuests: e.target.value })}
                            required
                            min="1"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button type="submit" loading={loading}>
                            {editingReservation ? 'Update Reservation' : 'Create Reservation'}
                          </Button>
                          {editingReservation && (
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                setEditingReservation(null)
                                setShowReservationForm(false)
                                setReservationForm({ tableId: '', date: '', timeSlot: '', numberOfGuests: '' })
                              }}
                            >
                              Cancel Edit
                            </Button>
                          )}
                        </div>
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
              ) : reservations.filter(r => {
                const matchesSearch = searchQuery === '' || r.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
                const matchesStatus = statusFilter === 'all' || r.status === statusFilter
                return matchesSearch && matchesStatus
              }).length === 0 ? (
                <EmptyState
                  icon="reservations"
                  title="No reservations found"
                  description="No reservations match your current filters."
                />
              ) : (
                <div className="grid gap-4">
                  {reservations
                    .filter(r => {
                      const matchesSearch = searchQuery === '' || r.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
                      const matchesStatus = statusFilter === 'all' || r.status === statusFilter
                      return matchesSearch && matchesStatus
                    })
                    .map((reservation, index) => (
                    <motion.div
                      key={reservation?._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge variant={reservation.status}>
                                {reservation.status}
                              </Badge>
                              <span className="text-sm text-slate-500">
                                #{reservation?._id?.slice(-6) || 'N/A'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
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
                              <div>
                                <p className="text-slate-500 mb-1">User</p>
                                <p className="font-medium text-slate-900 text-xs">
                                  {reservation.user?.email}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleEditReservation(reservation)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setConfirmCancel(reservation?._id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'tables' && (
            <motion.div
              key="tables"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Manage Tables</h2>
                  <p className="text-slate-600 mt-1">Configure restaurant seating</p>
                </div>
                <Button onClick={() => setShowTableForm(!showTableForm)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {showTableForm ? 'Cancel' : 'Add Table'}
                </Button>
              </div>

              {/* Create/Edit Table Form */}
              <AnimatePresence>
                {showTableForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-8"
                  >
                    <Card className="p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-6">
                        {editingTable ? 'Edit Table' : 'Add New Table'}
                      </h3>
                      <form onSubmit={editingTable ? handleUpdateTable : handleCreateTable} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <Input
                            label="Table Number"
                            name="tableNumber"
                            type="number"
                            value={tableForm.tableNumber}
                            onChange={(e) => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                            required
                            min="1"
                          />
                          <Input
                            label="Capacity"
                            name="capacity"
                            type="number"
                            value={tableForm.capacity}
                            onChange={(e) => setTableForm({ ...tableForm, capacity: e.target.value })}
                            required
                            min="1"
                          />
                          <Input
                            label="Location"
                            name="location"
                            type="text"
                            value={tableForm.location}
                            onChange={(e) => setTableForm({ ...tableForm, location: e.target.value })}
                            placeholder="e.g., Window, Center, Corner"
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button type="submit" loading={loading}>
                            {editingTable ? 'Update Table' : 'Add Table'}
                          </Button>
                          {editingTable && (
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => {
                                setEditingTable(null)
                                setShowTableForm(false)
                                setTableForm({ tableNumber: '', capacity: '', location: '' })
                              }}
                            >
                              Cancel Edit
                            </Button>
                          )}
                        </div>
                      </form>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tables List */}
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
              ) : tables.length === 0 ? (
                <EmptyState
                  icon="tables"
                  title="No tables found"
                  description="Add tables to configure your restaurant seating."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tables.map((table, index) => (
                    <motion.div
                      key={table?._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-primary-100 p-3 rounded-lg">
                            <TableIcon className="h-6 w-6 text-primary-600" />
                          </div>
                          <Badge variant="default">#{table.tableNumber}</Badge>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Capacity</span>
                            <span className="font-medium text-slate-900">{table.capacity} guests</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Location</span>
                            <span className="font-medium text-slate-900">{table.location || '-'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEditTable(table)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setConfirmDelete(table?._id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDeleteTable(confirmDelete)}
        title="Delete Table"
        message="Are you sure you want to delete this table? This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="No, Keep It"
        variant="danger"
      />
    </div>
  )
}

export default AdminDashboard
