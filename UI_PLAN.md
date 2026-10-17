# Wholesale Management System — UI Design & Layout Plan (`UI_PLAN.md`)

This document is the comprehensive UI/UX Design Specification & Component Breakdown for redesigning the Wholesale Management System frontend.

---

## 1. Global Shell & Navigation Bar (`Navbar.jsx`)

**Target Audience:** Persistent across all pages for authenticated users (Admin and Customer).

### Layout & Elements:
- **Left Section (Brand & Role Identity):**
  - App Logo & Name: `Wholesale Manager`.
  - Role Badge:
    - Customer view: `Retailer Portal` badge.
    - Admin view: `Warehouse Admin` badge.
  - Primary Navigation Links (filtered by user role).
- **Right Section (Retailer Utility & User Context):**
  - **In-App Notification Bell (`AlertBell.jsx`)** *(Customer only)*:
    - Bell icon with an active unread badge count (e.g., `2`).
    - Click opens a **Notification Dropdown** showing:
      - Alert badge (`LOW_STOCK`, `OVERDUE_INVOICE`).
      - Message text with product name and units remaining.
      - Relative timestamp (e.g., "10 mins ago").
      - Individual "Dismiss / Mark as Read" button and "Mark all as read" button.
      - Empty state: "No notifications".
  - **Retailer Profile Pill:**
    - Icon + Retailer Shop Name (e.g., `👤 Urban Corner Groceries`).
    - Clicking navigates directly to the Profile page (`/customer/profile`).
  - **Cart Button:**
    - Button: `🛒 Cart` with a high-contrast pill count badge showing total items (e.g., `4`).
    - Links to `/customer/cart`.
  - **Logout Button:**
    - Ghost or danger-styled button (`Logout`).

---

## 2. Authentication Page — `/login` (`Login.jsx`)

**Target Audience:** Public / Unauthenticated users.

### Layout & Elements:
- **Center Card / Split Screen Layout:**
  - System title: "Wholesale Management System".
  - Subtitle: "B2B Wholesale Portal & Warehouse Management".
  - **Form Fields:**
    - `Username` (text input with icon).
    - `Password` (password input with show/hide toggle).
    - `Sign In` primary CTA button (with loading spinner state).
  - **Error Banner:** Inline alert for invalid credentials ("Invalid username or password").
  - **Quick Demo Account Selector:**
    - A dedicated "Quick Demo Sign-In" chip/button section allowing 1-click credential prefill:
      - `Admin (admin123)`
      - `Urban Grocers (password123)`
      - `Metro Supermarket (password123)`
      - `Green Valley (password123)`

---

## 3. Retailer (Customer) Pages

---

### Page 3.1: Wholesale Products Catalogue — `/customer/products` (`Products.jsx`)

**Goal:** Allow retailers to browse wholesale items, view volume discount brackets, specify quantities, and add items to cart.

#### Layout & Elements:
1. **Header Section:**
   - Page Title: `Wholesale Products`.
   - Subtitle: "Browse items and bulk volume tiers. Add products to your cart at top right."
   - Quick action button: `🛒 View Cart`.
2. **Success Feedback Toast/Banner:**
   - Appears when an item is added: `"✓ Added 25 × Premium Arabica Coffee Beans to cart."` with an `Open Cart →` quick link.
3. **Search & Filter Toolbar:**
   - Search input (live filter by product name or SKU).
   - Category dropdown filter (`All Categories`, `Beverages`, `Grains & Staples`, etc.).
4. **Product Card / List Layout:**
   - **Product Info:**
     - Category badge (e.g., `Beverages`).
     - Product SKU (e.g., `SKU: BEV-001`).
     - Product Name & Description.
     - Metadata line: Base Selling Price (e.g., `$18.50 / bag`), Minimum Order Quantity (e.g., `Min: 5`), Warehouse Stock on Hand (highlighted red if low).
   - **Bulk Discount Tiers Panel:**
     - Displays quantity brackets and discounted prices:
       - `5–19 units: $18.50 (Base)`
       - `20–49 units: $16.80 (9% off)`
       - `50+ units: $15.20 (18% off)`
   - **Purchase Action Block (Right side of each card):**
     - "Live Unit Price" indicator (dynamically updates as quantity is typed).
     - Quantity stepper/input box (with `min` set to product's minimum order qty).
     - `+ Add to Cart` button.

---

### Page 3.2: Dedicated Cart & Checkout — `/customer/cart` (`Cart.jsx`)

**Goal:** Transparent order review, quantity adjustment, discount tier visualization, and checkout.

#### Layout & Elements:
1. **Header Section:**
   - Title: `Retailer Shopping Cart`.
   - Subtitle: "Review your order lines, bulk discount tier prices, and confirm wholesale purchase."
   - Action: `← Back to Products` link.
2. **Empty State (when cart is empty):**
   - Clean empty cart illustration, message ("Your cart is empty"), and a `Browse Products` CTA button.
3. **2-Column Checkout Layout (when cart has items):**
   - **Left Column: Cart Items Table:**
     - Columns: `Product Details` (Name, SKU, Stock available), `Base Price`, `Quantity Input`, `Live Tier Unit Price` (with "Tier applied" badge), `Line Subtotal`, `Remove (✕)` button.
     - `Clear Cart` secondary button at table footer.
   - **Right Column: Order Summary Card (Sticky):**
     - Subtotal amount.
     - Wholesale Sales Tax (5%).
     - **Final Total Amount** (large bold font).
     - Textarea: `Delivery / Loading Instructions` (e.g. "Deliver to rear dock between 9 AM - 12 PM").
     - **Place Wholesale Order CTA:**
       - Primary action button (`Place Wholesale Order`).
       - Loading state ("Processing Transaction...").
       - Error state: Displays inline alert if the database trigger rejects the order (e.g., "Insufficient warehouse stock" or "Below minimum order quantity").

---

### Page 3.3: My Orders — `/customer/orders` (`Orders.jsx`)

**Goal:** Review past order lifecycle, fulfillment statuses, and access tax invoices.

#### Layout & Elements:
1. **Header Section:** Title `My Wholesale Orders`, subtitle explaining tracking and invoices.
2. **Orders Table:**
   - `Order ID` (e.g. `#104`).
   - `Order Date`.
   - `Items / Total Units` (e.g. "3 items (75 units)").
   - `Total Amount` (e.g. "$1,419.60").
   - `Status Badge`:
     - 🟡 `CONFIRMED`
     - 🔵 `SHIPPED`
     - 🟢 `DELIVERED`
     - 🔴 `CANCELLED`
   - `Invoice Reference`: Displays invoice number and payment status (e.g., `INV-2026-00001 (UNPAID)`).
   - `Action Button`: `View Items`.
3. **Order Details Modal:**
   - Order number and status badge in header.
   - Placed date and delivery address.
   - Line items table: `Product`, `SKU`, `Quantity`, `Unit Price`, `Subtotal`.
   - Financial breakdown: Subtotal, 5% Tax, Total Amount.

---

### Page 3.4: Receipts / Invoices — `/customer/receipts` (`Receipt.jsx`)

**Goal:** Access formal accounting records, view due dates, and print/export tax invoices.

#### Layout & Elements:
1. **Header Section:** Title `Invoices & Receipts`.
2. **Invoices Table:**
   - `Invoice #` (e.g., `INV-2026-00002`).
   - `Order Reference` (e.g., `#2`).
   - `Invoice Date` & `Due Date`.
   - `Total Amount`.
   - `Payment Status Badge`:
     - 🟢 `PAID` (with paid timestamp).
     - 🔴 `UNPAID` (with days until due).
   - `Action Button`: `View Invoice`.
3. **Tax Invoice Modal / Printable Receipt Card:**
   - Formal invoice layout with header: `TAX INVOICE`.
   - Company branding, Invoice Number, Order ID, and Payment Badge.
   - Billed To box: Customer Shop Name, Contact Name, Email, Shipping Address.
   - Line items summary table with subtotals.
   - Total amount with note: "Wholesale tax included (5%)".
   - Actions: `Print / Save PDF` (triggers browser print) and `Close`.

---

### Page 3.5: My Inventory & Usage — `/customer/inventory` (`Inventory.jsx`)

**Goal:** Track delivered stock at the retailer's store, log usage/sales, and configure low-stock alerts.

#### Layout & Elements:
1. **Header Section:**
   - Title `My Business Inventory`.
   - Subtitle: "Stock received from delivered wholesale orders. Record usage or sales to track store stock and trigger low-stock alerts."
2. **Inventory Table:**
   - Columns: `Product Name`, `Category`, `SKU`, `Stock On Hand`, `Alert Threshold`, `Stock Status Badge`, `Last Restocked Date`, `Actions`.
   - **Low-Stock Row Highlight:** Rows where `quantity_on_hand <= alert_threshold` get a light amber/red highlight with a `⚠️ Low Stock` badge.
   - **Action Buttons per row:**
     - `Record Usage` (opens Usage Modal).
     - `Threshold` (opens Threshold Configuration Modal).
3. **Record Usage Modal:**
   - Product name and available stock.
   - Input: `Quantity Used / Sold` (validated against max stock on hand).
   - Input: `Reason / Notes` (e.g. "Counter retail sales").
   - Action: `Confirm Usage` (triggers `sp_record_usage`; fires low-stock trigger if threshold reached).
4. **Edit Threshold Modal:**
   - Input: `Minimum Stock Threshold` (number input).
   - Help text: "An in-app alert will be triggered automatically when stock reaches or drops below this number."
   - Action: `Save Threshold`.

---

### Page 3.6: Retailer Profile — `/customer/profile` (`Profile.jsx`)

**Goal:** Manage shop name, contact information, default delivery address, and view account credit status.

#### Layout & Elements:
- **2-Column Settings Layout:**
  - **Left Card: Store & Contact Information (Editable Form):**
    - Input: `Shop / Company Name` (e.g., `Urban Corner Groceries`).
    - Input: `Contact Person` (e.g., `Elena Rostova`).
    - Input: `Contact Phone Number`.
    - Input: `Business Email`.
    - Textarea: `Default Shipping / Receiving Address` (with note: "Auto-fills future delivery orders").
    - Action Buttons: `Reset` and `Save Profile Changes` (with instant Navbar shop name sync).
  - **Right Card: Account Overview (Read-Only):**
    - Account ID: `Customer #2`.
    - Login Username.
    - Approved Credit Limit (e.g., `$40,000.00`).
    - Current Account Balance (e.g., `$850.00`).
    - Member Since date.

---

## 4. Warehouse Administrator Pages

---

### Page 4.1: Warehouse Dashboard — `/admin/dashboard` (`Dashboard.jsx`)

**Goal:** Central operational overview for warehouse managers.

#### Layout & Elements:
1. **Top Metric Cards (KPI Grid):**
   - 🟢 **Total Revenue:** Gross sales volume from confirmed orders.
   - 🔴 **Low Stock Alerts:** Count of products at or below warehouse reorder threshold (links to Procurement).
   - 🟡 **Pending Orders:** Count of orders awaiting shipment/delivery.
   - 🔴 **Unpaid Invoices:** Count and dollar sum of unpaid customer invoices.
2. **Quick Operations Bar:**
   - Quick action shortcuts: `+ Create Purchase Order`, `+ Add Product`, `Manage Suppliers`, `View Reports`.
3. **Recent Customer Orders Table:**
   - Summary of last 6 orders with customer company name, date, units, total amount, order status, and invoice status.

---

### Page 4.2: Products & Price Tiers — `/admin/products` (`Products.jsx`)

**Goal:** Catalogue maintenance, stock level oversight, and volume pricing setup.

#### Layout & Elements:
1. **Header Section:** Title `Product Catalogue & Price Tiers`, with `+ Add New Product` CTA.
2. **Products Table:**
   - `ID`, `SKU`, `Product Name`, `Category`, `Warehouse Stock` (red if low), `Min Order Qty`, `Threshold`, `Base Price`, `Tier Count Badge`, `Actions`.
   - `Manage Tiers` button on each row.
3. **Add Product Modal:**
   - Form fields: SKU, Category dropdown, Product Name, Description, Unit of Measure, Base Price, Min Order Qty, Initial Stock, Reorder Threshold.
4. **Manage Price Tiers Modal:**
   - Table of existing tiers for selected product (`Min Qty`, `Max Qty`, `Unit Price`, `Discount %`, `Delete` button).
   - Form to add new tier: `Min Qty`, `Max Qty` (optional), `Unit Price`, `Discount %`.

---

### Page 4.3: Suppliers & Price Mapping — `/admin/suppliers` (`Suppliers.jsx`)

**Goal:** Manage distributor contacts and multi-supplier procurement pricing.

#### Layout & Elements:
1. **Header Section:** Title `Wholesale Suppliers`, with `+ Add Supplier` and `Map Product Supply Price` buttons.
2. **Suppliers Table:**
   - `ID`, `Supplier Name`, `Contact Person`, `Email`, `Phone`, `Facility Address`.
3. **Add Supplier Modal:**
   - Company Name, Contact Name, Email, Phone, Address.
4. **Map Product Supply Price Modal (`product_supplier`):**
   - Supplier dropdown, Product dropdown, Supply Price ($), Lead Time (Days), Supplier SKU, and "Preferred Supplier" toggle.

---

### Page 4.4: Customer Orders Fulfillment — `/admin/orders` (`Orders.jsx`)

**Goal:** Track customer order shipments, trigger customer stock sync upon delivery, restore stock on cancellation, and mark invoices as paid.

#### Layout & Elements:
1. **Header Tabs:**
   - `Sales Orders (Count)` tab.
   - `Invoices (Count)` tab.
2. **Database Trigger Callout Banner:**
   - Explains that marking `DELIVERED` automatically restocks the customer's inventory, and `CANCELLED` restores warehouse stock.
3. **Orders View:**
   - Table: `Order #`, `Customer Name`, `Order Date`, `Units`, `Total`, `Status`, `Invoice #`, `Actions`.
   - **Lifecycle Actions:**
     - If `CONFIRMED`: Button `Ship Order` (moves to `SHIPPED`).
     - If `SHIPPED`: Button `Mark Delivered` (moves to `DELIVERED`, triggers stock transfer).
     - If `CONFIRMED` or `SHIPPED`: Button `Cancel` (restores warehouse stock).
     - `Inspect` button: Opens order details modal with itemized breakdown.
4. **Invoices View:**
   - Table: `Invoice #`, `Customer`, `Order #`, `Invoice Date`, `Due Date`, `Total`, `Status Badge`, `Action`.
   - `Mark as Paid` button for unpaid invoices.

---

### Page 4.5: Purchase Orders & Reordering — `/admin/purchase-orders` (`PurchaseOrders.jsx`)

**Goal:** Identify low warehouse stock, compare supplier prices, raise POs, and receive stock.

#### Layout & Elements:
1. **Low-Stock Alert Card (`v_warehouse_low_stock`):**
   - Highlights items below reorder threshold.
   - **Cheapest Supplier Column:** Shows the supplier with the lowest price for each item, their supply cost, and lead time.
   - `Reorder Now` button on each item: Pre-populates the PO modal with that product and the cheapest supplier.
2. **Purchase Orders Log Table:**
   - Columns: `PO #`, `Supplier Name`, `Order Date`, `Items / Units`, `Total Cost`, `Status`, `Received Date`, `Actions`.
   - `Receive Stock` button: Transitions status to `RECEIVED` and fires trigger to add stock to warehouse.
3. **Create Purchase Order Modal:**
   - Supplier selector, Line item rows (Product dropdown, Quantity, Unit Cost, Add/Remove row), Notes, and Submit button.

---

### Page 4.6: BI & Analytical SQL Reports — `/admin/reports` (`Reports.jsx`)

**Goal:** Present aggregated SQL Views, revenue metrics, accounts receivable aging, and margin comparisons.

#### Layout & Elements:
1. **Header Action:** `Print Report` button.
2. **Report Navigation Tabs:**
   - **Tab 1: Top Selling Products (`v_top_products`):**
     - Table: `Rank`, `Product Name`, `SKU`, `Category`, `Total Units Sold`, `Gross Revenue Generated`.
   - **Tab 2: Monthly Revenue & Growth (`v_monthly_sales`):**
     - Table: `Month (YYYY-MM)`, `Total Orders`, `Gross Subtotal`, `Tax Collected (5%)`, `Total Net Revenue`.
   - **Tab 3: Unpaid Invoices & Aging (`v_unpaid_invoices`):**
     - Overdue rows highlighted in light red.
     - Table: `Invoice #`, `Customer`, `Contact`, `Total Outstanding`, `Due Date`, `Days Overdue (+N days)`, `Aging Category (CURRENT vs OVERDUE)`.
   - **Tab 4: Supplier Cost & Margin Comparison (`v_supplier_comparison`):**
     - Table: `Product`, `SKU`, `Warehouse Selling Price`, `Supplier Name`, `Supply Price`, `Unit Profit Margin ($)`, `Profit Margin %` badge, `Lead Time`, `Preferred Supplier Star`.

---

## 5. Design System Reference Tokens for Stich

- **Color Palette:**
  - Primary / Brand: `#2563eb` (Royal Blue)
  - Primary Hover: `#1d4ed8`
  - Success / Paid / Delivered: `#16a34a` (Green)
  - Warning / Confirmed: `#d97706` (Amber)
  - Danger / Low Stock / Overdue / Cancel: `#dc2626` (Red)
  - Neutral Background: `#f8fafc`
  - Card / Surface Background: `#ffffff`
  - Borders: `#e2e8f0`
  - Text Primary: `#0f172a`
  - Text Muted: `#64748b`
- **Typography Hierarchy:**
  - Page Titles: `1.5rem – 1.75rem`, Bold / 700
  - Section Headings: `1.15rem – 1.25rem`, Semi-bold / 600
  - Body Text: `0.9rem – 0.95rem`, Regular / 400
  - Table Headers & Badges: `0.75rem – 0.85rem`, Medium/Semi-bold
- **Key Visual Patterns:**
  - Clean cards with subtle border (`1px solid #e2e8f0`) and rounded corners (`8px`).
  - Status badges with light tinted background and dark colored text (e.g. `#dcfce7` bg with `#15803d` text for Success).
  - Sticky summary panels on 2-column checkout and order pages.
