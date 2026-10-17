const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// All customer routes require customer role & verified token
router.use(verifyToken, requireRole('customer'));

// ---------------------------------------------------------------------
// 1. PRODUCTS & CATALOGUE
// ---------------------------------------------------------------------
router.get('/products', async (req, res) => {
  try {
    // Get all active products with their category
    const [products] = await pool.query(`
      SELECT 
        p.product_id,
        p.sku,
        p.name,
        p.description,
        p.unit_of_measure,
        p.min_order_qty,
        p.stock_qty,
        p.base_price,
        c.category_id,
        c.name AS category_name
      FROM product p
      JOIN category c ON p.category_id = c.category_id
      WHERE p.is_active = TRUE
      ORDER BY c.name, p.name
    `);

    // Fetch all price tiers for active products
    const [tiers] = await pool.query(`
      SELECT tier_id, product_id, min_qty, max_qty, unit_price, discount_pct
      FROM price_tier
      ORDER BY product_id, min_qty ASC
    `);

    // Attach tiers to each product
    const productsWithTiers = products.map(prod => {
      const productTiers = tiers.filter(t => t.product_id === prod.product_id);
      return {
        ...prod,
        price_tiers: productTiers
      };
    });

    res.json(productsWithTiers);
  } catch (err) {
    console.error('Error fetching catalogue:', err);
    res.status(500).json({ error: 'Failed to load product catalogue' });
  }
});

// ---------------------------------------------------------------------
// 2. ORDERS & ATOMIC PLACEMENT TRANSACTION
// ---------------------------------------------------------------------
router.post('/orders', async (req, res) => {
  const customerId = req.user.customerId;
  const { shipping_address, notes, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  // Get shipping address from customer profile if not provided
  let finalShippingAddress = shipping_address;
  if (!finalShippingAddress) {
    const [custRows] = await pool.query(
      'SELECT shipping_address FROM customer WHERE customer_id = ?',
      [customerId]
    );
    if (custRows.length > 0) {
      finalShippingAddress = custRows[0].shipping_address;
    }
  }

  if (!finalShippingAddress) {
    return res.status(400).json({ error: 'A valid shipping address is required.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Insert sales_order header
    const [orderResult] = await connection.query(
      `INSERT INTO sales_order (customer_id, shipping_address, notes, status)
       VALUES (?, ?, ?, 'PENDING')`,
      [customerId, finalShippingAddress, notes || null]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    // (trg_sales_order_item_before_insert validates min_qty and stock, and sets unit_price)
    // (trg_sales_order_item_after_insert decrements warehouse stock)
    for (const item of items) {
      const { product_id, quantity } = item;
      if (!product_id || !quantity || quantity <= 0) {
        throw new Error('Each item must specify a valid product_id and positive quantity.');
      }

      await connection.query(
        `INSERT INTO sales_order_item (order_id, product_id, quantity)
         VALUES (?, ?, ?)`,
        [orderId, product_id, quantity]
      );
    }

    // Call stored procedure to compute totals, set CONFIRMED, and create invoice
    await connection.query('CALL sp_finalize_order(?)', [orderId]);

    await connection.commit();

    // Fetch the created order and invoice summary
    const [orderData] = await pool.query(
      `SELECT * FROM v_customer_orders WHERE order_id = ? AND customer_id = ?`,
      [orderId, customerId]
    );

    res.status(201).json({
      message: 'Order placed successfully and confirmed.',
      order: orderData[0] || { orderId }
    });
  } catch (err) {
    await connection.rollback();
    console.error('Order placement transaction rolled back:', err);

    // Check if error was raised by database trigger (SQLSTATE 45000)
    if (err.sqlState === '45000' || err.sqlMessage) {
      return res.status(400).json({ error: err.sqlMessage || err.message });
    }

    res.status(500).json({ error: err.message || 'Failed to place order due to server error.' });
  } finally {
    connection.release();
  }
});

// GET /orders - List all orders for the authenticated customer
router.get('/orders', async (req, res) => {
  const customerId = req.user.customerId;
  try {
    const [orders] = await pool.query(
      `SELECT * FROM v_customer_orders 
       WHERE customer_id = ? 
       ORDER BY order_date DESC`,
      [customerId]
    );
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// GET /orders/:id - Get detailed order info with line items
router.get('/orders/:id', async (req, res) => {
  const customerId = req.user.customerId;
  const orderId = req.params.id;

  try {
    const [orderRows] = await pool.query(
      `SELECT * FROM v_customer_orders 
       WHERE order_id = ? AND customer_id = ?`,
      [orderId, customerId]
    );

    if (orderRows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const [items] = await pool.query(
      `SELECT 
        soi.item_id,
        soi.product_id,
        p.name AS product_name,
        p.sku,
        p.unit_of_measure,
        soi.quantity,
        soi.unit_price,
        soi.subtotal
       FROM sales_order_item soi
       JOIN product p ON soi.product_id = p.product_id
       WHERE soi.order_id = ?`,
      [orderId]
    );

    res.json({
      ...orderRows[0],
      items
    });
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ error: 'Failed to retrieve order details' });
  }
});

// ---------------------------------------------------------------------
// 3. RECEIPTS & INVOICES
// ---------------------------------------------------------------------
router.get('/receipts', async (req, res) => {
  const customerId = req.user.customerId;
  try {
    const [receipts] = await pool.query(
      `SELECT * FROM v_customer_receipts 
       WHERE customer_id = ? 
       ORDER BY invoice_date DESC`,
      [customerId]
    );
    res.json(receipts);
  } catch (err) {
    console.error('Error fetching receipts:', err);
    res.status(500).json({ error: 'Failed to retrieve invoices' });
  }
});

router.get('/receipts/:invoiceId', async (req, res) => {
  const customerId = req.user.customerId;
  const invoiceId = req.params.invoiceId;

  try {
    const [invoiceRows] = await pool.query(
      `SELECT * FROM v_customer_receipts 
       WHERE invoice_id = ? AND customer_id = ?`,
      [invoiceId, customerId]
    );

    if (invoiceRows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoiceRows[0];

    // Fetch order line items for this invoice
    const [items] = await pool.query(
      `SELECT 
        soi.item_id,
        soi.product_id,
        p.name AS product_name,
        p.sku,
        soi.quantity,
        soi.unit_price,
        soi.subtotal
       FROM sales_order_item soi
       JOIN product p ON soi.product_id = p.product_id
       WHERE soi.order_id = ?`,
      [invoice.order_id]
    );

    res.json({
      ...invoice,
      items
    });
  } catch (err) {
    console.error('Error fetching receipt detail:', err);
    res.status(500).json({ error: 'Failed to retrieve invoice details' });
  }
});

// ---------------------------------------------------------------------
// 4. CUSTOMER INVENTORY & USAGE
// ---------------------------------------------------------------------
router.get('/inventory', async (req, res) => {
  const customerId = req.user.customerId;
  try {
    const [inventory] = await pool.query(
      `SELECT * FROM v_customer_inventory 
       WHERE customer_id = ? 
       ORDER BY is_low_stock DESC, product_name ASC`,
      [customerId]
    );
    res.json(inventory);
  } catch (err) {
    console.error('Error fetching customer inventory:', err);
    res.status(500).json({ error: 'Failed to retrieve inventory' });
  }
});

// Update threshold for low stock alert
router.patch('/inventory/:productId/threshold', async (req, res) => {
  const customerId = req.user.customerId;
  const productId = req.params.productId;
  const { threshold } = req.body;

  if (threshold === undefined || isNaN(threshold) || threshold < 0) {
    return res.status(400).json({ error: 'Threshold must be a non-negative number.' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE customer_inventory
       SET alert_threshold = ?
       WHERE customer_id = ? AND product_id = ?`,
      [threshold, customerId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found in your inventory' });
    }

    res.json({ message: 'Alert threshold updated successfully', threshold });
  } catch (err) {
    console.error('Error updating threshold:', err);
    res.status(500).json({ error: 'Failed to update threshold' });
  }
});

// Record customer usage / sale of inventory (calls stored procedure)
router.post('/inventory/:productId/use', async (req, res) => {
  const customerId = req.user.customerId;
  const productId = req.params.productId;
  const { quantity, notes } = req.body;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Usage quantity must be a positive number.' });
  }

  try {
    // Calling sp_record_usage checks stock, updates inventory, and creates movements
    // Trigger trg_customer_inventory_after_update will fire if stock drops below threshold!
    const [procResult] = await pool.query(
      'CALL sp_record_usage(?, ?, ?, ?)',
      [customerId, productId, quantity, notes || 'Direct retail sale / consumption']
    );

    res.json({
      message: `Recorded usage of ${quantity} units successfully.`,
      updatedStock: procResult[0] && procResult[0][0] ? procResult[0][0].quantity_on_hand : null
    });
  } catch (err) {
    console.error('Error in sp_record_usage:', err);
    if (err.sqlState === '45000' || err.sqlMessage) {
      return res.status(400).json({ error: err.sqlMessage || err.message });
    }
    res.status(500).json({ error: 'Failed to record inventory usage' });
  }
});

// ---------------------------------------------------------------------
// 5. IN-APP ALERTS (Polled by frontend)
// ---------------------------------------------------------------------
router.get('/alerts', async (req, res) => {
  const customerId = req.user.customerId;
  try {
    const [alerts] = await pool.query(
      `SELECT a.alert_id, a.alert_type, a.message, a.is_read, a.created_at,
              p.name AS product_name, p.sku
       FROM alert a
       LEFT JOIN product p ON a.product_id = p.product_id
       WHERE a.customer_id = ?
       ORDER BY a.is_read ASC, a.created_at DESC`,
      [customerId]
    );

    const unreadCount = alerts.filter(a => !a.is_read).length;

    res.json({
      unreadCount,
      alerts
    });
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

router.patch('/alerts/:id/read', async (req, res) => {
  const customerId = req.user.customerId;
  const alertId = req.params.id;

  try {
    await pool.query(
      `UPDATE alert SET is_read = TRUE WHERE alert_id = ? AND customer_id = ?`,
      [alertId, customerId]
    );
    res.json({ message: 'Alert marked as read' });
  } catch (err) {
    console.error('Error updating alert:', err);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

router.post('/alerts/mark-all-read', async (req, res) => {
  const customerId = req.user.customerId;
  try {
    await pool.query(
      `UPDATE alert SET is_read = TRUE WHERE customer_id = ?`,
      [customerId]
    );
    res.json({ message: 'All alerts marked as read' });
  } catch (err) {
    console.error('Error marking all alerts read:', err);
    res.status(500).json({ error: 'Failed to update alerts' });
  }
});

// ---------------------------------------------------------------------
// 6. RETAILER PROFILE MANAGEMENT
// ---------------------------------------------------------------------
router.get('/profile', async (req, res) => {
  const customerId = req.user.customerId;
  try {
    const [rows] = await pool.query(
      `SELECT customer_id, company_name, contact_name, email, phone, shipping_address, credit_limit, balance, created_at
       FROM customer
       WHERE customer_id = ?`,
      [customerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Retailer profile not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching retailer profile:', err);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

router.put('/profile', async (req, res) => {
  const customerId = req.user.customerId;
  const { company_name, contact_name, email, phone, shipping_address } = req.body;

  if (!company_name || !contact_name || !shipping_address) {
    return res.status(400).json({ error: 'Shop name, contact name, and shipping address are required.' });
  }

  try {
    await pool.query(
      `UPDATE customer
       SET company_name = ?,
           contact_name = ?,
           email = COALESCE(?, email),
           phone = ?,
           shipping_address = ?
       WHERE customer_id = ?`,
      [company_name, contact_name, email || null, phone || null, shipping_address, customerId]
    );

    const [updatedRows] = await pool.query(
      `SELECT customer_id, company_name, contact_name, email, phone, shipping_address, credit_limit, balance, created_at
       FROM customer
       WHERE customer_id = ?`,
      [customerId]
    );

    res.json({
      message: 'Retailer profile updated successfully',
      profile: updatedRows[0]
    });
  } catch (err) {
    console.error('Error updating retailer profile:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Shop name or email already in use by another business.' });
    }
    res.status(500).json({ error: err.sqlMessage || 'Failed to update profile' });
  }
});

module.exports = router;

