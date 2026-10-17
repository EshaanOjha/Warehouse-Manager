# Wholesale Management System: Project Plan

RDBMS course project. Deadline: about 18 Oct 2026 (2 days from 16 Oct).

## 1. Overview

A wholesale platform with two roles:

- **Admin (warehouse):** manages the catalogue, buys stock from many suppliers, fulfils customer orders, views reports.
- **Customer (a business that resells):** buys stock in bulk, keeps its own inventory, views receipts and past orders, and gets in-app alerts when its own stock runs low.

## 2. Decisions (locked)

| Topic | Decision |
|---|---|
| Roles | Admin and customer only |
| Customer stock goes down | Manual "used/sold" entries |
| Customers | Businesses that resell |
| Payments | Paid / Unpaid flag on the invoice |
| Order approval | Auto-confirmed if stock and minimum order quantity are OK |
| Alerts | In-app only |
| Warehouses | Single warehouse (stock on `product.stock_qty`) |
| Database | MySQL 8 |
| Backend | Node.js + Express (`mysql2`, `jsonwebtoken`, `bcryptjs`) |
| Frontend | React (Vite) + react-router + axios |

## 3. Core flows

**Customer**
1. Browse catalogue (tiered bulk prices) and place an order.
2. Order is auto-confirmed. Warehouse stock drops and an invoice is created.
3. Admin ships the order and marks it Delivered. The quantities are added to the customer's inventory.
4. Customer records usage. When stock falls to the alert threshold, an alert is created.
5. Customer views orders, receipts (invoices) and alerts. Reordering a past order is optional.

**Admin**
1. Maintain products, categories, price tiers, suppliers, and supplier costs per product.
2. Move orders through Shipped / Delivered, or cancel them (stock is restored). Mark invoices Paid.
3. Check the low-stock list, which shows the cheapest supplier per product.
4. Create a purchase order to a supplier, then mark it Received to add warehouse stock.
5. View reports.

## 4. Database (`schema.sql`)

**Tables (16):** `category`, `supplier`, `customer`, `app_user`, `product`, `price_tier`, `product_supplier`, `purchase_order`, `purchase_order_item`, `sales_order`, `sales_order_item`, `invoice`, `customer_inventory`, `customer_stock_movement`, `warehouse_stock_movement`, `alert`.

**Relationships**
- Supplier 1—N Purchase Order 1—N Items
- Customer 1—N Sales Order 1—N Items; Sales Order 1—1 Invoice
- Product M—N Supplier (`product_supplier`)
- Customer M—N Product (`customer_inventory`)
- Product 1—N Price Tier; Category 1—N Product

**RDBMS features to demonstrate**
- Normalization to 3NF (explain the deliberate stored totals).
- Constraints: PK, FK, UNIQUE, CHECK, NOT NULL, DEFAULT.
- Indexes, with an `EXPLAIN` before and after.
- Function: `fn_unit_price` (tiered pricing).
- Triggers: stock check and price on order items, stock reduction, delivery fills customer inventory, low-stock alert, PO total, PO receive adds stock, cancel restores stock.
- Procedures: `sp_finalize_order`, `sp_record_usage`.
- Transactions: order placement and usage, with rollback on failure.
- Views: customer orders, receipts, stock; warehouse low stock; supplier comparison; top products; monthly sales; unpaid invoices.
- Data isolation: every customer query is filtered by the logged-in `customer_id`.

## 5. Backend

```
server/src/
  db.js                 mysql2/promise pool
  app.js
  middleware/auth.js    verify JWT, requireRole('admin'|'customer')
  routes/               auth.js, customer.js, admin.js
```

**Rules**
- Customer routes use `req.user.customerId` from the JWT, never an id from the request.
- Order placement: get a connection, `BEGIN`, insert order, insert items, `CALL sp_finalize_order(?)`, `COMMIT`; `ROLLBACK` on error.
- Trigger errors (`SQLSTATE 45000`) become HTTP 400 with `err.sqlMessage`.
- Alerts are polled every 30 seconds by the frontend.

## 6. Frontend

```
client/src/
  api/  context/AuthContext.jsx  components/  pages/customer/  pages/admin/
```

| Customer pages | Admin pages |
|---|---|
| Login | Dashboard (low stock, unpaid invoices, recent orders) |
| Catalogue and cart (live tier price) | Products and price tiers |
| My orders, receipt view | Suppliers and supplier costs |
| My inventory (use button, threshold) | Customer orders (status, mark paid) |
| Alerts bell in navbar | Purchase orders (create, receive) |
|  | Reports |
