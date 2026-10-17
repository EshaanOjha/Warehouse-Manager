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
      setActionMessage(res.data.message || `Manifest #${orderId} status updated to ${newStatus}.`);
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
      setActionMessage(res.data.message || 'Invoice status marked as PAID in accounts ledger.');
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
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            DELIVERED
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 border border-blue-300 font-mono text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            IN TRANSIT
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-300 font-mono text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
            CONFIRMED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-rose-100 text-rose-800 border border-rose-300 font-mono text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px] font-bold">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-[12px] text-slate-500">
        <span className="material-symbols-outlined animate-spin mr-2 text-blue-600">sync</span>
        Synchronizing customer sales manifests &amp; billing ledgers...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full font-mono">
      {/* Top Command & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-md bg-white p-3.5 rounded-sm border border-slate-300 shadow-sm">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-headline-lg text-[18px] text-slate-900 font-bold tracking-tight uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-700 text-[20px]">local_shipping</span>
              Wholesale Sales Manifests &amp; Invoice Billing Desk
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px] font-bold">
              {orders.length} ORDERS · {invoices.length} INVOICES
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>DISPATCH CONTROLLER: <strong className="text-slate-900">NEWARK CENTRAL [WH-02]</strong></span>
            <span>·</span>
            <span>SETTLEMENT: <strong className="text-slate-900 font-bold bg-slate-200/80 px-1 py-0.5 rounded">NET 30 CREDIT AGREEMENTS</strong></span>
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-sm border border-slate-300 text-[11px]">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1 rounded-sm font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-blue-600">local_shipping</span>
            <span>Sales Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1 rounded-sm font-bold flex items-center gap-1 transition-colors cursor-pointer ${
              activeTab === 'invoices'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-emerald-600">receipt_long</span>
            <span>Commercial Invoices ({invoices.length})</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div className="mb-space-md p-3 rounded-sm bg-emerald-950 text-emerald-200 border border-emerald-700 flex items-center justify-between font-mono text-[12px] shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
            <span>{actionMessage}</span>
          </div>
        </div>
      )}

      {actionError && (
        <div className="mb-space-md p-3 rounded-sm bg-rose-950 text-rose-200 border border-rose-700 flex items-center justify-between font-mono text-[12px] shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-rose-400">error</span>
            <span>{actionError}</span>
          </div>
        </div>
      )}

      {/* Database Trigger Automation Banner */}
      <div className="bg-slate-900 text-slate-200 rounded-sm p-3 border border-slate-700 shadow-sm mb-space-md text-[11px] flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-amber-400 text-[18px]">bolt</span>
          <span>
            <strong className="text-white">DATABASE TRIGGER ENGINE:</strong> Marking status as <strong className="text-emerald-400">DELIVERED</strong> triggers <code className="bg-slate-800 px-1 py-0.2 rounded text-emerald-300 border border-emerald-900">trg_sales_order_after_update</code>, populating the customer's retail store inventory automatically.
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">
          ACID TRANSACTION SAFE
        </span>
      </div>

      {activeTab === 'orders' ? (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase tracking-wider h-9 border-b border-slate-300 font-bold">
                  <th className="px-space-md py-1">MANIFEST #</th>
                  <th className="px-space-md py-1">RETAIL CUSTOMER</th>
                  <th className="px-space-md py-1">ORDER DATE</th>
                  <th className="px-space-md py-1">ITEMS / UNITS</th>
                  <th className="px-space-md py-1 text-right">TOTAL AMOUNT</th>
                  <th className="px-space-md py-1 text-center">CURRENT STATUS</th>
                  <th className="px-space-md py-1">BILL OF LADING</th>
                  <th className="px-space-md py-1 text-right">DISPATCH OPERATIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
                {orders.map(o => (
                  <tr key={o.order_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-space-md py-3 font-bold text-blue-700">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300">
                        #{String(o.order_id).padStart(5, '0')}
                      </span>
                    </td>
                    <td className="px-space-md py-3 font-bold text-slate-900">
                      {o.company_name}
                    </td>
                    <td className="px-space-md py-3 text-slate-600 text-[11px]">
                      {new Date(o.order_date).toLocaleDateString()}
                    </td>
                    <td className="px-space-md py-3 text-slate-700">
                      {o.total_items} items ({o.total_units} units)
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums font-bold text-slate-900 text-[13px]">
                      ${Number(o.total_amount).toFixed(2)}
                    </td>
                    <td className="px-space-md py-3 text-center">
                      {getStatusBadge(o.status)}
                    </td>
                    <td className="px-space-md py-3">
                      {o.invoice_number ? (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-bold">
                          {o.invoice_number} ({o.invoice_status})
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">PENDING</span>
                      )}
                    </td>
                    <td className="px-space-md py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => viewOrderDetails(o.order_id)}
                          className="h-7 px-2 rounded-sm bg-white hover:bg-slate-100 text-slate-800 font-mono text-[11px] font-bold border border-slate-300 shadow-sm transition-colors cursor-pointer"
                          title="Inspect Line Items"
                        >
                          Inspect
                        </button>

                        {o.status === 'CONFIRMED' && (
                          <button
                            onClick={() => updateOrderStatus(o.order_id, 'SHIPPED')}
                            className="h-7 px-2.5 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[11px] font-bold border border-blue-900 shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[13px]">local_shipping</span>
                            Ship
                          </button>
                        )}

                        {o.status === 'SHIPPED' && (
                          <button
                            onClick={() => updateOrderStatus(o.order_id, 'DELIVERED')}
                            className="h-7 px-2.5 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-[11px] font-bold border border-emerald-900 shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                            title="Fires trigger to credit customer store inventory"
                          >
                            <span className="material-symbols-outlined text-[13px]">task_alt</span>
                            Deliver
                          </button>
                        )}

                        {['CONFIRMED', 'SHIPPED'].includes(o.status) && (
                          <button
                            onClick={() => updateOrderStatus(o.order_id, 'CANCELLED')}
                            className="h-7 px-2 rounded-sm bg-white hover:bg-rose-50 text-rose-700 hover:border-rose-300 font-mono text-[11px] font-bold border border-slate-300 transition-colors cursor-pointer"
                            title="Cancels and restores warehouse stock"
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
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase tracking-wider h-9 border-b border-slate-300 font-bold">
                  <th className="px-space-md py-1">INVOICE #</th>
                  <th className="px-space-md py-1">CUSTOMER</th>
                  <th className="px-space-md py-1">ORDER REF</th>
                  <th className="px-space-md py-1">INVOICE DATE</th>
                  <th className="px-space-md py-1">NET DUE DATE</th>
                  <th className="px-space-md py-1 text-right">TOTAL AMOUNT</th>
                  <th className="px-space-md py-1 text-center">SETTLEMENT STATUS</th>
                  <th className="px-space-md py-1 text-right">RECONCILIATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
                {invoices.map(inv => (
                  <tr key={inv.invoice_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-space-md py-3 font-bold text-slate-900">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono">
                        {inv.invoice_number}
                      </span>
                    </td>
                    <td className="px-space-md py-3 font-bold text-slate-900">
                      {inv.company_name}
                    </td>
                    <td className="px-space-md py-3 font-mono text-[11px] text-blue-700">
                      #{String(inv.order_id).padStart(5, '0')}
                    </td>
                    <td className="px-space-md py-3 text-slate-600 text-[11px]">
                      {new Date(inv.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-space-md py-3 text-slate-600 text-[11px]">
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums font-bold text-slate-900 text-[13px]">
                      ${Number(inv.total_amount).toFixed(2)}
                    </td>
                    <td className="px-space-md py-3 text-center">
                      {inv.payment_status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          SETTLED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                          UNPAID
                        </span>
                      )}
                    </td>
                    <td className="px-space-md py-3 text-right">
                      {inv.payment_status === 'UNPAID' ? (
                        <button
                          onClick={() => markInvoicePaid(inv.invoice_id)}
                          className="h-7 px-2.5 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-[11px] font-bold border border-emerald-900 shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[13px]">paid</span>
                          Mark as Paid
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">
                          Paid {inv.paid_date ? new Date(inv.paid_date).toLocaleDateString() : ''}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Order Line Items Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white rounded-sm border border-slate-300 shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in font-mono"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#0d1520] text-white p-4 border-b border-[#202e42] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">receipt</span>
                <span className="font-bold text-[14px] uppercase tracking-tight">
                  Sales Order Manifest #{String(selectedOrder.order_id).padStart(5, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedOrder.status)}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
              <div>
                Customer: <strong className="text-slate-900">{selectedOrder.company_name}</strong>
              </div>
              <div>
                Dispatched Date: <strong className="text-slate-900">{new Date(selectedOrder.order_date).toLocaleString()}</strong>
              </div>
              <div className="w-full text-slate-500">
                Delivery Bay / Shipping Address: <span className="text-slate-800">{selectedOrder.shipping_address || 'Default Registered Warehouse Bay'}</span>
              </div>
            </div>

            <div className="p-4 max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider h-7 border-b border-slate-300 font-bold">
                    <th className="px-2 py-1">SKU</th>
                    <th className="px-2 py-1">PRODUCT SPEC</th>
                    <th className="px-2 py-1 text-center">QUANTITY</th>
                    <th className="px-2 py-1 text-right">TIER UNIT PRICE</th>
                    <th className="px-2 py-1 text-right">LINE SUB-TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-900">
                  {selectedOrder.items?.map(it => (
                    <tr key={it.item_id} className="hover:bg-slate-50">
                      <td className="px-2 py-2 font-bold text-slate-800">{it.sku}</td>
                      <td className="px-2 py-2">{it.product_name}</td>
                      <td className="px-2 py-2 text-center font-bold">{it.quantity} {it.unit_of_measure}</td>
                      <td className="px-2 py-2 text-right tabular-nums">${Number(it.unit_price).toFixed(2)}</td>
                      <td className="px-2 py-2 text-right tabular-nums font-bold text-blue-700">
                        ${Number(it.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-300 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Subtotal: <strong className="text-slate-900">${Number(selectedOrder.subtotal).toFixed(2)}</strong> · Tax: <strong className="text-slate-900">${Number(selectedOrder.tax_amount).toFixed(2)}</strong>
              </div>
              <div className="text-[15px] font-bold text-slate-900">
                Grand Total: <span className="text-blue-700 tabular-nums">${Number(selectedOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
