import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/customer/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const res = await api.get(`/customer/orders/${orderId}`);
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
            PROCESSING
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

  const filteredOrders = orders.filter(o => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-[12px] text-slate-500">
        <span className="material-symbols-outlined animate-spin mr-2 text-blue-600">sync</span>
        Synchronizing dispatch manifests from Newark WH-02...
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
              Dispatch &amp; Freight Manifests
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px] font-bold">
              {orders.length} TOTAL MANIFESTS
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>TERMINAL: <strong className="text-slate-900">NEWARK CENTRAL [WH-02]</strong></span>
            <span>·</span>
            <span>SETTLEMENT: <strong className="text-slate-900 font-bold bg-slate-200/80 px-1 py-0.5 rounded">NET 30 INVOICING</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <Link
            to="/customer/products"
            className="h-8 px-3 rounded-sm bg-slate-900 hover:bg-slate-800 text-white font-mono text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-400">add</span>
            New Order Draft
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-sm border border-slate-300 p-2 shadow-sm mb-space-md flex flex-wrap items-center gap-2 text-[11px]">
        {['ALL', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1 rounded-sm font-bold uppercase transition-colors cursor-pointer border ${
              statusFilter === tab
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {tab}
            <span className="ml-1.5 px-1 py-0.2 bg-slate-200 text-slate-800 rounded text-[9px]">
              {tab === 'ALL' ? orders.length : orders.filter(o => o.status === tab).length}
            </span>
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 mb-3">
            <span className="material-symbols-outlined text-[28px]">receipt_long</span>
          </div>
          <h3 className="font-headline-sm text-slate-900 text-[16px] font-bold mb-1">
            No Manifests Found
          </h3>
          <p className="text-slate-500 text-[12px] max-w-sm mb-4">
            {statusFilter === 'ALL' 
              ? 'No wholesale order transactions recorded yet for this terminal.' 
              : `No manifests matching status "${statusFilter}".`}
          </p>
          <Link
            to="/customer/products"
            className="h-8 px-3 rounded-sm bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold flex items-center gap-1.5 border border-blue-800 shadow-sm"
          >
            <span className="material-symbols-outlined text-[15px]">shelves</span>
            Open Products Catalogue
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase tracking-wider h-9 border-b border-slate-300 font-bold">
                  <th className="px-space-md py-1">MANIFEST #</th>
                  <th className="px-space-md py-1">DISPATCH DATE</th>
                  <th className="px-space-md py-1">SKU LINES</th>
                  <th className="px-space-md py-1 text-right">TOTAL UNITS</th>
                  <th className="px-space-md py-1 text-right">TOTAL AMOUNT</th>
                  <th className="px-space-md py-1 text-center">DISPATCH STATUS</th>
                  <th className="px-space-md py-1">BILL OF LADING / INVOICE</th>
                  <th className="px-space-md py-1 text-right">OPERATIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
                {filteredOrders.map(o => (
                  <tr key={o.order_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-space-md py-3 font-bold text-slate-900">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-blue-700">
                        #{String(o.order_id).padStart(5, '0')}
                      </span>
                    </td>
                    <td className="px-space-md py-3 text-slate-600 text-[11px]">
                      {new Date(o.order_date).toLocaleDateString()} {new Date(o.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-space-md py-3">
                      <span className="font-semibold text-slate-800">{o.total_items} items</span>
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums text-slate-700">
                      {o.total_units} units
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums font-bold text-slate-900 text-[13px]">
                      ${Number(o.total_amount).toFixed(2)}
                    </td>
                    <td className="px-space-md py-3 text-center">
                      {getStatusBadge(o.status)}
                    </td>
                    <td className="px-space-md py-3">
                      {o.invoice_number ? (
                        <Link 
                          to="/customer/receipts"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-[10px] font-bold transition-colors"
                        >
                          <span className="material-symbols-outlined text-[13px] text-blue-600">receipt</span>
                          {o.invoice_number}
                        </Link>
                      ) : (
                        <span className="text-[10px] text-slate-400">PENDING INVOICE</span>
                      )}
                    </td>
                    <td className="px-space-md py-3 text-right">
                      <button
                        onClick={() => viewOrderDetails(o.order_id)}
                        className="h-7 px-2.5 rounded-sm bg-white hover:bg-slate-100 text-slate-800 font-mono text-[11px] font-bold border border-slate-300 shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">visibility</span>
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manifest Items Inspection Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white rounded-sm border border-slate-300 shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#0d1520] text-white p-4 border-b border-[#202e42] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-[20px]">local_shipping</span>
                <span className="font-headline-sm text-[15px] font-bold uppercase tracking-tight">
                  Manifest Inspection #{String(selectedOrder.order_id).padStart(5, '0')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedOrder.status)}
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-7 h-7 rounded-sm flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Meta Details */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-2">
              <div>
                <span>Date: <strong className="text-slate-900">{new Date(selectedOrder.order_date).toLocaleString()}</strong></span>
              </div>
              <div>
                <span>Facility: <strong className="text-slate-900">WH-02 Newark Central Depot</strong></span>
              </div>
              {selectedOrder.notes && (
                <div className="w-full mt-1 p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                  <strong>Receiving Notes:</strong> {selectedOrder.notes}
                </div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="p-4 max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 uppercase tracking-wider h-7 border-b border-slate-300 font-bold">
                    <th className="px-2 py-1">SKU / PRODUCT SPEC</th>
                    <th className="px-2 py-1 text-center">QUANTITY</th>
                    <th className="px-2 py-1 text-right">UNIT PRICE</th>
                    <th className="px-2 py-1 text-right">SUBTOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-900">
                  {selectedOrder.items?.map(item => (
                    <tr key={item.item_id} className="hover:bg-slate-50">
                      <td className="px-2 py-2">
                        <div className="font-bold text-slate-900">{item.product_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">SKU: {item.sku}</div>
                      </td>
                      <td className="px-2 py-2 text-center font-bold">
                        {item.quantity} {item.unit_of_measure}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums">
                        ${Number(item.unit_price).toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-right tabular-nums font-bold text-blue-700">
                        ${Number(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Financial Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-300 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Settled under Net 30 Terms · Triggered by <code className="text-slate-700">sp_finalize_order</code>
              </div>
              <div className="flex flex-col text-right">
                <div className="text-[11px] text-slate-600">
                  Subtotal: <strong className="text-slate-900">${Number(selectedOrder.subtotal).toFixed(2)}</strong> · Tax: <strong className="text-slate-900">${Number(selectedOrder.tax_amount).toFixed(2)}</strong>
                </div>
                <div className="text-[15px] font-bold text-slate-900">
                  Total Settlement: <span className="text-blue-700 tabular-nums">${Number(selectedOrder.total_amount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
