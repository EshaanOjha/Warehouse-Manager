const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// All admin routes require admin role & verified token
router.use(verifyToken, requireRole('admin'));

// ---------------------------------------------------------------------
// 1. DASHBOARD OVERVIEW METRICS
// ---------------------------------------------------------------------
router.get('/dashboard', async (req, res) => {
  try {
    const [lowStock] = await pool.query(
      `SELECT COUNT(*) AS low_stock_count FROM product WHERE stock_qty <= reorder_threshold AND is_active = TRUE`
    );

    const [unpaid] = await pool.query(
      `SELECT COUNT(*) AS unpaid_count, COALESCE(SUM(total_amount), 0.00) AS unpaid_total 
       FROM invoice WHERE status = 'UNPAID'`
    );

    const [ordersCount] = await pool.query(
      `SELECT 
         COUNT(*) AS total_orders,
         SUM(CASE WHEN status IN ('PENDING', 'CONFIRMED') THEN 1 ELSE 0 END) AS pending_orders
       FROM sales_order`
    );

    const [revenue] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0.00) AS total_revenue 
       FROM sales_order WHERE status != 'CANCELLED'`
    );

    const [recentOrders] = await pool.query(
      `SELECT * FROM v_customer_orders ORDER BY order_date DESC LIMIT 6`
    );

    res.json({
      lowStockCount: lowStock[0].low_stock_count,
      unpaidInvoicesCount: unpaid[0].unpaid_count,
      unpaidInvoicesTotal: unpaid[0].unpaid_total,
      totalOrders: ordersCount[0].total_orders,
      pendingOrders: ordersCount[0].pending_orders,
      totalRevenue: revenue[0].total_revenue,
      recentOrders
    });
  } catch (err) {
    console.error('Error in dashboard metrics:', err);
    res.status(500).json({ error: 'Failed to retrieve dashboard metrics' });
  }
});

// ---------------------------------------------------------------------
// 2. PRODUCT & PRICE TIERS CRUD
// ---------------------------------------------------------------------
router.get('/products', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT 
        p.*,
        c.name AS category_name,
        (p.stock_qty <= p.reorder_threshold) AS is_low_stock
      FROM product p
      JOIN category c ON p.category_id = c.category_id
      ORDER BY p.product_id ASC
    `);

    const [tiers] = await pool.query(`SELECT * FROM price_tier ORDER BY product_id, min_qty ASC`);

    const enriched = products.map(p => ({
      ...p,
      tiers: tiers.filter(t => t.product_id === p.product_id)
    }));

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/products', async (req, res) => {
  const { category_id, sku, name, description, unit_of_measure, min_order_qty, stock_qty, reorder_threshold, base_price } = req.body;

  if (!category_id || !sku || !name || base_price === undefined) {
    return res.status(400).json({ error: 'category_id, sku, name, and base_price are required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO product (category_id, sku, name, description, unit_of_measure, min_order_qty, stock_qty, reorder_threshold, base_price)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [category_id, sku, name, description || '', unit_of_measure || 'unit', min_order_qty || 5, stock_qty || 0, reorder_threshold || 10, base_price]
    );

    res.status(201).json({ message: 'Product created successfully', productId: result.insertId });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  const productId = req.params.id;
  const { category_id, sku, name, description, unit_of_measure, min_order_qty, stock_qty, reorder_threshold, base_price, is_active } = req.body;

  try {
    await pool.query(
      `UPDATE product
       SET category_id = COALESCE(?, category_id),
           sku = COALESCE(?, sku),
           name = COALESCE(?, name),
           description = COALESCE(?, description),
           unit_of_measure = COALESCE(?, unit_of_measure),
           min_order_qty = COALESCE(?, min_order_qty),
           stock_qty = COALESCE(?, stock_qty),
           reorder_threshold = COALESCE(?, reorder_threshold),
           base_price = COALESCE(?, base_price),
           is_active = COALESCE(?, is_active)
       WHERE product_id = ?`,
      [category_id, sku, name, description, unit_of_measure, min_order_qty, stock_qty, reorder_threshold, base_price, is_active, productId]
    );

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  const productId = req.params.id;
  try {
    // Soft-deactivate product to preserve referential integrity of orders
    await pool.query('UPDATE product SET is_active = FALSE WHERE product_id = ?', [productId]);
    res.json({ message: 'Product deactivated successfully' });
  } catch (err) {
    console.error('Error deactivating product:', err);
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
});

// Price tiers for a product
router.post('/products/:id/tiers', async (req, res) => {
  const productId = req.params.id;
  const { min_qty, max_qty, unit_price, discount_pct } = req.body;

  if (!min_qty || unit_price === undefined) {
    return res.status(400).json({ error: 'min_qty and unit_price are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO price_tier (product_id, min_qty, max_qty, unit_price, discount_pct)
       VALUES (?, ?, ?, ?, ?)`,
      [productId, min_qty, max_qty || null, unit_price, discount_pct || 0.00]
    );

    res.status(201).json({ message: 'Price tier added', tierId: result.insertId });
  } catch (err) {
    console.error('Error adding price tier:', err);
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
});

router.delete('/tiers/:tierId', async (req, res) => {
  const tierId = req.params.tierId;
  try {
    await pool.query('DELETE FROM price_tier WHERE tier_id = ?', [tierId]);
    res.json({ message: 'Price tier deleted' });
  } catch (err) {
    console.error('Error deleting tier:', err);
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
});

// ---------------------------------------------------------------------
// 3. CATEGORIES
// ---------------------------------------------------------------------
router.get('/categories', async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM category ORDER BY name ASC');
    res.json(categories);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

router.post('/categories', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Category name is required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO category (name, description) VALUES (?, ?)',
      [name, description || '']
    );
    res.status(201).json({ message: 'Category created', categoryId: result.insertId });
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
});

// ---------------------------------------------------------------------
// 4. SUPPLIERS & PRODUCT SUPPLIERS
// ---------------------------------------------------------------------
router.get('/suppliers', async (req, res) => {
  try {
    const [suppliers] = await pool.query('SELECT * FROM supplier ORDER BY name ASC');
    res.json(suppliers);
  } catch (err) {
    console.error('Error fetching suppliers:', err);
    res.status(500).json({ error: 'Failed to retrieve suppliers' });
  }
});

router.post('/suppliers', async (req, res) => {
  const { name, contact_name, email, phone, address } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Supplier name and email are required' });

  try {
    const [result] = await pool.query(
      'INSERT INTO supplier (name, contact_name, email, phone, address) VALUES (?, ?, ?, ?, ?)',
      [name, contact_name, email, phone, address]
    );
    res.status(201).json({ message: 'Supplier registered', supplierId: result.insertId });
  } catch (err) {
    console.error('Error registering supplier:', err);
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
});

router.post('/product-suppliers', async (req, res) => {
  const { product_id, supplier_id, supplier_sku, supply_price, lead_time_days, is_preferred } = req.body;
  if (!product_id || !supplier_id || supply_price === undefined) {
    return res.status(400).json({ error: 'product_id, supplier_id, and supply_price are required' });
  }

  try {
    await pool.query(
      `INSERT INTO product_supplier (product_id, supplier_id, supplier_sku, supply_price, lead_time_days, is_preferred)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         supplier_sku = VALUES(supplier_sku),
         supply_price = VALUES(supply_price),
         lead_time_days = VALUES(lead_time_days),
         is_preferred = VALUES(is_preferred)`,
      [product_id, supplier_id, supplier_sku || null, supply_price, lead_time_days || 3, is_preferred || false]
    );

    res.json({ message: 'Supplier pricing mapped successfully' });
  } catch (err) {
    console.error('Error saving product supplier:', err);
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
});

// ---------------------------------------------------------------------
// 5. CUSTOMER SALES ORDERS & LIFECYCLE MANAGEMENT
// ---------------------------------------------------------------------
router.get('/orders', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT * FROM v_customer_orders ORDER BY order_date DESC');
    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: 'Failed to retrieve sales orders' });
  }
});

router.get('/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  try {
    const [orderRows] = await pool.query(
      'SELECT * FROM v_customer_orders WHERE order_id = ?',
      [orderId]
    );

    if (orderRows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const [items] = await pool.query(
      `SELECT soi.*, p.name AS product_name, p.sku, p.unit_of_measure
       FROM sales_order_item soi
       JOIN product p ON soi.product_id = p.product_id
       WHERE soi.order_id = ?`,
      [orderId]
    );

    res.json({ ...orderRows[0], items });
  } catch (err) {
    console.error('Error fetching order details:', err);
    res.status(500).json({ error: 'Failed to retrieve order details' });
  }
});

// Update order status: 'CONFIRMED' -> 'SHIPPED' -> 'DELIVERED', or 'CANCELLED'
// Triggers automatically handle inventory restock on delivery and restore warehouse stock on cancel!
router.patch('/orders/:id/status', async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  const validStatuses = ['CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const [result] = await pool.query(
      'UPDATE sales_order SET status = ? WHERE order_id = ?',
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ message: `Order status transitioned to ${status} successfully.` });
  } catch (err) {
    console.error('Error updating order status:', err);
    if (err.sqlState === '45000' || err.sqlMessage) {
      return res.status(400).json({ error: err.sqlMessage || err.message });
    }
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ---------------------------------------------------------------------
// 6. INVOICES & PAYMENTS
// ---------------------------------------------------------------------
router.get('/invoices', async (req, res) => {
  try {
    const [invoices] = await pool.query('SELECT * FROM v_customer_receipts ORDER BY invoice_date DESC');
    res.json(invoices);
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({ error: 'Failed to retrieve invoices' });
  }
});

// Mark invoice as PAID
router.patch('/invoices/:id/paid', async (req, res) => {
  const invoiceId = req.params.id;

  try {
    const [result] = await pool.query(
      `UPDATE invoice 
       SET status = 'PAID', paid_date = NOW()
       WHERE invoice_id = ?`,
      [invoiceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ message: 'Invoice marked as PAID successfully.' });
  } catch (err) {
    console.error('Error updating invoice:', err);
    res.status(500).json({ error: 'Failed to update invoice payment status' });
  }
});

// ---------------------------------------------------------------------
// 7. WAREHOUSE LOW STOCK & PURCHASE ORDERS
// ---------------------------------------------------------------------
// Uses view with automatic cheapest supplier calculation
router.get('/low-stock', async (req, res) => {
  try {
    const [lowStock] = await pool.query('SELECT * FROM v_warehouse_low_stock');
    res.json(lowStock);
  } catch (err) {
    console.error('Error fetching low stock:', err);
    res.status(500).json({ error: 'Failed to retrieve low-stock products' });
  }
});

router.get('/purchase-orders', async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT 
        po.*,
        s.name AS supplier_name,
        COUNT(poi.po_item_id) AS total_items,
        COALESCE(SUM(poi.quantity), 0) AS total_units
      FROM purchase_order po
      JOIN supplier s ON po.supplier_id = s.supplier_id
      LEFT JOIN purchase_order_item poi ON po.po_id = poi.po_id
      GROUP BY po.po_id, s.name
      ORDER BY po.order_date DESC
    `);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching purchase orders:', err);
    res.status(500).json({ error: 'Failed to retrieve purchase orders' });
  }
});

router.post('/purchase-orders', async (req, res) => {
  const { supplier_id, notes, items } = req.body;

  if (!supplier_id || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'supplier_id and at least one item are required' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    let totalAmount = 0.00;

    const [poResult] = await connection.query(
      `INSERT INTO purchase_order (supplier_id, notes, status, total_amount)
       VALUES (?, ?, 'ORDERED', 0.00)`,
      [supplier_id, notes || null]
    );

    const poId = poResult.insertId;

    for (const item of items) {
      const { product_id, quantity, unit_cost } = item;
      const subtotal = Number((quantity * unit_cost).toFixed(2));
      totalAmount += subtotal;

      await connection.query(
        `INSERT INTO purchase_order_item (po_id, product_id, quantity, unit_cost, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        [poId, product_id, quantity, unit_cost, subtotal]
      );
    }

    await connection.query(
      `UPDATE purchase_order SET total_amount = ? WHERE po_id = ?`,
      [totalAmount, poId]
    );

    await connection.commit();

    res.status(201).json({ message: 'Purchase order created successfully', poId, totalAmount });
  } catch (err) {
    await connection.rollback();
    console.error('Error creating PO:', err);
    res.status(400).json({ error: err.sqlMessage || err.message });
  } finally {
    connection.release();
  }
});

// Mark PO as RECEIVED -> trg_po_after_update automatically adds stock to warehouse!
router.patch('/purchase-orders/:id/receive', async (req, res) => {
  const poId = req.params.id;

  try {
    const [result] = await pool.query(
      `UPDATE purchase_order
       SET status = 'RECEIVED', received_date = NOW()
       WHERE po_id = ? AND status != 'RECEIVED'`,
      [poId]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Purchase order is already received or does not exist.' });
    }

    res.json({ message: 'Purchase order received. Warehouse inventory automatically updated via trigger.' });
  } catch (err) {
    console.error('Error receiving PO:', err);
    res.status(400).json({ error: err.sqlMessage || err.message });
  }
});

// ---------------------------------------------------------------------
// 8. ADVANCED ANALYTIC REPORTS
// ---------------------------------------------------------------------
router.get('/reports/top-products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_top_products');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching top products:', err);
    res.status(500).json({ error: 'Failed to retrieve top products report' });
  }
});

router.get('/reports/monthly-sales', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_monthly_sales');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching monthly sales:', err);
    res.status(500).json({ error: 'Failed to retrieve monthly sales report' });
  }
});

router.get('/reports/unpaid', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_unpaid_invoices');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching unpaid invoices report:', err);
    res.status(500).json({ error: 'Failed to retrieve unpaid invoices report' });
  }
});

router.get('/reports/supplier-comparison', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM v_supplier_comparison ORDER BY product_id, supply_price ASC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching supplier comparison report:', err);
    res.status(500).json({ error: 'Failed to retrieve supplier comparison report' });
  }
});

module.exports = router;
