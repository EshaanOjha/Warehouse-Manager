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
        Loading warehouse operations metrics...
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
              <span className="material-symbols-outlined text-blue-700 text-[20px]">dashboard</span>
              Warehouse Operations &amp; Dispatch Desk
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Central Depot WH-02 Online
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>OPERATOR ROLE: <strong className="text-slate-900 font-bold bg-slate-200/80 px-1 py-0.5 rounded">ROOT DISPATCH ADMIN</strong></span>
            <span>·</span>
            <span>SYSTEM AUDIT: <strong className="text-slate-900">ACID TRANSACTIONS ACTIVE</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <Link
            to="/admin/purchase-orders"
            className="h-8 px-3 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1.5 border border-blue-900"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            New Restock PO
          </Link>
        </div>
      </div>

      {/* 4 KPI Operational Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-md">
        {/* Card 1: Total Revenue */}
        <div className="bg-white rounded-sm border border-slate-300 p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Gross Wholesale Revenue</span>
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">payments</span>
          </div>
          <div>
            <div className="text-[22px] font-bold text-slate-900 tabular-nums leading-tight">
              ${Number(data?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              From confirmed &amp; delivered manifests
            </div>
          </div>
        </div>

        {/* Card 2: Low Stock Alerts */}
        <div className={`bg-white rounded-sm border p-space-md shadow-sm flex flex-col justify-between ${
          (data?.lowStockCount || 0) > 0 ? 'border-amber-400 bg-amber-50/20' : 'border-slate-300'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Depot Low-Stock Items</span>
            <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
          </div>
          <div>
            <div className={`text-[22px] font-bold tabular-nums leading-tight ${
              (data?.lowStockCount || 0) > 0 ? 'text-amber-800' : 'text-slate-900'
            }`}>
              {data?.lowStockCount || 0} <span className="text-[12px] font-normal text-slate-500">SKUs</span>
            </div>
            <Link
              to="/admin/purchase-orders"
              className="text-[10px] text-blue-700 hover:underline font-bold mt-1 inline-flex items-center gap-1"
            >
              Reorder via lowest supplier →
            </Link>
          </div>
        </div>

        {/* Card 3: Processing Orders */}
        <div className="bg-white rounded-sm border border-slate-300 p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Orders In Queue</span>
            <span className="material-symbols-outlined text-blue-600 text-[18px]">pending_actions</span>
          </div>
          <div>
            <div className="text-[22px] font-bold text-slate-900 tabular-nums leading-tight">
              {data?.pendingOrders || 0} <span className="text-[12px] font-normal text-slate-500">Active</span>
            </div>
            <Link
              to="/admin/orders"
              className="text-[10px] text-blue-700 hover:underline font-bold mt-1 inline-flex items-center gap-1"
            >
              Fulfill &amp; dispatch manifests →
            </Link>
          </div>
        </div>

        {/* Card 4: Unpaid Invoices */}
        <div className="bg-white rounded-sm border border-slate-300 p-space-md shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Net 30 Receivables</span>
            <span className="material-symbols-outlined text-purple-600 text-[18px]">receipt_long</span>
          </div>
          <div>
            <div className="text-[22px] font-bold text-slate-900 tabular-nums leading-tight">
              ${Number(data?.unpaidInvoicesTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Across <strong className="text-slate-800">{data?.unpaidInvoicesCount || 0}</strong> open invoices
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="bg-white rounded-sm border border-slate-300 p-3 shadow-sm mb-space-md flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px] text-blue-700">bolt</span>
            Quick Portals:
          </span>
          <Link
            to="/admin/products"
            className="px-2.5 py-1 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px] text-emerald-600">shelves</span>
            Manage Products &amp; Tiers
          </Link>
          <Link
            to="/admin/suppliers"
            className="px-2.5 py-1 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px] text-amber-600">handshake</span>
            Suppliers &amp; Supply Matrix
          </Link>
          <Link
            to="/admin/reports"
            className="px-2.5 py-1 rounded-sm bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-300 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px] text-purple-600">query_stats</span>
            SQL Analytics &amp; Views
          </Link>
        </div>

        <span className="text-[10px] text-slate-500">
          Database: <code className="bg-slate-100 px-1 py-0.2 rounded text-slate-800">wholesale_db</code>
        </span>
      </div>

      {/* Recent Orders Log Table */}
      <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-slate-100 px-space-md py-2.5 border-b border-slate-300 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-blue-700">list_alt</span>
            Recent Wholesale Orders Log
          </span>
          <Link
            to="/admin/orders"
            className="text-[11px] text-blue-700 hover:underline font-bold flex items-center gap-1"
          >
            Open Complete Sales Manifest Desk →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider h-8 border-b border-slate-200 font-bold">
                <th className="px-space-md py-1">MANIFEST #</th>
                <th className="px-space-md py-1">RETAIL CUSTOMER</th>
                <th className="px-space-md py-1">ORDER DATE</th>
                <th className="px-space-md py-1 text-right">UNITS</th>
                <th className="px-space-md py-1 text-right">SETTLEMENT</th>
                <th className="px-space-md py-1 text-center">DISPATCH STATUS</th>
                <th className="px-space-md py-1 text-center">INVOICE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
              {data?.recentOrders?.map(o => (
                <tr key={o.order_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-space-md py-3 font-bold text-blue-700">
                    #{String(o.order_id).padStart(5, '0')}
                  </td>
                  <td className="px-space-md py-3 font-semibold text-slate-900">
                    {o.company_name}
                  </td>
                  <td className="px-space-md py-3 text-slate-600 text-[11px]">
                    {new Date(o.order_date).toLocaleDateString()}
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
                  <td className="px-space-md py-3 text-center">
                    {o.invoice_status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                        PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                        UNPAID
                      </span>
                    )}
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
