-- =====================================================================
-- WHOLESALE MANAGEMENT SYSTEM - SEED DATA
-- Course: CSC2103 - Relational Database Management Systems
-- =====================================================================

Uwholesale_dbSE ;

-- 1. CATEGORIES (8 categories)
INSERT INTO category (category_id, name, description) VALUES
(1, 'Beverages', 'Soft drinks, bottled water, bulk tea, coffee beans, and juices'),
(2, 'Grains & Staples', 'Rice, flour, lentils, pulses, and dry cooking staples'),
(3, 'Dairy & Refrigerated', 'Cheese blocks, butter, bulk milk cartons, and refrigerated essentials'),
(4, 'Snacks & Confectionery', 'Packaged chips, biscuits, chocolates, and confectionery bars'),
(5, 'Bakery Essentials', 'Yeast, baking powder, cocoa powder, chocolate chips, and sugar sacks'),
(6, 'Canned & Preserved Foods', 'Canned tomatoes, beans, tuna, sweet corn, and vegetable oils'),
(7, 'Cleaning & Sanitation', 'Industrial detergents, surface cleaners, bleach, and hand soaps'),
(8, 'Packaging & Disposables', 'Biodegradable paper bags, takeaway boxes, cups, and plastic wrap');

-- 2. SUPPLIERS (6 suppliers)
INSERT INTO supplier (supplier_id, name, contact_name, email, phone, address) VALUES
(1, 'Apex Wholesale Supply Co.', 'Robert Hughes', 'sales@apexwholesale.com', '+1-555-0192', '1240 Industrial Pkwy, Sector 4, Logistics Park'),
(2, 'Global Metro Distributors', 'Sarah Jenkins', 'orders@globalmetro.com', '+1-555-0283', '88 Freight Way, Bay 12, Harbor District'),
(3, 'Pacific Commodity Traders', 'Michael Chang', 'mchang@pacifictrading.com', '+1-555-0374', '500 Export Blvd, Suite 200, Free Trade Zone'),
(4, 'Golden Harvest Farms & Mills', 'David Miller', 'dmiller@goldenharvest.com', '+1-555-0465', '45 Rural Route 9, Agri Hub, Greenfield'),
(5, 'CleanPro Industrial Chemicals', 'Karen Vance', 'kvance@cleanprochem.com', '+1-555-0556', '910 Chemical Way, East Industrial Estate'),
(6, 'EcoPack Sustainable Solutions', 'Amit Patel', 'apatel@ecopack.com', '+1-555-0647', '30 Eco Boulevard, Green Technology Park');

-- 3. CUSTOMERS (10 B2B Resellers / Businesses)
INSERT INTO customer (customer_id, company_name, contact_name, email, phone, shipping_address, credit_limit, balance) VALUES
(1, 'Metro Supermarket Chain', 'Vikram Malhotra', 'metro_mart@store.com', '+1-555-1101', 'Shop 101, Central Mall, Main Avenue', 100000.00, 1420.00),
(2, 'Urban Corner Groceries', 'Elena Rostova', 'urban_grocers@store.com', '+1-555-1102', '14 Elm Street, North End Commercial Area', 40000.00, 850.00),
(3, 'Green Valley Organic Market', 'Sophia Martinez', 'green_valley@store.com', '+1-555-1103', '77 Greenway Park, West Hills', 50000.00, 0.00),
(4, 'Sunrise Bakery & Cafe Co.', 'Liam O\'Connor', 'sunrise_cafe@store.com', '+1-555-1104', '22 Baker St, Old Town Arts District', 35000.00, 0.00),
(5, 'Harbor Point Convenience', 'Daniel Kim', 'harbor_store@store.com', '+1-555-1105', 'Pier 9, Marina Boardwalk, Harbor Gate', 30000.00, 2150.00),
(6, 'QuickStop MiniMart', 'Priya Sharma', 'quickstop@store.com', '+1-555-1106', 'Block B, Highway Plaza, Interstate 80', 25000.00, 0.00),
(7, 'Horizon Fresh Foods', 'Marcus Vance', 'horizon_foods@store.com', '+1-555-1107', '89 Valley Road, Eastside Market Complex', 60000.00, 0.00),
(8, 'City Center General Stores', 'Amina Yusuf', 'city_center@store.com', '+1-555-1108', '12 Financial Square, Ground Level', 45000.00, 3100.00),
(9, 'Blue Ribbon Dining Supplies', 'Carlos Sanchez', 'blue_ribbon@store.com', '+1-555-1109', '44 Restaurant Row, Culinary District', 50000.00, 0.00),
(10, 'Apex Retail Outlets', 'Jennifer Wu', 'apex_retail@store.com', '+1-555-1110', '505 Southern Boulevard, Retail City', 75000.00, 0.00);

-- 4. USERS (1 Admin + 10 Customer Accounts)
-- Admin password: admin123
-- Customer password: password123
INSERT INTO app_user (user_id, username, password_hash, role, customer_id) VALUES
(1, 'admin', '$2a$10$8yj3mmRB0/dlDsb9EOsJ9OGCYW6myaR3dYYOwyXjpK53X2hjJN7oO', 'admin', NULL),
(2, 'metro_mart', '$2a$10$2TXwCzkWiKRVL7IhJ0irXuN.NnRvasYSAh9yo5N1LX7.N8hmovFme', 'customer', 1),
(3, 'urban_grocers', '$2a$10$2TXwCzkWiKRVL7IhJ0irXuN.NnRvasYSAh9yo5N1LX7.N8hmovFme', 'customer', 2),
(4, 'green_valley', '$2a$10$2TXwCzkWiKRVL7IhJ0irXuN.NnRvasYSAh9yo5N1LX7.N8hmovFme', 'customer', 3),
(5, 'sunrise_cafe', '$2a$10$2TXwCzkWiKRVL7IhJ0irXuN.NnRvasYSAh9yo5N1LX7.N8hmovFme', 'customer', 4),
(6, 'harbor_store', '$2a$10$2TXwCzkWiKRVL7IhJ0irXuN.NnRvasYSAh9yo5N1LX7.N8hmovFme', 'customer', 5),
(7, 'quickstop', '$2a$10$2TXwCzkWiKRVL7IhJ0irXuN.NnRvasYSAh9yo5N1LX7.N8hmovFme', 'customer', 6),
(8, 'horizon_foods', '$2a$10$2TXwCzkWiKRVL7IhJ0irXuN.NnRvasYSAh9yo5N1LX7.N8hmovFme', 'customer', 7),
(9, 'city_center', '$2a$10$2TXwCzkWiKRVL7IhJ0irXuN.NnRvasYSAh9yo5N1LX7.N8hmovFme', 'customer', 8),
(10, 'blue_ribbon', '$2a$10$2TXwCzkWiKRVL7IhJ0irXuN.NnRvasYSAh9yo5N1LX7.N8hmovFme', 'customer', 9),
(11, 'apex_retail', '$2a$10$2TXwCzkWiKRVL7IhJ0irXuN.NnRvasYSAh9yo5N1LX7.N8hmovFme', 'customer', 10);

-- 5. PRODUCTS (32 Products across all categories with stock and thresholds)
INSERT INTO product (product_id, category_id, sku, name, description, unit_of_measure, min_order_qty, stock_qty, reorder_threshold, base_price, is_active) VALUES
-- Beverages (Category 1)
(1, 1, 'BEV-001', 'Premium Arabica Coffee Beans (1kg)', 'Slow-roasted whole beans from high altitude estates', 'bag', 5, 150, 25, 18.50, TRUE),
(2, 1, 'BEV-002', 'Pure Sparkling Mineral Water (24x500ml)', 'Naturally carbonated spring water carton', 'case', 10, 140, 20, 14.00, TRUE),
(3, 1, 'BEV-003', 'Earl Grey Loose Leaf Tea (500g)', 'Fragrant bergamot-infused organic black tea', 'tin', 5, 60, 15, 12.00, TRUE),
(4, 1, 'BEV-004', 'Organic Orange Juice 100% (12x1L)', 'Fresh pressed not-from-concentrate juice carton', 'case', 8, 45, 15, 22.50, TRUE),

-- Grains & Staples (Category 2)
(5, 2, 'GRN-001', 'Royal Basmati Rice (25kg Sack)', 'Aged long grain aromatic export quality rice', 'sack', 5, 95, 20, 38.00, TRUE),
(6, 2, 'GRN-002', 'Whole Wheat Atta Flour (10kg)', 'Stone ground 100% whole grain wheat flour', 'bag', 10, 140, 30, 11.50, TRUE),
(7, 2, 'GRN-003', 'Organic Yellow Lentils / Toor Dal (5kg)', 'Polished high-protein sorted lentils', 'bag', 10, 80, 20, 9.20, TRUE),
(8, 2, 'GRN-004', 'Durum Semolina Penne Pasta (10x1kg)', 'Italian durum wheat pasta pack', 'box', 6, 70, 15, 16.00, TRUE),

-- Dairy & Refrigerated (Category 3)
(9, 3, 'DRY-001', 'Pure Salted Butter Block (5kg)', 'Farm-churned cream butter block for foodservice', 'block', 4, 35, 10, 32.00, TRUE),
(10, 3, 'DRY-002', 'Cheddar Cheese Block Mild (2.5kg)', 'Aged dairy block suitable for slicing and grating', 'block', 4, 40, 10, 26.50, TRUE),
(11, 3, 'DRY-003', 'UHT Whole Milk (12x1L Carton)', 'Long-life homogenized dairy milk case', 'case', 10, 110, 30, 15.00, TRUE),
(12, 3, 'DRY-004', 'Greek Yogurt Plain Bulk (5kg Pail)', 'Strained thick probiotic yogurt bucket', 'pail', 4, 25, 10, 19.80, TRUE),

-- Snacks & Confectionery (Category 4)
(13, 4, 'SNK-001', 'Artisan Sea Salt Potato Crisps (24x50g)', 'Kettle-cooked batch crisps snack box', 'box', 8, 90, 25, 21.00, TRUE),
(14, 4, 'SNK-002', 'Dark Chocolate Bar 70% (20x100g)', 'Single-origin fairtrade cocoa bars', 'box', 5, 65, 15, 28.00, TRUE),
(15, 4, 'SNK-003', 'Roasted Almond & Cranberry Mix (3kg)', 'Energy fruit & nut trail mix container', 'tub', 5, 45, 12, 34.50, TRUE),
(16, 4, 'SNK-004', 'Buttery Digestives Biscuits (12x400g)', 'Classic crumbly tea biscuits case', 'case', 10, 100, 20, 18.00, TRUE),

-- Bakery Essentials (Category 5)
(17, 5, 'BAK-001', 'Granulated Cane Sugar (25kg Sack)', 'Refined pure white cane baking sugar', 'sack', 5, 130, 25, 24.00, TRUE),
(18, 5, 'BAK-002', 'Active Dry Yeast (500g Vacuum Pack)', 'Instant commercial bakers yeast', 'pack', 6, 85, 20, 7.50, TRUE),
(19, 5, 'BAK-003', 'Dutch Cocoa Powder Bulk (2kg)', 'Alkalized rich gourmet baking cocoa', 'tub', 4, 50, 12, 22.00, TRUE),
(20, 5, 'BAK-004', 'Pure Bourbon Vanilla Extract (500ml)', 'Natural Madagascar vanilla infusion', 'bottle', 2, 40, 10, 42.00, TRUE),

-- Canned & Preserved Foods (Category 6)
(21, 6, 'CAN-001', 'Italian Peeled Plum Tomatoes (6x2.5kg)', 'Foodservice catering size whole tomatoes cans', 'case', 5, 65, 15, 23.50, TRUE),
(22, 6, 'CAN-002', 'Extra Virgin Olive Oil Tin (5L)', 'Cold pressed Mediterranean olive oil tin', 'tin', 4, 55, 15, 46.00, TRUE),
(23, 6, 'CAN-003', 'Solid White Albacore Tuna (12x400g)', 'Canned wild-caught tuna in springwater', 'case', 6, 75, 20, 36.00, TRUE),
(24, 6, 'CAN-004', 'Sweet Golden Corn Kernels (12x800g)', 'Crisp sweetcorn in light brine', 'case', 8, 80, 20, 19.50, TRUE),

-- Cleaning & Sanitation (Category 7)
(25, 7, 'CLN-001', 'Commercial Dishwashing Liquid (20L Pail)', 'High-active grease-cutting concentrated detergent', 'pail', 3, 75, 10, 39.00, TRUE),
(26, 7, 'CLN-002', 'Hospital Grade Surface Sanitizer (4x5L)', 'Antimicrobial disinfectant liquid case', 'case', 4, 45, 12, 31.00, TRUE),
(27, 7, 'CLN-003', 'Microfiber Commercial Cloths (50 Pack)', 'Lint-free color-coded heavy duty cleaning wipes', 'pack', 5, 90, 20, 18.50, TRUE),
(28, 7, 'CLN-004', 'Antibacterial Foam Hand Soap Refill (5L)', 'Gentle aloe vera enriched hand wash', 'bottle', 4, 50, 15, 16.00, TRUE),

-- Packaging & Disposables (Category 8)
(29, 8, 'PKG-001', 'Kraft Paper Grocery Bags #8 (500 Pack)', 'Heavy duty recyclable flat-bottom bags', 'bundle', 4, 70, 15, 29.00, TRUE),
(30, 8, 'PKG-002', 'Biodegradable Takeaway Boxes 750ml (250s)', 'Sugarcane bagasse leak-proof lunch containers', 'carton', 4, 60, 15, 33.00, TRUE),
(31, 8, 'PKG-003', 'Clear Food Wrap Cling Film 450mm x 300m', 'Dispenser cutter box commercial cling film', 'roll', 6, 85, 20, 14.50, TRUE),
(32, 8, 'PKG-004', 'Paper Drinking Straws (1000 Pack)', '3-ply durable compostable drinking straws box', 'box', 5, 110, 25, 11.00, TRUE);

-- 6. PRICE TIERS (Tiered Bulk Discounts for Products)
-- Tiers allow customers ordering higher volumes to get lower unit prices
INSERT INTO price_tier (product_id, min_qty, max_qty, unit_price, discount_pct) VALUES
-- BEV-001 Coffee
(1, 5, 19, 18.50, 0.00),
(1, 20, 49, 16.80, 9.19),
(1, 50, NULL, 15.20, 17.84),
-- BEV-002 Water
(2, 10, 29, 14.00, 0.00),
(2, 30, 59, 12.50, 10.71),
(2, 60, NULL, 11.00, 21.43),
-- GRN-001 Basmati Rice
(5, 5, 19, 38.00, 0.00),
(5, 20, 49, 34.50, 9.21),
(5, 50, NULL, 31.00, 18.42),
-- DRY-001 Butter
(9, 4, 14, 32.00, 0.00),
(9, 15, 29, 29.50, 7.81),
(9, 30, NULL, 27.00, 15.63),
-- SNK-001 Potato Crisps
(13, 8, 24, 21.00, 0.00),
(13, 25, 49, 19.00, 9.52),
(13, 50, NULL, 17.20, 18.10),
-- BAK-001 Sugar 25kg
(17, 5, 19, 24.00, 0.00),
(17, 20, 49, 21.50, 10.42),
(17, 50, NULL, 19.00, 20.83),
-- CAN-002 Olive oil 5L
(22, 4, 14, 46.00, 0.00),
(22, 15, 29, 42.00, 8.70),
(22, 30, NULL, 38.50, 16.30),
-- CLN-001 Dishwashing
(25, 3, 9, 39.00, 0.00),
(25, 10, 24, 35.00, 10.26),
(25, 25, NULL, 31.50, 19.23),
-- PKG-001 Kraft Bags
(29, 4, 14, 29.00, 0.00),
(29, 15, 29, 26.00, 10.34),
(29, 30, NULL, 23.00, 20.69);

-- 7. PRODUCT_SUPPLIER (M:N Relationship with Multi-Supplier Pricing)
-- Enables comparing supplier costs and automatic cheapest supplier selection
INSERT INTO product_supplier (product_id, supplier_id, supplier_sku, supply_price, lead_time_days, is_preferred) VALUES
-- BEV-001 Coffee
(1, 1, 'APX-COF-1', 13.50, 2, TRUE),
(1, 2, 'GLB-COF-9', 14.20, 4, FALSE),
-- BEV-002 Water
(2, 1, 'APX-WTR-24', 9.50, 2, TRUE),
(2, 3, 'PAC-WTR-24', 9.10, 5, FALSE),
-- GRN-001 Basmati
(5, 4, 'GH-RICE-25', 26.00, 3, TRUE),
(5, 3, 'PAC-RICE-25', 27.50, 6, FALSE),
-- DRY-001 Butter
(9, 2, 'GLB-BTR-5K', 23.00, 3, TRUE),
(9, 4, 'GH-BTR-5K', 24.20, 4, FALSE),
-- SNK-001 Crisps
(13, 1, 'APX-CRISP-24', 14.50, 2, TRUE),
(13, 2, 'GLB-CRISP-24', 15.00, 3, FALSE),
-- BAK-001 Sugar
(17, 4, 'GH-SUG-25K', 16.50, 3, TRUE),
(17, 3, 'PAC-SUG-25K', 16.00, 7, FALSE),
-- CAN-002 Olive Oil
(22, 3, 'PAC-OIL-5L', 32.00, 5, TRUE),
(22, 1, 'APX-OIL-5L', 34.50, 2, FALSE),
-- CLN-001 Detergent
(25, 5, 'CP-DISH-20L', 24.50, 2, TRUE),
(25, 1, 'APX-DISH-20L', 26.00, 3, FALSE),
-- PKG-001 Bags
(29, 6, 'ECO-BAG-8', 18.00, 3, TRUE),
(29, 1, 'APX-BAG-8', 19.50, 2, FALSE);

-- Fill remaining products with primary suppliers
INSERT INTO product_supplier (product_id, supplier_id, supplier_sku, supply_price, lead_time_days, is_preferred) VALUES
(3, 1, 'APX-TEA-500', 8.50, 2, TRUE),
(4, 2, 'GLB-OJ-12', 15.80, 3, TRUE),
(6, 4, 'GH-FLR-10K', 7.50, 3, TRUE),
(7, 4, 'GH-DAL-5K', 6.20, 3, TRUE),
(8, 2, 'GLB-PAS-10', 10.80, 4, TRUE),
(10, 2, 'GLB-CHD-2K', 18.50, 3, TRUE),
(11, 2, 'GLB-MILK-12', 10.20, 2, TRUE),
(12, 4, 'GH-YOG-5K', 13.50, 2, TRUE),
(14, 1, 'APX-CHOC-20', 19.00, 3, TRUE),
(15, 3, 'PAC-NUT-3K', 24.00, 5, TRUE),
(16, 1, 'APX-BIS-12', 12.00, 2, TRUE),
(18, 4, 'GH-YST-500', 4.80, 2, TRUE),
(19, 1, 'APX-COC-2K', 15.00, 3, TRUE),
(20, 3, 'PAC-VAN-500', 29.00, 6, TRUE),
(21, 2, 'GLB-TOM-6X', 16.00, 4, TRUE),
(23, 3, 'PAC-TUN-12', 25.00, 5, TRUE),
(24, 2, 'GLB-CRN-12', 13.00, 3, TRUE),
(26, 5, 'CP-SAN-4X', 20.00, 2, TRUE),
(27, 5, 'CP-MIC-50', 11.50, 2, TRUE),
(28, 5, 'CP-SOAP-5L', 10.00, 2, TRUE),
(30, 6, 'ECO-BOX-250', 22.00, 3, TRUE),
(31, 6, 'ECO-WRAP-1R', 9.50, 2, TRUE),
(32, 6, 'ECO-STRW-1K', 6.80, 2, TRUE);

-- 8. INITIAL CUSTOMER INVENTORY (Pre-seeded stocks for demonstration)
INSERT INTO customer_inventory (customer_id, product_id, quantity_on_hand, alert_threshold, last_restocked_at) VALUES
-- Metro Supermarket has stock
(1, 1, 24, 10, '2026-10-10 10:00:00'),
(1, 2, 40, 15, '2026-10-10 10:00:00'),
(1, 5, 12, 10, '2026-10-10 10:00:00'),
-- Urban Groceries has near-threshold stock (triggers alert demo)
(2, 1, 6, 10, '2026-10-08 14:00:00'),
(2, 13, 8, 12, '2026-10-08 14:00:00'),
-- Green Valley has good stock
(3, 3, 20, 5, '2026-10-12 11:30:00'),
(3, 7, 30, 10, '2026-10-12 11:30:00'),
-- Sunrise Bakery has essentials
(4, 17, 15, 8, '2026-10-11 09:00:00'),
(4, 18, 10, 5, '2026-10-11 09:00:00');

-- Pre-seed an alert for Urban Groceries
INSERT INTO alert (customer_id, product_id, alert_type, message, is_read, created_at) VALUES
(2, 1, 'LOW_STOCK', 'Low stock warning: Product "Premium Arabica Coffee Beans (1kg)" has only 6 units left (Threshold: 10). Consider reordering!', FALSE, NOW()),
(2, 13, 'LOW_STOCK', 'Low stock warning: Product "Artisan Sea Salt Potato Crisps (24x50g)" has only 8 units left (Threshold: 12). Consider reordering!', FALSE, NOW());

-- 9. HISTORICAL PURCHASE ORDERS (Admin restocks)
INSERT INTO purchase_order (po_id, supplier_id, order_date, status, total_amount, received_date, notes) VALUES
(1, 1, '2026-10-01 09:30:00', 'RECEIVED', 2700.00, '2026-10-03 14:00:00', 'Initial seasonal warehouse restock'),
(2, 4, '2026-10-05 11:00:00', 'RECEIVED', 3250.00, '2026-10-08 10:30:00', 'Bulk grain and sugar restock'),
(3, 5, '2026-10-14 16:00:00', 'ORDERED', 1225.00, NULL, 'Cleaning supplies restock pending delivery');

INSERT INTO purchase_order_item (po_item_id, po_id, product_id, quantity, unit_cost, subtotal) VALUES
(1, 1, 1, 100, 13.50, 1350.00),
(2, 1, 2, 100, 9.50, 950.00),
(3, 1, 13, 20, 14.50, 290.00),
(4, 2, 5, 80, 26.00, 2080.00),
(5, 2, 17, 70, 16.50, 1155.00),
(6, 3, 25, 30, 24.50, 735.00),
(7, 3, 26, 20, 20.00, 400.00);

-- 10. HISTORICAL SALES ORDERS & INVOICES
-- Order 1: Delivered to Metro Supermarket
INSERT INTO sales_order (order_id, customer_id, order_date, status, subtotal, tax_amount, total_amount, shipping_address, notes) VALUES
(1, 1, '2026-10-09 10:00:00', 'DELIVERED', 1352.00, 67.60, 1419.60, 'Shop 101, Central Mall, Main Avenue', 'Deliver to rear loading bay');

INSERT INTO sales_order_item (item_id, order_id, product_id, quantity, unit_price, subtotal) VALUES
(1, 1, 1, 20, 16.80, 336.00),
(2, 1, 2, 30, 12.50, 375.00),
(3, 1, 5, 20, 34.50, 690.00);

INSERT INTO invoice (invoice_id, order_id, customer_id, invoice_number, invoice_date, due_date, total_amount, status, paid_date) VALUES
(1, 1, 1, 'INV-2026-00001', '2026-10-09 10:00:00', '2026-11-08 10:00:00', 1419.60, 'UNPAID', NULL);

-- Order 2: Delivered to Urban Corner Groceries (Paid)
INSERT INTO sales_order (order_id, customer_id, order_date, status, subtotal, tax_amount, total_amount, shipping_address, notes) VALUES
(2, 2, '2026-10-07 14:20:00', 'DELIVERED', 810.00, 40.50, 850.50, '14 Elm Street, North End Commercial Area', 'Standard delivery');

INSERT INTO sales_order_item (item_id, order_id, product_id, quantity, unit_price, subtotal) VALUES
(4, 2, 1, 10, 18.50, 185.00),
(5, 2, 13, 25, 19.00, 475.00),
(6, 2, 16, 10, 18.00, 180.00);

INSERT INTO invoice (invoice_id, order_id, customer_id, invoice_number, invoice_date, due_date, total_amount, status, paid_date) VALUES
(2, 2, 2, 'INV-2026-00002', '2026-10-07 14:20:00', '2026-11-06 14:20:00', 850.50, 'PAID', '2026-10-10 16:30:00');

-- Order 3: Shipped to Harbor Point Convenience (Unpaid)
INSERT INTO sales_order (order_id, customer_id, order_date, status, subtotal, tax_amount, total_amount, shipping_address, notes) VALUES
(3, 5, '2026-10-12 16:45:00', 'SHIPPED', 2045.00, 102.25, 2147.25, 'Pier 9, Marina Boardwalk, Harbor Gate', 'Express delivery requested');

INSERT INTO sales_order_item (item_id, order_id, product_id, quantity, unit_price, subtotal) VALUES
(7, 3, 2, 60, 11.00, 660.00),
(8, 3, 14, 25, 28.00, 700.00),
(9, 3, 22, 15, 42.00, 630.00);

INSERT INTO invoice (invoice_id, order_id, customer_id, invoice_number, invoice_date, due_date, total_amount, status, paid_date) VALUES
(3, 3, 5, 'INV-2026-00003', '2026-10-12 16:45:00', '2026-11-11 16:45:00', 2147.25, 'UNPAID', NULL);

-- Order 4: Confirmed order from City Center (Unpaid)
INSERT INTO sales_order (order_id, customer_id, order_date, status, subtotal, tax_amount, total_amount, shipping_address, notes) VALUES
(4, 8, '2026-10-15 11:15:00', 'CONFIRMED', 2950.00, 147.50, 3097.50, '12 Financial Square, Ground Level', 'Call before arrival');

INSERT INTO sales_order_item (item_id, order_id, product_id, quantity, unit_price, subtotal) VALUES
(10, 4, 1, 50, 15.20, 760.00),
(11, 4, 17, 50, 19.00, 950.00),
(12, 4, 25, 25, 31.50, 787.50),
(13, 4, 29, 20, 26.00, 520.00);

INSERT INTO invoice (invoice_id, order_id, customer_id, invoice_number, invoice_date, due_date, total_amount, status, paid_date) VALUES
(4, 4, 8, 'INV-2026-00004', '2026-10-15 11:15:00', '2026-11-14 11:15:00', 3097.50, 'UNPAID', NULL);
