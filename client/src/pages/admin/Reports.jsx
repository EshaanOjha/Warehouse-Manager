import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('top-products');
  const [topProducts, setTopProducts] = useState([]);
  const [monthlySales, setMonthlySales] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [supplierComparison, setSupplierComparison] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const [topRes, monthRes, unpaidRes, supRes] = await Promise.all([
        api.get('/admin/reports/top-products'),
        api.get('/admin/reports/monthly-sales'),
        api.get('/admin/reports/unpaid'),
        api.get('/admin/reports/supplier-comparison')
      ]);
      setTopProducts(topRes.data);
      setMonthlySales(monthRes.data);
      setUnpaidInvoices(unpaidRes.data);
      setSupplierComparison(supRes.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Generating analytical reports...</p></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Business Intelligence & SQL Analytical Reports</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Real-time reports derived from SQL Views with aggregations, multi-table joins, and aging formulas.
          </p>
        </div>
        <button className="btn btn-sm" onClick={() => window.print()}>
          Print Report
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button 
          className={`btn ${activeTab === 'top-products' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('top-products')}
        >
          Top Selling Products
        </button>
        <button 
          className={`btn ${activeTab === 'monthly-sales' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('monthly-sales')}
        >
          Monthly Revenue & Growth
        </button>
        <button 
          className={`btn ${activeTab === 'unpaid' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('unpaid')}
        >
          Unpaid Invoices & Aging
        </button>
        <button 
          className={`btn ${activeTab === 'supplier-comp' ? 'btn-primary' : ''}`}
          onClick={() => setActiveTab('supplier-comp')}
        >
          Supplier Cost & Margin Comparison
        </button>
      </div>

      {/* Report 1: Top Products View */}
      {activeTab === 'top-products' && (
        <div className="card">
          <h3>Top Selling Products (v_top_products)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 14 }}>
            Aggregates total quantity sold and revenue generated across all confirmed sales orders.
          </p>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Total Units Sold</th>
                  <th>Gross Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, idx) => (
                  <tr key={p.product_id}>
                    <td><strong>#{idx + 1}</strong></td>
                    <td><strong>{p.product_name}</strong></td>
                    <td>{p.sku}</td>
                    <td>{p.category_name}</td>
                    <td>{p.total_units_sold} units</td>
                    <td><strong>${Number(p.total_revenue_generated).toFixed(2)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: Monthly Sales Performance */}
      {activeTab === 'monthly-sales' && (
        <div className="card">
          <h3>Monthly Sales Performance (v_monthly_sales)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 14 }}>
            Grouped by calendar month, tracking wholesale volume, subtotal, and tax collected.
          </p>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Total Orders Placed</th>
                  <th>Gross Subtotal</th>
                  <th>Tax Collected</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {monthlySales.map(m => (
                  <tr key={m.sales_month}>
                    <td><strong>{m.sales_month}</strong></td>
                    <td>{m.total_orders} orders</td>
                    <td>${Number(m.gross_subtotal).toFixed(2)}</td>
                    <td>${Number(m.total_tax).toFixed(2)}</td>
                    <td><strong style={{ color: 'var(--success)' }}>${Number(m.total_revenue).toFixed(2)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: Unpaid & Overdue Invoices */}
      {activeTab === 'unpaid' && (
        <div className="card">
          <h3>Unpaid & Overdue Invoices (v_unpaid_invoices)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 14 }}>
            Tracks outstanding customer balances, due dates, and dynamically calculated aging (DATEDIFF).
          </p>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer / Company</th>
                  <th>Phone / Email</th>
                  <th>Total Outstanding</th>
                  <th>Invoice Date</th>
                  <th>Due Date</th>
                  <th>Days Overdue</th>
                  <th>Aging Category</th>
                </tr>
              </thead>
              <tbody>
                {unpaidInvoices.map(inv => (
                  <tr key={inv.invoice_id} style={{ background: inv.aging_category === 'OVERDUE' ? '#fee2e2' : 'inherit' }}>
                    <td><strong>{inv.invoice_number}</strong></td>
                    <td>{inv.company_name}</td>
                    <td>{inv.phone || inv.email}</td>
                    <td><strong>${Number(inv.total_amount).toFixed(2)}</strong></td>
                    <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                    <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                    <td>
                      {inv.days_overdue > 0 ? (
                        <strong style={{ color: 'var(--danger)' }}>+{inv.days_overdue} days</strong>
                      ) : (
                        <span>{inv.days_overdue} days</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${inv.aging_category === 'OVERDUE' ? 'badge-danger' : 'badge-warning'}`}>
                        {inv.aging_category}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 4: Supplier Price & Margin Comparison */}
      {activeTab === 'supplier-comp' && (
        <div className="card">
          <h3>Supplier Cost & Profit Margin Comparison (v_supplier_comparison)</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 14 }}>
            Compares purchasing costs across competing suppliers against wholesale base selling price to compute unit margins.
          </p>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Selling Price</th>
                  <th>Supplier Name</th>
                  <th>Supply Price</th>
                  <th>Unit Profit Margin</th>
                  <th>Margin %</th>
                  <th>Lead Time</th>
                  <th>Preferred</th>
                </tr>
              </thead>
              <tbody>
                {supplierComparison.map((s, idx) => (
                  <tr key={idx}>
                    <td><strong>{s.product_name}</strong></td>
                    <td>{s.sku}</td>
                    <td>${Number(s.warehouse_selling_price).toFixed(2)}</td>
                    <td>{s.supplier_name}</td>
                    <td>${Number(s.supply_price).toFixed(2)}</td>
                    <td><strong>${Number(s.unit_margin).toFixed(2)}</strong></td>
                    <td>
                      <span className="badge badge-success">
                        {s.margin_pct}%
                      </span>
                    </td>
                    <td>{s.lead_time_days} days</td>
                    <td>{s.is_preferred ? '⭐ Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
