const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

// Generate invoice number
const generateInvoiceNumber = async (userId) => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  const [result] = await pool.query(
    'SELECT COUNT(*) as count FROM bills WHERE user_id = ? AND YEAR(bill_date) = ?',
    [userId, year]
  );
  
  const count = result[0].count + 1;
  return `INV-${year}${month}-${String(count).padStart(4, '0')}`;
};

// Get all bills for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const { status, from_date, to_date, customer_id } = req.query;
    let query = `
      SELECT b.*, c.name as customer_name_ref, c.phone as customer_phone_ref
      FROM bills b
      LEFT JOIN customers c ON b.customer_id = c.id
      WHERE b.user_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      query += ' AND b.payment_status = ?';
      params.push(status);
    }

    if (from_date) {
      query += ' AND b.bill_date >= ?';
      params.push(from_date);
    }

    if (to_date) {
      query += ' AND b.bill_date <= ?';
      params.push(to_date);
    }

    if (customer_id) {
      query += ' AND b.customer_id = ?';
      params.push(customer_id);
    }

    query += ' ORDER BY b.bill_date DESC, b.created_at DESC';

    const [bills] = await pool.query(query, params);

    // Get items for each bill
    for (let bill of bills) {
      const [items] = await pool.query(
        'SELECT * FROM bill_items WHERE bill_id = ?',
        [bill.id]
      );
      bill.items = items;
    }

    res.json(bills);
  } catch (err) {
    console.error('Get bills error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get single bill with full details
router.get('/:id', auth, async (req, res) => {
  try {
    const [bills] = await pool.query(
      `SELECT b.*, c.name as customer_name_ref, c.phone as customer_phone_ref, c.email as customer_email_ref
       FROM bills b
       LEFT JOIN customers c ON b.customer_id = c.id
       WHERE b.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (bills.length === 0) {
      return res.status(404).json({ msg: 'Bill not found' });
    }

    const bill = bills[0];

    // Get bill items
    const [items] = await pool.query(
      'SELECT * FROM bill_items WHERE bill_id = ?',
      [bill.id]
    );
    bill.items = items;

    res.json(bill);
  } catch (err) {
    console.error('Get bill error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Create bill
router.post('/', auth, async (req, res) => {
  const {
    customer_id,
    customer_name,
    customer_phone,
    customer_address,
    customer_gst,
    items,
    discount_amount,
    payment_method,
    paid_amount,
    notes,
    terms,
    bill_date,
    due_date
  } = req.body;

  if (!customer_name || !items || items.length === 0) {
    return res.status(400).json({ msg: 'Customer name and items are required' });
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // Calculate totals
    let subtotal = 0;
    let total_tax = 0;

    const processedItems = items.map(item => {
      const amount = parseFloat(item.amount || 0);
      const tax_rate = parseFloat(item.tax_rate || 18);
      const tax_amount = (amount * tax_rate) / 100;
      
      subtotal += amount;
      total_tax += tax_amount;

      return {
        ...item,
        amount,
        tax_rate,
        tax_amount
      };
    });

    const discount = parseFloat(discount_amount || 0);
    const total_amount = subtotal + total_tax - discount;
    const paid = parseFloat(paid_amount || 0);
    
    let payment_status = 'pending';
    if (paid >= total_amount) {
      payment_status = 'paid';
    } else if (paid > 0) {
      payment_status = 'partial';
    }

    // Generate invoice number
    const invoice_number = await generateInvoiceNumber(req.user.id);

    // Insert bill
    const [billResult] = await connection.query(
      `INSERT INTO bills (
        user_id, customer_id, invoice_number, customer_name, customer_phone, 
        customer_address, customer_gst, subtotal, tax_amount, discount_amount, 
        total_amount, payment_status, payment_method, paid_amount, notes, terms,
        bill_date, due_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        customer_id || null,
        invoice_number,
        customer_name,
        customer_phone || '',
        customer_address || '',
        customer_gst || '',
        subtotal,
        total_tax,
        discount,
        total_amount,
        payment_status,
        payment_method || '',
        paid,
        notes || '',
        terms || '',
        bill_date || new Date(),
        due_date || null
      ]
    );

    const billId = billResult.insertId;

    // Insert bill items
    for (const item of processedItems) {
      await connection.query(
        `INSERT INTO bill_items (
          bill_id, product_id, product_name, description, length, width, 
          quantity, sqft, rate, amount, tax_rate, tax_amount, hsn_code
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          billId,
          item.product_id || null,
          item.product_name || item.catalogName,
          item.description || '',
          item.length || null,
          item.width || null,
          item.quantity || 1,
          item.sqft || null,
          item.rate,
          item.amount,
          item.tax_rate,
          item.tax_amount,
          item.hsn_code || ''
        ]
      );
    }

    await connection.commit();

    // Get the created bill with items
    const [bills] = await connection.query(
      'SELECT * FROM bills WHERE id = ?',
      [billId]
    );
    const [billItems] = await connection.query(
      'SELECT * FROM bill_items WHERE bill_id = ?',
      [billId]
    );

    const bill = bills[0];
    bill.items = billItems;

    res.json(bill);
  } catch (err) {
    await connection.rollback();
    console.error('Create bill error:', err);
    res.status(500).json({ msg: 'Server error' });
  } finally {
    connection.release();
  }
});

// Update bill
router.put('/:id', auth, async (req, res) => {
  const {
    payment_status,
    payment_method,
    paid_amount,
    notes,
    due_date
  } = req.body;

  try {
    const [bills] = await pool.query(
      'SELECT * FROM bills WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (bills.length === 0) {
      return res.status(404).json({ msg: 'Bill not found' });
    }

    await pool.query(
      `UPDATE bills SET
        payment_status = COALESCE(?, payment_status),
        payment_method = COALESCE(?, payment_method),
        paid_amount = COALESCE(?, paid_amount),
        notes = COALESCE(?, notes),
        due_date = COALESCE(?, due_date)
      WHERE id = ?`,
      [payment_status, payment_method, paid_amount, notes, due_date, req.params.id]
    );

    const [updatedBills] = await pool.query('SELECT * FROM bills WHERE id = ?', [req.params.id]);
    const [items] = await pool.query('SELECT * FROM bill_items WHERE bill_id = ?', [req.params.id]);
    
    const bill = updatedBills[0];
    bill.items = items;

    res.json(bill);
  } catch (err) {
    console.error('Update bill error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete bill
router.delete('/:id', auth, async (req, res) => {
  try {
    const [bills] = await pool.query(
      'SELECT * FROM bills WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (bills.length === 0) {
      return res.status(404).json({ msg: 'Bill not found' });
    }

    // Bill items will be deleted automatically due to CASCADE
    await pool.query('DELETE FROM bills WHERE id = ?', [req.params.id]);
    res.json({ msg: 'Bill deleted successfully' });
  } catch (err) {
    console.error('Delete bill error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get dashboard statistics
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as total_bills,
        SUM(total_amount) as total_revenue,
        SUM(paid_amount) as total_paid,
        SUM(total_amount - paid_amount) as total_pending,
        SUM(CASE WHEN payment_status = 'paid' THEN 1 ELSE 0 END) as paid_bills,
        SUM(CASE WHEN payment_status = 'pending' THEN 1 ELSE 0 END) as pending_bills,
        SUM(CASE WHEN payment_status = 'partial' THEN 1 ELSE 0 END) as partial_bills
      FROM bills 
      WHERE user_id = ?`,
      [req.user.id]
    );

    const [monthlyStats] = await pool.query(
      `SELECT 
        DATE_FORMAT(bill_date, '%Y-%m') as month,
        COUNT(*) as bills_count,
        SUM(total_amount) as revenue
      FROM bills 
      WHERE user_id = ? AND bill_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(bill_date, '%Y-%m')
      ORDER BY month DESC`,
      [req.user.id]
    );

    res.json({
      overall: stats[0],
      monthly: monthlyStats
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;

// Made with Bob
