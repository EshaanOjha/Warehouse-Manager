# Wholesale Management System

An end-to-end relational database management system (RDBMS) for wholesale warehouse operations and B2B customer stock tracking.

Built for **CSC2103: Relational Database Management Systems** (Manipal University Jaipur).

---

## Quick Start Guide

### 1. Prerequisites
- Docker & Docker Compose
- Node.js (v18+) & npm

### 2. Start MySQL 8.0 via Docker Compose
From the project root:
```bash
docker compose up -d
```
MySQL will be running on `localhost:3306` with database `wholesale_db` initialized with all 16 tables, constraints, functions, triggers, procedures, views, and seed data.

### 3. Start Backend Server
```bash
cd server
npm install
npm run dev
```
Backend runs at `http://localhost:5001`.

### 4. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
Frontend runs at `http://localhost:3000`.

---

## Pre-Configured Demo Credentials

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin` | `admin123` |
| **Customer** | `urban_grocers` | `password123` |
| **Customer** | `metro_mart` | `password123` |
| **Customer** | `green_valley` | `password123` |

---

## Project Structure

```
Wholesale_Manager/
├── docker-compose.yml           # MySQL 8.0 container setup
├── database/
│   ├── schema.sql               # 16 tables, constraints, triggers, procedures, views
│   ├── seed.sql                 # 32 products, 10 customers, 6 suppliers, orders
│   └── explain_analysis.sql     # Indexing performance & EXPLAIN ANALYZE demonstration
├── docs/
│   ├── er_diagram.md            # Mermaid ER Diagram & relational mappings
│   ├── normalization_report.md  # Formal 1NF -> 3NF decomposition proofs
│   └── project_report.md        # Comprehensive report & viva demo walkthrough script
├── server/                      # Node.js + Express backend
│   └── src/
│       ├── db.js                # mysql2 connection pool
│       ├── middleware/auth.js   # JWT authentication & role authorization
│       ├── routes/auth.js       # Login and current user profile
│       ├── routes/customer.js   # Catalogue, atomic order placement, inventory, usage, alerts
│       └── routes/admin.js      # Dashboard, products, suppliers, orders, POs, BI reports
└── client/                      # React (Vite) frontend with clean, plain UI
    └── src/
        ├── context/AuthContext.jsx
        ├── components/          # Navbar, AlertBell (30s polling)
        └── pages/               # Customer and Admin dashboards, catalogue, receipts, inventory
```
