const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { JWT_SECRET, verifyToken } = require('../middleware/auth');

// POST /auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.password_hash, u.role, u.customer_id,
              c.company_name, c.contact_name, c.email as customer_email, c.credit_limit, c.balance
       FROM app_user u
       LEFT JOIN customer c ON u.customer_id = c.customer_id
       WHERE u.username = ?`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const payload = {
      userId: user.user_id,
      username: user.username,
      role: user.role,
      customerId: user.customer_id
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.user_id,
        username: user.username,
        role: user.role,
        customerId: user.customer_id,
        companyName: user.company_name,
        contactName: user.contact_name,
        customerEmail: user.customer_email,
        creditLimit: user.credit_limit,
        balance: user.balance
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET /auth/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.user_id, u.username, u.role, u.customer_id,
              c.company_name, c.contact_name, c.email as customer_email, 
              c.phone, c.shipping_address, c.credit_limit, c.balance
       FROM app_user u
       LEFT JOIN customer c ON u.customer_id = c.customer_id
       WHERE u.user_id = ?`,
      [req.user.userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    res.json({
      userId: user.user_id,
      username: user.username,
      role: user.role,
      customerId: user.customer_id,
      companyName: user.company_name,
      contactName: user.contact_name,
      customerEmail: user.customer_email,
      phone: user.phone,
      shippingAddress: user.shipping_address,
      creditLimit: user.credit_limit,
      balance: user.balance
    });
  } catch (err) {
    console.error('Error fetching current user:', err);
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});

module.exports = router;
