import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><p>Loading dashboard metrics...</p></div>;

  return (
    <div className="container">
      <h2>Warehouse & Operations Dashboard</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
        Overview of warehouse inventory levels, pending customer orders, and financial receipts.
      </p>

      {/* Top Stat Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            ${Number(data?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <small style={{ color: 'var(--text-muted)' }}>From confirmed/delivered orders</small>
        </div>

        <div className="stat-card">
          <div className="stat-label">Low Stock Alerts</div>
          <div className="stat-value" style={{ color: data?.lowStockCount > 0 ? 'var(--danger)' : 'inherit' }}>
            {data?.lowStockCount || 0}
          </div>
          <Link to="/admin/purchase-orders" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
            Restock via cheapest supplier →
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending / Confirmed Orders</div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {data?.pendingOrders || 0}
          </div>
          <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>
            Fulfill and ship orders →
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-label">Unpaid Invoices</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            {data?.unpaidInvoicesCount || 0}
          </div>
          <small style={{ color: 'var(--text-muted)' }}>
            Total: ${Number(data?.unpaidInvoicesTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </small>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <strong>Quick Operations:</strong>
        <Link to="/admin/purchase-orders" className="btn btn-sm btn-primary">
          + Create Purchase Order
        </Link>
        <Link to="/admin/products" className="btn btn-sm">
          + Add New Product
        </Link>
        <Link to="/admin/suppliers" className="btn btn-sm">
          Manage Suppliers
        </Link>
        <Link to="/admin/reports" className="btn btn-sm">
          View Financial Reports
        </Link>
      </div>

      {/* Recent Orders Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Recent Customer Orders</h3>
          <Link to="/admin/orders" style={{ fontSize: '0.9rem' }}>
            View all orders →
          </Link>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer / Company</th>
                <th>Date</th>
                <th>Units</th>
                <th>Total</th>
                <th>Status</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentOrders?.map(o => (
                <tr key={o.order_id}>
                  <td><strong>#{o.order_id}</strong></td>
                  <td>{o.company_name}</td>
                  <td>{new Date(o.order_date).toLocaleDateString()}</td>
                  <td>{o.total_units} units</td>
                  <td><strong>${Number(o.total_amount).toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge ${
                      o.status === 'DELIVERED' ? 'badge-success' :
                      o.status === 'SHIPPED' ? 'badge-info' :
                      o.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${o.invoice_status === 'PAID' ? 'badge-success' : 'badge-danger'}`}>
                      {o.invoice_status || 'UNPAID'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
