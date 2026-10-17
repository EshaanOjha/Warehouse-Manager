# Database Normalization Report & Justification

**Course:** CSC2103 - Relational Database Management Systems  
**Institution:** Manipal University Jaipur, Department of Computer Science & Engineering  
**Project:** Wholesale Management System  

---

## 1. Objective

This document provides formal justification and mathematical proof of relational normalization applied to the Wholesale Management System database schema from First Normal Form (1NF) through Third Normal Form (3NF) and Boyce-Codd Normal Form (BCNF), highlighting functional dependency preservation and intentional denormalization for invoice immutability.

---

## 2. Functional Dependencies (FDs) Analysis

Consider the primary relation sets:

1. **Product & Category:**
   - $FD_1: \text{product\_id} \rightarrow \text{category\_id, sku, name, description, unit\_of\_measure, min\_order\_qty, stock\_qty, reorder\_threshold, base\_price}$
   - $FD_2: \text{sku} \rightarrow \text{product\_id}$ (Candidate Key)
   - $FD_3: \text{category\_id} \rightarrow \text{name, description}$

2. **Customer & User:**
   - $FD_4: \text{customer\_id} \rightarrow \text{company\_name, contact\_name, email, phone, shipping\_address, credit\_limit, balance}$
   - $FD_5: \text{email} \rightarrow \text{customer\_id}$ (Candidate Key)
   - $FD_6: \text{user\_id} \rightarrow \text{username, password\_hash, role, customer\_id}$
   - $FD_7: \text{username} \rightarrow \text{user\_id}$ (Candidate Key)

3. **Multi-Supplier Sourcing (`product_supplier`):**
   - $FD_8: (\text{product\_id}, \text{supplier\_id}) \rightarrow \text{supplier\_sku, supply\_price, lead\_time\_days, is\_preferred}$

4. **Sales Order & Line Items:**
   - $FD_9: \text{order\_id} \rightarrow \text{customer\_id, order\_date, status, subtotal, tax\_amount, total\_amount, shipping\_address, notes}$
   - $FD_{10}: \text{item\_id} \rightarrow \text{order\_id, product\_id, quantity, unit\_price, subtotal}$
   - $FD_{11}: (\text{order\_id}, \text{product\_id}) \rightarrow \text{item\_id, quantity, unit\_price, subtotal}$

5. **Customer Inventory & Movement:**
   - $FD_{12}: (\text{customer\_id}, \text{product\_id}) \rightarrow \text{inventory\_id, quantity\_on\_hand, alert\_threshold, last\_restocked\_at}$

---

## 3. Step-by-Step Normalization Breakdown

### First Normal Form (1NF)
**Requirement:** All column values must be atomic (indivisible scalars). No repeating groups or comma-separated lists.
- **Decomposition Proof:** Instead of storing multiple product items inside a single delimited attribute in `sales_order` (e.g., `items = "BEV-001:20, DRY-001:10"`), the schema decomposes items into the discrete entity `sales_order_item`, where each row contains single atomic values (`quantity`, `unit_price`, `subtotal`).
- **Result:** The database satisfies 1NF unconditionally.

### Second Normal Form (2NF)
**Requirement:** The relation must be in 1NF, and every non-prime attribute must be fully functionally dependent on the primary key (no partial dependencies on a subset of a composite candidate key).
- **Decomposition Proof:** 
  In the M:N supplier mapping relation `product_supplier`, the candidate key is composite: $(\text{product\_id}, \text{supplier\_id})$.
  - Attributes `supply_price`, `lead_time_days`, and `is_preferred` depend strictly on both the product and supplier together:
    $$(\text{product\_id}, \text{supplier\_id}) \rightarrow \text{supply\_price}$$
  - Supplier metadata (`name`, `contact_name`, `email`) and product metadata (`name`, `sku`) were extracted into their own relations `supplier` and `product`. They are NOT duplicated inside `product_supplier`.
- **Result:** All partial dependencies are eliminated; the schema satisfies 2NF.

### Third Normal Form (3NF)
**Requirement:** The relation must be in 2NF, and no non-prime attribute may be transitively dependent on any candidate key (no $X \rightarrow Y$ and $Y \rightarrow Z$ where $Z$ is non-prime and $Y$ is not a superkey).
- **Decomposition Proof:**
  - In an unnormalized system, storing customer shipping details and contact information directly inside `sales_order` creates a transitive dependency:
    $$\text{order\_id} \rightarrow \text{customer\_id} \rightarrow \text{company\_name, email, phone}$$
  - In this schema, `customer` is isolated in its own relation. `sales_order` references only `customer_id` as a foreign key.
  - Similarly, product category name is factored into `category`, eliminating:
    $$\text{product\_id} \rightarrow \text{category\_id} \rightarrow \text{category\_name}$$
- **Result:** All transitive dependencies are removed; the schema satisfies 3NF.

---

## 4. Justification of Intentional Denormalization (Stored Summary Totals)

In standard strict 3NF theory, derived values such as `sales_order.total_amount`, `sales_order_item.subtotal`, and `invoice.total_amount` could theoretically be computed on-the-fly via `SUM(quantity * unit_price)`.

However, in financial and wholesale accounting, storing these values is an **intentional, mission-critical engineering design**:

1. **Temporal Immutability (Price Lock):**
   When an order and invoice are finalized, the `unit_price`, `subtotal`, and `total_amount` must represent the legal agreed financial contract at the exact moment of purchase. If catalogue prices or tax rates change later, recalculating on-the-fly would retroactively corrupt past historical audits and accounting books.
2. **ACID Transaction Performance:**
   High-frequency reporting queries (e.g. monthly revenue, accounts receivable aging, customer spend) can query `sales_order` or `invoice` without performing expensive multi-table joins and aggregation scans across millions of line item rows.
3. **Data Integrity Enforcement via Procedures & Triggers:**
   Consistency of stored derived fields is guaranteed by database-level triggers (`trg_sales_order_item_before_insert`) and the stored procedure `sp_finalize_order(order_id)`.
