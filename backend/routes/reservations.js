const express = require('express');
const { body, validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper function to check table availability
const checkAvailability = async (tableId, date, timeSlot) => {
  const conflictingReservation = await Reservation.findOne({
    table: tableId,
    date: new Date(date),
    timeSlot: timeSlot,
    status: 'confirmed'
  });
  return !conflictingReservation;
};

// Helper function to find available tables
const findAvailableTables = async (date, timeSlot, numberOfGuests) => {
  // Find tables with sufficient capacity
  const suitableTables = await Table.find({ capacity: { $gte: numberOfGuests } });
  
  // Filter out tables that are already booked for the given date and time slot
  const bookedTableIds = await Reservation.find({
    date: new Date(date),
    timeSlot: timeSlot,
    status: 'confirmed'
  }).distinct('table');
  
  const availableTables = suitableTables.filter(
    table => !bookedTableIds.includes(table._id.toString())
  );
  
  return availableTables;
};

// @route   GET /api/reservations
// @desc    Get all reservations (admin) or user's reservations (customer)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    console.log('GET /api/reservations - User:', req.user.id, 'Role:', req.user.role, 'Query:', req.query);
    let reservations;

    if (req.user.role === 'admin') {
      // Admin can see all reservations (all statuses)
      const { date } = req.query;
      const query = {};

      if (date) {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          console.error('Invalid date format:', date);
          return res.status(400).json({ message: 'Invalid date format' });
        }
        query.date = parsedDate;
      }

      reservations = await Reservation.find(query)
        .populate('user', 'name email')
        .populate('table', 'tableNumber capacity location')
        .sort({ date: 1, timeSlot: 1 });
    } else {
      // Customers can only see their own reservations (all statuses)
      reservations = await Reservation.find({
        user: req.user.id
      })
        .populate('table', 'tableNumber capacity location')
        .sort({ date: 1, timeSlot: 1 });
    }

    console.log('Found reservations:', reservations.length);
    res.json({
      success: true,
      count: reservations.length,
      reservations
    });
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reservations/available
// @desc    Get available tables for a specific date and time slot
// @access  Private
router.get('/available', protect, async (req, res) => {
  try {
    const { date, timeSlot, numberOfGuests } = req.query;
    
    if (!date || !timeSlot || !numberOfGuests) {
      return res.status(400).json({ 
        message: 'Date, time slot, and number of guests are required' 
      });
    }
    
    const availableTables = await findAvailableTables(date, timeSlot, parseInt(numberOfGuests));
    
    res.json({
      success: true,
      count: availableTables.length,
      availableTables
    });
  } catch (error) {
    console.error('Get available tables error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/reservations
// @desc    Create a new reservation
// @access  Private
router.post('/', protect, [
  body('tableId').notEmpty().withMessage('Table ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('timeSlot').isIn(['11:00-13:00', '13:00-15:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'])
    .withMessage('Invalid time slot'),
  body('numberOfGuests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tableId, date, timeSlot, numberOfGuests } = req.body;

    // Validate table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Check if table capacity is sufficient
    if (table.capacity < numberOfGuests) {
      return res.status(400).json({ 
        message: `Table capacity is ${table.capacity}, but you requested ${numberOfGuests} guests` 
      });
    }

    // Check availability
    const isAvailable = await checkAvailability(tableId, date, timeSlot);
    if (!isAvailable) {
      return res.status(409).json({ 
        message: 'Table is already booked for this date and time slot' 
      });
    }

    // Create reservation
    const reservation = await Reservation.create({
      user: req.user.id,
      table: tableId,
      date: new Date(date),
      timeSlot,
      numberOfGuests
    });

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('table', 'tableNumber capacity location');

    res.status(201).json({
      success: true,
      reservation: populatedReservation
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reservations/:id
// @desc    Get single reservation
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('user', 'name email')
      .populate('table', 'tableNumber capacity location');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check ownership or admin access
    if (req.user.role !== 'admin' && reservation.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this reservation' });
    }

    res.json({
      success: true,
      reservation
    });
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/reservations/:id
// @desc    Update reservation (admin only)
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), [
  body('tableId').optional().notEmpty().withMessage('Table ID cannot be empty'),
  body('date').optional().isISO8601().withMessage('Valid date is required'),
  body('timeSlot').optional().isIn(['11:00-13:00', '13:00-15:00', '17:00-19:00', '19:00-21:00', '21:00-23:00'])
    .withMessage('Invalid time slot'),
  body('numberOfGuests').optional().isInt({ min: 1 }).withMessage('Number of guests must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const { tableId, date, timeSlot, numberOfGuests } = req.body;

    // If updating table, date, or time slot, check availability
    if (tableId || date || timeSlot) {
      const updatedTableId = tableId || reservation.table;
      const updatedDate = date || reservation.date;
      const updatedTimeSlot = timeSlot || reservation.timeSlot;

      // Validate table exists if provided
      if (tableId) {
        const table = await Table.findById(tableId);
        if (!table) {
          return res.status(404).json({ message: 'Table not found' });
        }

        // Check capacity if numberOfGuests is also being updated
        const updatedGuests = numberOfGuests || reservation.numberOfGuests;
        if (table.capacity < updatedGuests) {
          return res.status(400).json({ 
            message: `Table capacity is ${table.capacity}, but you requested ${updatedGuests} guests` 
          });
        }
      }

      // Check availability (exclude current reservation from conflict check)
      const conflictingReservation = await Reservation.findOne({
        table: updatedTableId,
        date: new Date(updatedDate),
        timeSlot: updatedTimeSlot,
        status: 'confirmed',
        _id: { $ne: req.params.id }
      });

      if (conflictingReservation) {
        return res.status(409).json({ 
          message: 'Table is already booked for this date and time slot' 
        });
      }
    }

    // Update reservation
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('table', 'tableNumber capacity location')
      .populate('user', 'name email');

    res.json({
      success: true,
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/reservations/:id
// @desc    Cancel reservation
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check owndership or admin access
    if (req.user.role !== 'admin' && reservation.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
    }

    // Soft delete by setting status to cancelled
    reservation.status = 'cancelled';
    await reservation.save();

    res.json({
      success: true,
      message: 'Reservation cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
