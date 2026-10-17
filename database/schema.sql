-- =====================================================================
-- WHOLESALE MANAGEMENT SYSTEM - RDBMS SCHEMA
-- Database: MySQL 8.0+
-- Course: CSC2103 - Relational Database Management Systems
-- =====================================================================

DROP DATABASE IF EXISTS wholesale_db;
CREATE DATABASE wholesale_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wholesale_db;

-- =====================================================================
-- 1. DDL: CORE ENTITIES & RELATIONAL SCHEMA
-- =====================================================================

-- Table 1: category
CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 2: supplier
CREATE TABLE supplier (
    supplier_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    contact_name VARCHAR(100),
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(30),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 3: customer (businesses that buy wholesale and resell)
CREATE TABLE customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL UNIQUE,
    contact_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(30),
    shipping_address TEXT NOT NULL,
    credit_limit DECIMAL(12,2) NOT NULL DEFAULT 50000.00 CHECK (credit_limit >= 0),
    balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Table 4: app_user (Authentication & Authorization: admin vs customer)
CREATE TABLE app_user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'customer') NOT NULL DEFAULT 'customer',
    customer_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_customer FOREIGN KEY (customer_id) 
        REFERENCES customer(customer_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table 5: product (Central warehouse inventory)
CREATE TABLE product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(30) NOT NULL DEFAULT 'unit',
    min_order_qty INT NOT NULL DEFAULT 5 CHECK (min_order_qty > 0),
    stock_qty INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    reorder_threshold INT NOT NULL DEFAULT 20 CHECK (reorder_threshold >= 0),
    base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_category FOREIGN KEY (category_id) 
        REFERENCES category(category_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Table 6: price_tier (Tiered bulk discounts for wholesale customers)
CREATE TABLE price_tier (
    tier_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    min_qty INT NOT NULL CHECK (min_qty > 0),
    max_qty INT NULL,
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    discount_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (discount_pct >= 0 AND discount_pct <= 100),
    CONSTRAINT chk_price_tier_range CHECK (max_qty IS NULL OR max_qty >= min_qty),
    CONSTRAINT fk_price_tier_product FOREIGN KEY (product_id) 
        REFERENCES product(product_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 7: product_supplier (M:N Relationship between Products and Suppliers)
CREATE TABLE product_supplier (
    product_id INT NOT NULL,
    supplier_id INT NOT NULL,
    supplier_sku VARCHAR(50),
    supply_price DECIMAL(10,2) NOT NULL CHECK (supply_price >= 0),
    lead_time_days INT NOT NULL DEFAULT 3 CHECK (lead_time_days >= 0),
    is_preferred BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (product_id, supplier_id),
    CONSTRAINT fk_ps_product FOREIGN KEY (product_id) 
        REFERENCES product(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_ps_supplier FOREIGN KEY (supplier_id) 
        REFERENCES supplier(supplier_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Table 8: purchase_order (Admin restocks warehouse from suppliers)
CREATE TABLE purchase_order (
    po_id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('DRAFT', 'ORDERED', 'RECEIVED', 'CANCELLED') NOT NULL DEFAULT 'ORDERED',
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    received_date TIMESTAMP NULL,
    notes TEXT,
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) 
        REFERENCES supplier(supplier_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Table 9: purchase_order_item
CREATE TABLE purchase_order_item (
    po_item_id INT AUTO_INCREMENT PRIMARY KEY,
    po_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_cost DECIMAL(10,2) NOT NULL CHECK (unit_cost >= 0),
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    CONSTRAINT fk_poi_po FOREIGN KEY (po_id) 
        REFERENCES purchase_order(po_id) ON DELETE CASCADE,
    CONSTRAINT fk_poi_product FOREIGN KEY (product_id) 
        REFERENCES product(product_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Table 10: sales_order (Customer places bulk order)
CREATE TABLE sales_order (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    shipping_address TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_so_customer FOREIGN KEY (customer_id) 
        REFERENCES customer(customer_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Table 11: sales_order_item
CREATE TABLE sales_order_item (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    subtotal DECIMAL(12,2) NOT NULL CHECK (subtotal >= 0),
    CONSTRAINT fk_soi_order FOREIGN KEY (order_id) 
        REFERENCES sales_order(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_soi_product FOREIGN KEY (product_id) 
        REFERENCES product(product_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Table 12: invoice (1:1 with sales_order)
CREATE TABLE invoice (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    invoice_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    status ENUM('UNPAID', 'PAID', 'OVERDUE') NOT NULL DEFAULT 'UNPAID',
    paid_date TIMESTAMP NULL,
    CONSTRAINT fk_inv_order FOREIGN KEY (order_id) 
        REFERENCES sales_order(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_inv_customer FOREIGN KEY (customer_id) 
        REFERENCES customer(customer_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Table 13: customer_inventory (Each customer tracks stock at their own store/shop)
CREATE TABLE customer_inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity_on_hand INT NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    alert_threshold INT NOT NULL DEFAULT 10 CHECK (alert_threshold >= 0),
    last_restocked_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_customer_product UNIQUE (customer_id, product_id),
    CONSTRAINT fk_ci_customer FOREIGN KEY (customer_id) 
        REFERENCES customer(customer_id) ON DELETE CASCADE,
    CONSTRAINT fk_ci_product FOREIGN KEY (product_id) 
        REFERENCES product(product_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Table 14: customer_stock_movement (Ledger of additions and usage entries by customer)
CREATE TABLE customer_stock_movement (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NOT NULL,
    movement_type ENUM('RESTOCK', 'USAGE', 'ADJUSTMENT') NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    reference_order_id INT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_csm_customer FOREIGN KEY (customer_id) 
        REFERENCES customer(customer_id) ON DELETE CASCADE,
    CONSTRAINT fk_csm_product FOREIGN KEY (product_id) 
        REFERENCES product(product_id) ON DELETE RESTRICT,
    CONSTRAINT fk_csm_order FOREIGN KEY (reference_order_id) 
        REFERENCES sales_order(order_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Table 15: warehouse_stock_movement (Ledger of warehouse inventory audit)
CREATE TABLE warehouse_stock_movement (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    movement_type ENUM('IN_PURCHASE', 'OUT_SALE', 'RETURN_CANCEL', 'ADJUSTMENT') NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    reference_id INT NULL,
    notes VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wsm_product FOREIGN KEY (product_id) 
        REFERENCES product(product_id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Table 16: alert (In-app notifications for low stock, order status, etc.)
CREATE TABLE alert (
    alert_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    product_id INT NULL,
    alert_type ENUM('LOW_STOCK', 'OVERDUE_INVOICE', 'ORDER_STATUS', 'GENERAL') NOT NULL DEFAULT 'LOW_STOCK',
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alert_customer FOREIGN KEY (customer_id) 
        REFERENCES customer(customer_id) ON DELETE CASCADE,
    CONSTRAINT fk_alert_product FOREIGN KEY (product_id) 
        REFERENCES product(product_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- =====================================================================
-- 2. INDEXES (B-Tree Indexes for Performance & EXPLAIN Demonstration)
-- =====================================================================

CREATE INDEX idx_product_category ON product(category_id);
CREATE INDEX idx_product_sku ON product(sku);
CREATE INDEX idx_product_stock ON product(stock_qty);
CREATE INDEX idx_price_tier_lookup ON price_tier(product_id, min_qty, max_qty);
CREATE INDEX idx_sales_order_customer ON sales_order(customer_id, order_date);
CREATE INDEX idx_sales_order_status ON sales_order(status);
CREATE INDEX idx_sales_order_item_order ON sales_order_item(order_id);
CREATE INDEX idx_sales_order_item_product ON sales_order_item(product_id);
CREATE INDEX idx_invoice_customer_status ON invoice(customer_id, status);
CREATE INDEX idx_customer_inventory_cust_prod ON customer_inventory(customer_id, product_id);
CREATE INDEX idx_alert_customer_unread ON alert(customer_id, is_read);
CREATE INDEX idx_product_supplier_supp_price ON product_supplier(product_id, supply_price);

-- =====================================================================
-- 3. STORED FUNCTION: fn_unit_price (Tiered Bulk Pricing Engine)
-- =====================================================================

DELIMITER //

CREATE FUNCTION fn_unit_price(p_product_id INT, p_qty INT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_unit_price DECIMAL(10,2);
    
    -- Check if tiered volume pricing matches requested quantity
    SELECT unit_price INTO v_unit_price
    FROM price_tier
    WHERE product_id = p_product_id
      AND p_qty >= min_qty
      AND (max_qty IS NULL OR p_qty <= max_qty)
    ORDER BY min_qty DESC
    LIMIT 1;
    
    -- Default to base_price if no tier matched
    IF v_unit_price IS NULL THEN
        SELECT base_price INTO v_unit_price
        FROM product
        WHERE product_id = p_product_id;
    END IF;
    
    RETURN COALESCE(v_unit_price, 0.00);
END //

DELIMITER ;

-- =====================================================================
-- 4. TRIGGERS
-- =====================================================================

DELIMITER //

-- Trigger 1: Validate stock & min order quantity, set unit_price and subtotal
CREATE TRIGGER trg_sales_order_item_before_insert
BEFORE INSERT ON sales_order_item
FOR EACH ROW
BEGIN
    DECLARE v_min_qty INT;
    DECLARE v_stock INT;
    DECLARE v_calc_price DECIMAL(10,2);

    SELECT min_order_qty, stock_qty INTO v_min_qty, v_stock
    FROM product
    WHERE product_id = NEW.product_id;

    IF v_min_qty IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid product ID specified in order item.';
    END IF;

    IF NEW.quantity < v_min_qty THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Order item quantity is less than minimum order quantity.';
    END IF;

    IF NEW.quantity > v_stock THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient warehouse stock for the requested product.';
    END IF;

    -- Automatically compute unit price via function if not explicitly supplied
    IF NEW.unit_price IS NULL OR NEW.unit_price <= 0 THEN
        SET v_calc_price = fn_unit_price(NEW.product_id, NEW.quantity);
        SET NEW.unit_price = v_calc_price;
    END IF;

    SET NEW.subtotal = ROUND(NEW.quantity * NEW.unit_price, 2);
END //

-- Trigger 2: Deduct warehouse stock immediately upon item insertion
CREATE TRIGGER trg_sales_order_item_after_insert
AFTER INSERT ON sales_order_item
FOR EACH ROW
BEGIN
    UPDATE product
    SET stock_qty = stock_qty - NEW.quantity
    WHERE product_id = NEW.product_id;

    INSERT INTO warehouse_stock_movement (product_id, movement_type, quantity, reference_id, notes)
    VALUES (NEW.product_id, 'OUT_SALE', NEW.quantity, NEW.order_id, 'Stock reserved for sales order');
END //

-- Trigger 3: Handle Sales Order Status transitions (DELIVERED -> customer stock; CANCELLED -> warehouse return)
CREATE TRIGGER trg_sales_order_after_update
AFTER UPDATE ON sales_order
FOR EACH ROW
BEGIN
    -- Case A: Delivered to customer -> automatically stock customer inventory
    IF NEW.status = 'DELIVERED' AND OLD.status != 'DELIVERED' THEN
        -- Upsert customer inventory for each item in the delivered order
        INSERT INTO customer_inventory (customer_id, product_id, quantity_on_hand, alert_threshold, last_restocked_at)
        SELECT 
            NEW.customer_id,
            soi.product_id,
            soi.quantity,
            10,
            NOW()
        FROM sales_order_item soi
        WHERE soi.order_id = NEW.order_id
        ON DUPLICATE KEY UPDATE
            quantity_on_hand = quantity_on_hand + VALUES(quantity_on_hand),
            last_restocked_at = NOW();

        -- Record customer restock movements
        INSERT INTO customer_stock_movement (customer_id, product_id, movement_type, quantity, reference_order_id, notes)
        SELECT 
            NEW.customer_id,
            soi.product_id,
            'RESTOCK',
            soi.quantity,
            NEW.order_id,
            CONCAT('Order #', NEW.order_id, ' delivered')
        FROM sales_order_item soi
        WHERE soi.order_id = NEW.order_id;
    END IF;

    -- Case B: Order Cancelled -> restore warehouse stock
    IF NEW.status = 'CANCELLED' AND OLD.status IN ('CONFIRMED', 'SHIPPED') THEN
        UPDATE product p
        JOIN sales_order_item soi ON p.product_id = soi.product_id
        SET p.stock_qty = p.stock_qty + soi.quantity
        WHERE soi.order_id = NEW.order_id;

        INSERT INTO warehouse_stock_movement (product_id, movement_type, quantity, reference_id, notes)
        SELECT 
            soi.product_id,
            'RETURN_CANCEL',
            soi.quantity,
            NEW.order_id,
            CONCAT('Order #', NEW.order_id, ' cancelled - stock returned to warehouse')
        FROM sales_order_item soi
        WHERE soi.order_id = NEW.order_id;
    END IF;
END //

-- Trigger 4: Automatic Low Stock Alert for Customer Inventory
CREATE TRIGGER trg_customer_inventory_after_update
AFTER UPDATE ON customer_inventory
FOR EACH ROW
BEGIN
    DECLARE v_prod_name VARCHAR(150);
    DECLARE v_existing_unread INT DEFAULT 0;

    IF NEW.quantity_on_hand <= NEW.alert_threshold THEN
        -- Check if unread alert already exists to prevent spam
        SELECT COUNT(*) INTO v_existing_unread
        FROM alert
        WHERE customer_id = NEW.customer_id
          AND product_id = NEW.product_id
          AND alert_type = 'LOW_STOCK'
          AND is_read = FALSE;

        IF v_existing_unread = 0 THEN
            SELECT name INTO v_prod_name FROM product WHERE product_id = NEW.product_id;
            INSERT INTO alert (customer_id, product_id, alert_type, message)
            VALUES (
                NEW.customer_id,
                NEW.product_id,
                'LOW_STOCK',
                CONCAT('Low stock warning: Product "', COALESCE(v_prod_name, 'Unknown'), '" has only ', NEW.quantity_on_hand, ' units left (Threshold: ', NEW.alert_threshold, '). Consider reordering!')
            );
        END IF;
    END IF;
END //

-- Trigger 5: Purchase order item calculation
CREATE TRIGGER trg_poi_before_insert
BEFORE INSERT ON purchase_order_item
FOR EACH ROW
BEGIN
    SET NEW.subtotal = ROUND(NEW.quantity * NEW.unit_cost, 2);
END //

-- Trigger 6: PO status update -> Add stock when RECEIVED
CREATE TRIGGER trg_po_after_update
AFTER UPDATE ON purchase_order
FOR EACH ROW
BEGIN
    IF NEW.status = 'RECEIVED' AND OLD.status != 'RECEIVED' THEN
        -- Increase warehouse stock
        UPDATE product p
        JOIN purchase_order_item poi ON p.product_id = poi.product_id
        SET p.stock_qty = p.stock_qty + poi.quantity
        WHERE poi.po_id = NEW.po_id;

        -- Record movement
        INSERT INTO warehouse_stock_movement (product_id, movement_type, quantity, reference_id, notes)
        SELECT 
            poi.product_id,
            'IN_PURCHASE',
            poi.quantity,
            NEW.po_id,
            CONCAT('Purchase Order #', NEW.po_id, ' received')
        FROM purchase_order_item poi
        WHERE poi.po_id = NEW.po_id;
    END IF;
END //

DELIMITER ;

-- =====================================================================
-- 5. STORED PROCEDURES
-- =====================================================================

DELIMITER //

-- Procedure 1: Finalize order, calculate taxes, create invoice
CREATE PROCEDURE sp_finalize_order(IN p_order_id INT)
BEGIN
    DECLARE v_subtotal DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_tax DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_total DECIMAL(12,2) DEFAULT 0.00;
    DECLARE v_cust_id INT;
    DECLARE v_invoice_no VARCHAR(50);

    -- Calculate sum of items
    SELECT COALESCE(SUM(subtotal), 0.00) INTO v_subtotal
    FROM sales_order_item
    WHERE order_id = p_order_id;

    -- Apply 5% wholesale sales tax
    SET v_tax = ROUND(v_subtotal * 0.05, 2);
    SET v_total = v_subtotal + v_tax;

    SELECT customer_id INTO v_cust_id
    FROM sales_order
    WHERE order_id = p_order_id;

    -- Update sales_order totals
    UPDATE sales_order
    SET subtotal = v_subtotal,
        tax_amount = v_tax,
        total_amount = v_total,
        status = 'CONFIRMED'
    WHERE order_id = p_order_id;

    -- Generate unique invoice number
    SET v_invoice_no = CONCAT('INV-', YEAR(CURDATE()), '-', LPAD(p_order_id, 5, '0'));

    -- Create corresponding invoice record (1:1 with order)
    INSERT INTO invoice (order_id, customer_id, invoice_number, invoice_date, due_date, total_amount, status)
    VALUES (
        p_order_id,
        v_cust_id,
        v_invoice_no,
        NOW(),
        DATE_ADD(CURDATE(), INTERVAL 30 DAY),
        v_total,
        'UNPAID'
    )
    ON DUPLICATE KEY UPDATE
        total_amount = v_total;

    SELECT p_order_id AS order_id, v_total AS total_amount, v_invoice_no AS invoice_number;
END //

-- Procedure 2: Customer records internal stock usage/sale
CREATE PROCEDURE sp_record_usage(
    IN p_customer_id INT,
    IN p_product_id INT,
    IN p_qty INT,
    IN p_notes VARCHAR(255)
)
BEGIN
    DECLARE v_current_qty INT;

    IF p_qty <= 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Usage quantity must be greater than zero.';
    END IF;

    -- Check customer stock
    SELECT quantity_on_hand INTO v_current_qty
    FROM customer_inventory
    WHERE customer_id = p_customer_id AND product_id = p_product_id;

    IF v_current_qty IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Product not found in your inventory.';
    END IF;

    IF v_current_qty < p_qty THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient stock on hand in your inventory.';
    END IF;

    -- Decrement stock
    UPDATE customer_inventory
    SET quantity_on_hand = quantity_on_hand - p_qty
    WHERE customer_id = p_customer_id AND product_id = p_product_id;

    -- Record movement audit
    INSERT INTO customer_stock_movement (customer_id, product_id, movement_type, quantity, notes)
    VALUES (p_customer_id, p_product_id, 'USAGE', p_qty, p_notes);

    SELECT 
        customer_id, 
        product_id, 
        quantity_on_hand,
        alert_threshold
    FROM customer_inventory
    WHERE customer_id = p_customer_id AND product_id = p_product_id;
END //

DELIMITER ;

-- =====================================================================
-- 6. VIEWS (Complex joins, aggregations, reporting)
-- =====================================================================

-- View 1: Customer orders summary
CREATE OR REPLACE VIEW v_customer_orders AS
SELECT 
    so.order_id,
    so.customer_id,
    c.company_name,
    so.order_date,
    so.status,
    so.subtotal,
    so.tax_amount,
    so.total_amount,
    COUNT(soi.item_id) AS total_items,
    COALESCE(SUM(soi.quantity), 0) AS total_units,
    inv.invoice_number,
    inv.status AS invoice_status
FROM sales_order so
JOIN customer c ON so.customer_id = c.customer_id
LEFT JOIN sales_order_item soi ON so.order_id = soi.order_id
LEFT JOIN invoice inv ON so.order_id = inv.order_id
GROUP BY so.order_id, so.customer_id, c.company_name, so.order_date, so.status, 
         so.subtotal, so.tax_amount, so.total_amount, inv.invoice_number, inv.status;

-- View 2: Customer receipts & invoices
CREATE OR REPLACE VIEW v_customer_receipts AS
SELECT 
    inv.invoice_id,
    inv.invoice_number,
    inv.order_id,
    inv.customer_id,
    c.company_name,
    c.email AS customer_email,
    inv.invoice_date,
    inv.due_date,
    inv.total_amount,
    inv.status AS payment_status,
    inv.paid_date,
    so.order_date,
    so.status AS order_status
FROM invoice inv
JOIN customer c ON inv.customer_id = c.customer_id
JOIN sales_order so ON inv.order_id = so.order_id;

-- View 3: Customer Inventory with Alert status
CREATE OR REPLACE VIEW v_customer_inventory AS
SELECT 
    ci.inventory_id,
    ci.customer_id,
    c.company_name,
    ci.product_id,
    p.name AS product_name,
    p.sku,
    cat.name AS category_name,
    p.unit_of_measure,
    ci.quantity_on_hand,
    ci.alert_threshold,
    (ci.quantity_on_hand <= ci.alert_threshold) AS is_low_stock,
    ci.last_restocked_at,
    ci.updated_at
FROM customer_inventory ci
JOIN customer c ON ci.customer_id = c.customer_id
JOIN product p ON ci.product_id = p.product_id
JOIN category cat ON p.category_id = cat.category_id;

-- View 4: Warehouse Low Stock with Cheapest Supplier
CREATE OR REPLACE VIEW v_warehouse_low_stock AS
SELECT 
    p.product_id,
    p.sku,
    p.name AS product_name,
    cat.name AS category_name,
    p.stock_qty,
    p.reorder_threshold,
    cheapest.supplier_id,
    cheapest.supplier_name,
    cheapest.min_supply_price,
    cheapest.lead_time_days
FROM product p
JOIN category cat ON p.category_id = cat.category_id
LEFT JOIN (
    SELECT 
        ps.product_id,
        s.supplier_id,
        s.name AS supplier_name,
        ps.supply_price AS min_supply_price,
        ps.lead_time_days
    FROM product_supplier ps
    JOIN supplier s ON ps.supplier_id = s.supplier_id
    WHERE (ps.product_id, ps.supply_price) IN (
        SELECT product_id, MIN(supply_price)
        FROM product_supplier
        GROUP BY product_id
    )
) cheapest ON p.product_id = cheapest.product_id
WHERE p.stock_qty <= p.reorder_threshold AND p.is_active = TRUE;

-- View 5: Supplier comparison across products
CREATE OR REPLACE VIEW v_supplier_comparison AS
SELECT 
    p.product_id,
    p.sku,
    p.name AS product_name,
    p.base_price AS warehouse_selling_price,
    s.supplier_id,
    s.name AS supplier_name,
    ps.supply_price,
    (p.base_price - ps.supply_price) AS unit_margin,
    ROUND(((p.base_price - ps.supply_price) / p.base_price) * 100, 2) AS margin_pct,
    ps.lead_time_days,
    ps.is_preferred
FROM product p
JOIN product_supplier ps ON p.product_id = ps.product_id
JOIN supplier s ON ps.supplier_id = s.supplier_id;

-- View 6: Top Selling Products
CREATE OR REPLACE VIEW v_top_products AS
SELECT 
    p.product_id,
    p.sku,
    p.name AS product_name,
    cat.name AS category_name,
    COALESCE(SUM(soi.quantity), 0) AS total_units_sold,
    COALESCE(SUM(soi.subtotal), 0.00) AS total_revenue_generated
FROM product p
JOIN category cat ON p.category_id = cat.category_id
LEFT JOIN sales_order_item soi ON p.product_id = soi.product_id
LEFT JOIN sales_order so ON soi.order_id = so.order_id AND so.status != 'CANCELLED'
GROUP BY p.product_id, p.sku, p.name, cat.name
ORDER BY total_revenue_generated DESC;

-- View 7: Monthly Sales Performance
CREATE OR REPLACE VIEW v_monthly_sales AS
SELECT 
    DATE_FORMAT(so.order_date, '%Y-%m') AS sales_month,
    COUNT(DISTINCT so.order_id) AS total_orders,
    COALESCE(SUM(so.subtotal), 0.00) AS gross_subtotal,
    COALESCE(SUM(so.tax_amount), 0.00) AS total_tax,
    COALESCE(SUM(so.total_amount), 0.00) AS total_revenue
FROM sales_order so
WHERE so.status != 'CANCELLED'
GROUP BY DATE_FORMAT(so.order_date, '%Y-%m')
ORDER BY sales_month DESC;

-- View 8: Unpaid and Overdue Invoices
CREATE OR REPLACE VIEW v_unpaid_invoices AS
SELECT 
    inv.invoice_id,
    inv.invoice_number,
    inv.order_id,
    c.customer_id,
    c.company_name,
    c.email,
    c.phone,
    inv.total_amount,
    inv.invoice_date,
    inv.due_date,
    DATEDIFF(CURDATE(), inv.due_date) AS days_overdue,
    CASE 
        WHEN DATEDIFF(CURDATE(), inv.due_date) > 0 THEN 'OVERDUE'
        ELSE 'CURRENT'
    END AS aging_category
FROM invoice inv
JOIN customer c ON inv.customer_id = c.customer_id
WHERE inv.status = 'UNPAID'
ORDER BY days_overdue DESC;
