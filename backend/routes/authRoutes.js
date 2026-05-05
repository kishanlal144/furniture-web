const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const auth = require('../middleware/auth');

// Signup route with comprehensive business details
router.post('/signup', async (req, res) => {
  const { 
    name, 
    email, 
    password,
    businessName,
    businessTagline,
    businessPhone,
    businessEmail,
    businessAddress,
    businessCity,
    businessState,
    businessPincode,
    gstNumber,
    panNumber
  } = req.body;

  try {
    // Check if user exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await pool.query(
      `INSERT INTO users (
        name, email, password, 
        business_name, business_tagline, business_phone, business_email,
        business_address, business_city, business_state, business_pincode,
        gst_number, pan_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, email, hashedPassword,
        businessName || 'My Furniture Business',
        businessTagline || 'Quality Furniture Solutions',
        businessPhone || '',
        businessEmail || email,
        businessAddress || '',
        businessCity || '',
        businessState || '',
        businessPincode || '',
        gstNumber || '',
        panNumber || ''
      ]
    );

    const userId = result.insertId;

    // Create JWT token
    const payload = { user: { id: userId } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        
        // Set cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 86400000 // 24 hours
        });

        res.json({
          token,
          user: {
            id: userId,
            name,
            email,
            businessName: businessName || 'My Furniture Business',
            businessTagline: businessTagline || 'Quality Furniture Solutions',
            businessPhone: businessPhone || '',
            businessEmail: businessEmail || email
          }
        });
      }
    );
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Create JWT token
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        
        // Set cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 86400000 // 24 hours
        });

        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            businessName: user.business_name,
            businessTagline: user.business_tagline,
            businessPhone: user.business_phone,
            businessEmail: user.business_email,
            businessAddress: user.business_address,
            businessCity: user.business_city,
            businessState: user.business_state,
            businessPincode: user.business_pincode,
            gstNumber: user.gst_number,
            panNumber: user.pan_number,
            bankName: user.bank_name,
            accountNumber: user.account_number,
            ifscCode: user.ifsc_code,
            logoUrl: user.logo_url,
            website: user.website,
            termsAndConditions: user.terms_and_conditions
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, name, email, 
        business_name, business_tagline, business_phone, business_email,
        business_address, business_city, business_state, business_pincode, business_country,
        gst_number, pan_number, business_registration_number,
        bank_name, account_number, ifsc_code,
        logo_url, website, terms_and_conditions,
        created_at
      FROM users WHERE id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      businessName: user.business_name,
      businessTagline: user.business_tagline,
      businessPhone: user.business_phone,
      businessEmail: user.business_email,
      businessAddress: user.business_address,
      businessCity: user.business_city,
      businessState: user.business_state,
      businessPincode: user.business_pincode,
      businessCountry: user.business_country,
      gstNumber: user.gst_number,
      panNumber: user.pan_number,
      businessRegistrationNumber: user.business_registration_number,
      bankName: user.bank_name,
      accountNumber: user.account_number,
      ifscCode: user.ifsc_code,
      logoUrl: user.logo_url,
      website: user.website,
      termsAndConditions: user.terms_and_conditions,
      createdAt: user.created_at
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  const {
    businessName,
    businessTagline,
    businessPhone,
    businessEmail,
    businessAddress,
    businessCity,
    businessState,
    businessPincode,
    businessCountry,
    gstNumber,
    panNumber,
    businessRegistrationNumber,
    bankName,
    accountNumber,
    ifscCode,
    logoUrl,
    website,
    termsAndConditions
  } = req.body;

  try {
    await pool.query(
      `UPDATE users SET
        business_name = COALESCE(?, business_name),
        business_tagline = COALESCE(?, business_tagline),
        business_phone = COALESCE(?, business_phone),
        business_email = COALESCE(?, business_email),
        business_address = COALESCE(?, business_address),
        business_city = COALESCE(?, business_city),
        business_state = COALESCE(?, business_state),
        business_pincode = COALESCE(?, business_pincode),
        business_country = COALESCE(?, business_country),
        gst_number = COALESCE(?, gst_number),
        pan_number = COALESCE(?, pan_number),
        business_registration_number = COALESCE(?, business_registration_number),
        bank_name = COALESCE(?, bank_name),
        account_number = COALESCE(?, account_number),
        ifsc_code = COALESCE(?, ifsc_code),
        logo_url = COALESCE(?, logo_url),
        website = COALESCE(?, website),
        terms_and_conditions = COALESCE(?, terms_and_conditions)
      WHERE id = ?`,
      [
        businessName, businessTagline, businessPhone, businessEmail,
        businessAddress, businessCity, businessState, businessPincode, businessCountry,
        gstNumber, panNumber, businessRegistrationNumber,
        bankName, accountNumber, ifscCode,
        logoUrl, website, termsAndConditions,
        req.user.id
      ]
    );

    // Get updated user
    const [users] = await pool.query(
      `SELECT id, name, email, 
        business_name, business_tagline, business_phone, business_email,
        business_address, business_city, business_state, business_pincode, business_country,
        gst_number, pan_number, business_registration_number,
        bank_name, account_number, ifsc_code,
        logo_url, website, terms_and_conditions
      FROM users WHERE id = ?`,
      [req.user.id]
    );

    const user = users[0];
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      businessName: user.business_name,
      businessTagline: user.business_tagline,
      businessPhone: user.business_phone,
      businessEmail: user.business_email,
      businessAddress: user.business_address,
      businessCity: user.business_city,
      businessState: user.business_state,
      businessPincode: user.business_pincode,
      businessCountry: user.business_country,
      gstNumber: user.gst_number,
      panNumber: user.pan_number,
      businessRegistrationNumber: user.business_registration_number,
      bankName: user.bank_name,
      accountNumber: user.account_number,
      ifscCode: user.ifsc_code,
      logoUrl: user.logo_url,
      website: user.website,
      termsAndConditions: user.terms_and_conditions
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  if (req.session) {
    req.session.destroy();
  }
  res.json({ msg: 'Logged out successfully' });
});

module.exports = router;

// Made with Bob
