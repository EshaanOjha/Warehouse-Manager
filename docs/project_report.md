# Wholesale Management System: Project Report & Demonstration Guide

**Course:** CSC2103 - Relational Database Management Systems  
**Institution:** Manipal University Jaipur, Department of Computer Science & Engineering  
**Tech Stack:** MySQL 8.0, Node.js + Express (mysql2, bcryptjs, jsonwebtoken), React 18 (Vite, Axios)  

---

## 1. System Architecture & Features

The Wholesale Management System is designed to demonstrate comprehensive RDBMS principles:
- **16 Relational Tables** mapped with primary keys, foreign key constraints (`ON DELETE CASCADE` / `SET NULL` / `RESTRICT`), `CHECK` constraints, `UNIQUE` constraints, and defaults.
- **Advanced Stored Function:** `fn_unit_price(product_id, qty)` implements dynamic tiered volume discounts.
- **Database Triggers:**
  - `trg_sales_order_item_before_insert`: Validates minimum order quantity and warehouse stock before allowing an order; computes unit prices and line totals.
  - `trg_sales_order_item_after_insert`: Automatically decrements warehouse stock and creates warehouse audit records.
  - `trg_sales_order_after_update`: Automatically populates customer store inventory upon order status changing to `DELIVERED`, and restores warehouse stock if an order is `CANCELLED`.
  - `trg_customer_inventory_after_update`: Triggers an in-app low stock alert for the customer when on-hand units fall to or below the configured threshold.
  - `trg_po_after_update`: Adds inventory to the central warehouse when purchase orders are marked `RECEIVED`.
- **Stored Procedures:**
  - `sp_finalize_order(order_id)`: Calculates order subtotal, 5% wholesale sales tax, total amount, sets order status to `CONFIRMED`, and creates an official `invoice`.
  - `sp_record_usage(customer_id, product_id, qty, notes)`: Validates customer stock, records usage movements, and executes stock decrements with rollback protection.
- **8 SQL Views:** Reporting views for orders, receipts, inventory, warehouse low stock with cheapest supplier, supplier margin comparison, top products, monthly sales, and unpaid invoices with overdue aging.
- **Indexing & EXPLAIN Analysis:** Demonstrates query cost reduction using B-Tree index scans.

---

## 2. Pre-Configured Demo Credentials

| Role | Username | Password | Notes |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Warehouse administrator (full access to catalogue, suppliers, orders, POs, reports) |
| **Customer 1** | `urban_grocers` | `password123` | Urban Corner Groceries (has pre-seeded low-stock alert) |
| **Customer 2** | `metro_mart` | `password123` | Metro Supermarket Chain (large reseller account) |
| **Customer 3** | `green_valley` | `password123` | Green Valley Organic Market |

---

## 3. Step-by-Step Viva / Demo Walkthrough Script

Follow these 6 steps to present the project to course evaluators:

### Step 1: Customer Bulk Ordering & Tiered Pricing
1. Open the web app at `http://localhost:3000`.
2. Click the quick button **Urban Grocers** and sign in.
3. Open **Catalogue & Cart**.
4. Choose **Premium Arabica Coffee Beans (1kg)**.
   - Enter **10 units**: observe price is **$18.50/unit**.
   - Change quantity to **25 units**: observe live tier price automatically drops to **$16.80/unit** (9.19% bulk discount).
   - Change quantity to **50 units**: observe tier price drops to **$15.20/unit** (17.84% bulk discount).
5. Add items to cart and click **Place Wholesale Order**.
6. The atomic transaction runs: `sales_order` and `sales_order_item` are inserted, `sp_finalize_order` executes, and warehouse stock is decremented immediately.
7. Navigate to **Receipts / Invoices** to inspect the generated tax invoice.

### Step 2: Trigger Validation & Oversell Prevention
1. In Catalogue, try ordering **9999 units** of any product (exceeding warehouse stock).
2. Click **Place Wholesale Order**.
3. **Database rejection demonstrated:** The trigger `trg_sales_order_item_before_insert` fires `SQLSTATE 45000` with the error message:
   `"Insufficient warehouse stock for the requested product."`
   The backend catches this and triggers `ROLLBACK`, guaranteeing zero orphan records.

### Step 3: Admin Fulfillment & Automated Customer Restock
1. Click **Logout** and sign in as **Admin** (`admin` / `admin123`).
2. Go to **Customer Orders**.
3. Find the confirmed order from Step 1. Click **Ship Order** (`SHIPPED`).
4. Click **Mark Delivered** (`DELIVERED`).
5. **Database trigger in action:** `trg_sales_order_after_update` automatically transfers the delivered items into `customer_inventory` for that customer and creates a `RESTOCK` movement ledger entry!

### Step 4: Customer Stock Usage & Automatic Low-Stock Alert
1. Sign back in as **Urban Grocers**.
2. Open **My Inventory**.
3. Locate the stocked product. Note the current stock on hand and the alert threshold (e.g., 10).
4. Click **Record Usage** and record a usage entry that lowers the stock on hand to or below the threshold.
5. **Database trigger in action:** `trg_customer_inventory_after_update` instantly inserts an alert into the `alert` table.
6. The in-app bell notification 🔔 immediately updates with an unread badge! Click the bell to view the warning message.

### Step 5: Warehouse Low Stock & Procurement from Cheapest Supplier
1. Sign back in as **Admin**.
2. Navigate to **Purchase Orders**.
3. View the **Warehouse Low-Stock Alerts** table (powered by `v_warehouse_low_stock`).
4. Note that for low-stock products, the SQL query automatically computes and displays the **cheapest supplier** and their lead time!
5. Click **Reorder Now** on any product: the PO form pre-populates the cheapest supplier and cost.
6. Submit the Purchase Order.
7. Click **Receive Stock**: `trg_po_after_update` automatically adds the units to warehouse `product.stock_qty`!

### Step 6: BI Reports & Unpaid Invoices
1. Open **Reports** in the Admin navbar.
2. Toggle between the 4 real-time views:
   - **Top Selling Products** (`v_top_products`)
   - **Monthly Revenue & Growth** (`v_monthly_sales`)
   - **Unpaid Invoices & Aging** (`v_unpaid_invoices` with `DATEDIFF` calculations)
   - **Supplier Cost & Margin Comparison** (`v_supplier_comparison`)
