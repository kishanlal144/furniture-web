const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

module.exports = async function(req, res, next) {
  // Get token from cookie or header
  const token = req.cookies.token || req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    
    // Get user from database
    const [users] = await pool.query(
      'SELECT id, name, email, business_name, business_tagline, business_phone, business_email, business_address, business_city, business_state, business_pincode, gst_number, pan_number, bank_name, account_number, ifsc_code, logo_url, website, terms_and_conditions FROM users WHERE id = ?',
      [decoded.user.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    req.user = { id: users[0].id };
    req.userDetails = users[0];
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Made with Bob
