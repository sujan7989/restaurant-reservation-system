const express = require('express');
const { body, validationResult } = require('express-validator');
const Table = require('../models/Table');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tables
// @desc    Get all tables
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json({
      success: true,
      count: tables.length,
      tables
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tables/:id
// @desc    Get single table
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    res.json({
      success: true,
      table
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tables
// @desc    Create a new table
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), [
  body('tableNumber').isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tableNumber, capacity, location } = req.body;

    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({ message: 'Table with this number already exists' });
    }

    const table = await Table.create({
      tableNumber,
      capacity,
      location
    });

    res.status(201).json({
      success: true,
      table
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tables/:id
// @desc    Update table
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), [
  body('tableNumber').optional().isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // If updating table number, check if it already exists
    if (req.body.tableNumber && req.body.tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({ tableNumber: req.body.tableNumber });
      if (existingTable) {
        return res.status(400).json({ message: 'Table with this number already exists' });
      }
    }

    const updatedTable = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      table: updatedTable
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tables/:id
// @desc    Delete table
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ message: 'Table not found' });
    }

    await Table.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
