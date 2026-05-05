const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

// Get all products (with optional category filter)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products WHERE is_active = TRUE';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY category, name';

    const [products] = await pool.query(query, params);
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get product categories
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query(
      'SELECT DISTINCT category FROM products WHERE is_active = TRUE ORDER BY category'
    );
    res.json(categories.map(c => c.category));
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND is_active = TRUE',
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    res.json(products[0]);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create custom product (authenticated users only)
router.post('/', auth, async (req, res) => {
  const {
    name,
    category,
    description,
    rate_per_sqft,
    unit,
    hsn_code,
    tax_rate
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO products (user_id, name, category, description, rate_per_sqft, unit, hsn_code, tax_rate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, category || 'Custom', description || '', rate_per_sqft, unit || 'sqft', hsn_code || '', tax_rate || 18.00]
    );

    const [products] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.json(products[0]);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update product (only user's own products)
router.put('/:id', auth, async (req, res) => {
  const {
    name,
    category,
    description,
    rate_per_sqft,
    unit,
    hsn_code,
    tax_rate,
    is_active
  } = req.body;

  try {
    // Check if product belongs to user
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ msg: 'Product not found or unauthorized' });
    }

    await pool.query(
      `UPDATE products SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        description = COALESCE(?, description),
        rate_per_sqft = COALESCE(?, rate_per_sqft),
        unit = COALESCE(?, unit),
        hsn_code = COALESCE(?, hsn_code),
        tax_rate = COALESCE(?, tax_rate),
        is_active = COALESCE(?, is_active)
      WHERE id = ?`,
      [name, category, description, rate_per_sqft, unit, hsn_code, tax_rate, is_active, req.params.id]
    );

    const [updatedProducts] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(updatedProducts[0]);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete product (soft delete - only user's own products)
router.delete('/:id', auth, async (req, res) => {
  try {
    const [products] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ msg: 'Product not found or unauthorized' });
    }

    await pool.query('UPDATE products SET is_active = FALSE WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

// Made with Bob
