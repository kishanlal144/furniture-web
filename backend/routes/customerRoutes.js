const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

// Get all customers for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM customers WHERE user_id = ?';
    const params = [req.user.id];

    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY name';

    const [customers] = await pool.query(query, params);
    res.json(customers);
  } catch (err) {
    console.error('Get customers error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single customer
router.get('/:id', auth, async (req, res) => {
  try {
    const [customers] = await pool.query(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (customers.length === 0) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    res.json(customers[0]);
  } catch (err) {
    console.error('Get customer error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create customer
router.post('/', auth, async (req, res) => {
  const {
    name,
    phone,
    email,
    address,
    city,
    state,
    pincode,
    gst_number
  } = req.body;

  if (!name) {
    return res.status(400).json({ msg: 'Customer name is required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO customers (user_id, name, phone, email, address, city, state, pincode, gst_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, phone || '', email || '', address || '', city || '', state || '', pincode || '', gst_number || '']
    );

    const [customers] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    res.json(customers[0]);
  } catch (err) {
    console.error('Create customer error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update customer
router.put('/:id', auth, async (req, res) => {
  const {
    name,
    phone,
    email,
    address,
    city,
    state,
    pincode,
    gst_number
  } = req.body;

  try {
    // Check if customer belongs to user
    const [customers] = await pool.query(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (customers.length === 0) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    await pool.query(
      `UPDATE customers SET
        name = COALESCE(?, name),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        pincode = COALESCE(?, pincode),
        gst_number = COALESCE(?, gst_number)
      WHERE id = ?`,
      [name, phone, email, address, city, state, pincode, gst_number, req.params.id]
    );

    const [updatedCustomers] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    res.json(updatedCustomers[0]);
  } catch (err) {
    console.error('Update customer error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete customer
router.delete('/:id', auth, async (req, res) => {
  try {
    const [customers] = await pool.query(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (customers.length === 0) {
      return res.status(404).json({ msg: 'Customer not found' });
    }

    await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Customer deleted successfully' });
  } catch (err) {
    console.error('Delete customer error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get customer statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_bills,
        SUM(total_amount) as total_amount,
        SUM(paid_amount) as paid_amount,
        SUM(total_amount - paid_amount) as pending_amount
      FROM bills 
      WHERE customer_id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    res.json(stats[0] || { total_bills: 0, total_amount: 0, paid_amount: 0, pending_amount: 0 });
  } catch (err) {
    console.error('Get customer stats error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

// Made with Bob
