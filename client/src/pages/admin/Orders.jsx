import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'invoices'
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordRes, invRes] = await Promise.all([
        api.get('/admin/orders'),
        api.get('/admin/invoices')
      ]);
      setOrders(ordRes.data);
      setInvoices(invRes.data);
    } catch (err) {
      console.error('Error fetching admin orders data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setActionMessage('');
    setActionError('');
    try {
      const res = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      setActionMessage(res.data.message || `Order #${orderId} updated to ${newStatus}.`);
      fetchData();
      if (selectedOrder && selectedOrder.order_id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update order status.');
    }
  };

  const markInvoicePaid = async (invoiceId) => {
    setActionMessage('');
    setActionError('');
    try {
      const res = await api.patch(`/admin/invoices/${invoiceId}/paid`);
      setActionMessage(res.data.message || 'Invoice marked as PAID.');
      fetchData();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to mark invoice as paid.');
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error('Error fetching order details:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED': return <span className="badge badge-success">Delivered</span>;
      case 'SHIPPED': return <span className="badge badge-info">Shipped</span>;
      case 'CONFIRMED': return <span className="badge badge-warning">Confirmed</span>;
      case 'CANCELLED': return <span className="badge badge-danger">Cancelled</span>;
      default: return <span className="badge badge-secondary">{status}</span>;
    }
  };

  if (loading) return <div className="container"><p>Loading orders...</p></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Customer Sales Orders & Invoices</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Fulfill wholesale orders, update shipment lifecycle, and reconcile customer payments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Sales Orders ({orders.length})
          </button>
          <button 
            className={`btn ${activeTab === 'invoices' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('invoices')}
          >
            Invoices ({invoices.length})
          </button>
        </div>
      </div>

      {actionMessage && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          {actionError}
        </div>
      )}

      {/* Info card highlighting syllabus triggers */}
      <div className="card" style={{ background: '#eff6ff', borderColor: '#bfdbfe', fontSize: '0.85rem' }}>
        <strong>⚡ Database Trigger Automation:</strong>
        <ul style={{ marginLeft: 20, marginTop: 4 }}>
          <li>Changing status to <strong>DELIVERED</strong> executes <code>trg_sales_order_after_update</code>, populating the customer's personal inventory with the delivered stock.</li>
          <li>Changing status to <strong>CANCELLED</strong> restores warehouse stock levels and logs a stock reversal movement.</li>
        </ul>
      </div>

      {activeTab === 'orders' ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Order Date</th>
                <th>Items / Units</th>
                <th>Total</th>
                <th>Current Status</th>
                <th>Invoice</th>
                <th>Lifecycle Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.order_id}>
                  <td><strong>#{o.order_id}</strong></td>
                  <td>{o.company_name}</td>
                  <td>{new Date(o.order_date).toLocaleDateString()}</td>
                  <td>{o.total_items} items ({o.total_units} units)</td>
                  <td><strong>${Number(o.total_amount).toFixed(2)}</strong></td>
                  <td>{getStatusBadge(o.status)}</td>
                  <td>
                    {o.invoice_number ? (
                      <span className="badge badge-secondary">{o.invoice_number} ({o.invoice_status})</span>
                    ) : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        className="btn btn-sm"
                        onClick={() => viewOrderDetails(o.order_id)}
                      >
                        Inspect
                      </button>

                      {o.status === 'CONFIRMED' && (
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => updateOrderStatus(o.order_id, 'SHIPPED')}
                        >
                          Ship Order
                        </button>
                      )}

                      {o.status === 'SHIPPED' && (
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => updateOrderStatus(o.order_id, 'DELIVERED')}
                          title="Triggers customer inventory stock update"
                        >
                          Mark Delivered
                        </button>
                      )}

                      {['CONFIRMED', 'SHIPPED'].includes(o.status) && (
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => updateOrderStatus(o.order_id, 'CANCELLED')}
                          title="Triggers warehouse stock restoration"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Order #</th>
                <th>Invoice Date</th>
                <th>Due Date</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.invoice_id}>
                  <td><strong>{inv.invoice_number}</strong></td>
                  <td>{inv.company_name}</td>
                  <td>#{inv.order_id}</td>
                  <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                  <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                  <td><strong>${Number(inv.total_amount).toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge ${inv.payment_status === 'PAID' ? 'badge-success' : 'badge-danger'}`}>
                      {inv.payment_status}
                    </span>
                  </td>
                  <td>
                    {inv.payment_status === 'UNPAID' ? (
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => markInvoicePaid(inv.invoice_id)}
                      >
                        Mark as Paid
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Paid {inv.paid_date ? new Date(inv.paid_date).toLocaleDateString() : ''}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inspect Order Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3>Order #{selectedOrder.order_id}</h3>
              {getStatusBadge(selectedOrder.status)}
            </div>

            <p style={{ fontSize: '0.9rem', marginBottom: 4 }}>
              <strong>Customer:</strong> {selectedOrder.company_name}
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              Shipping Address: {selectedOrder.shipping_address || 'Standard Registered Address'}
            </p>

            <table style={{ marginBottom: 16 }}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map(it => (
                  <tr key={it.item_id}>
                    <td>{it.product_name}</td>
                    <td>{it.sku}</td>
                    <td>{it.quantity} {it.unit_of_measure}</td>
                    <td>${Number(it.unit_price).toFixed(2)}</td>
                    <td>${Number(it.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <p>Subtotal: ${Number(selectedOrder.subtotal).toFixed(2)}</p>
              <p>Tax (5%): ${Number(selectedOrder.tax_amount).toFixed(2)}</p>
              <h4>Total: ${Number(selectedOrder.total_amount).toFixed(2)}</h4>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
              <button className="btn" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
