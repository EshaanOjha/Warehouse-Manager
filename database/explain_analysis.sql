-- =====================================================================
-- RDBMS COURSE PROJECT: INDEX OPTIMIZATION & EXPLAIN ANALYSIS
-- Course: CSC2103 - Relational Database Management Systems
-- =====================================================================

USE wholesale_db;

-- ---------------------------------------------------------------------
-- 1. DEMONSTRATION QUERY: Low-Stock Products with Tiered Pricing Lookup
-- ---------------------------------------------------------------------
-- This query searches for low-stock products within a category and checks
-- the highest available bulk discount tier for order fulfillment planning.

-- Turn on query profile timing
SET profiling = 1;

-- EXPLAIN ANALYZE provides actual execution cost, row estimates, and execution time:
EXPLAIN ANALYZE
SELECT 
    p.product_id,
    p.sku,
    p.name,
    p.stock_qty,
    p.reorder_threshold,
    pt.min_qty,
    pt.unit_price,
    pt.discount_pct
FROM product p
JOIN price_tier pt ON p.product_id = pt.product_id
WHERE p.stock_qty <= 30
  AND pt.min_qty >= 20;

-- ---------------------------------------------------------------------
-- 2. EXPLAIN FORMAT=TREE for Visualizing Plan Tree
-- ---------------------------------------------------------------------
EXPLAIN FORMAT=TREE
SELECT 
    p.product_id,
    p.sku,
    p.name,
    p.stock_qty,
    p.reorder_threshold,
    pt.min_qty,
    pt.unit_price,
    pt.discount_pct
FROM product p
JOIN price_tier pt ON p.product_id = pt.product_id
WHERE p.stock_qty <= 30
  AND pt.min_qty >= 20;

-- ---------------------------------------------------------------------
-- 3. DEMONSTRATION 2: Sales Order Aggregation by Customer with Status Filter
-- ---------------------------------------------------------------------
-- Tests the composite index `idx_sales_order_customer` (customer_id, order_date)
EXPLAIN
SELECT 
    so.customer_id,
    c.company_name,
    COUNT(so.order_id) AS order_count,
    SUM(so.total_amount) AS customer_spend
FROM sales_order so
JOIN customer c ON so.customer_id = c.customer_id
WHERE so.status != 'CANCELLED'
GROUP BY so.customer_id, c.company_name;

SHOW PROFILES;
