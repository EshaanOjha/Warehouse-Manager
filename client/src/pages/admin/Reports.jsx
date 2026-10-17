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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-[12px] text-slate-500">
        <span className="material-symbols-outlined animate-spin mr-2 text-blue-600">sync</span>
        Compiling SQL Analytical Views and Financial Telemetry...
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
              <span className="material-symbols-outlined text-indigo-700 text-[20px]">query_stats</span>
              Business Intelligence &amp; SQL Analytical Views
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px] font-bold">
              4 REAL-TIME SQL VIEWS ACTIVE
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>DATABASE ENGINE: <strong className="text-slate-900">MYSQL 8.0 (INNODB)</strong></span>
            <span>·</span>
            <span>COURSE: <strong className="text-slate-900 font-bold bg-slate-200/80 px-1 py-0.5 rounded">CSC2103 RDBMS PROJECT</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => window.print()}
            className="h-8 px-3 rounded-sm bg-slate-900 hover:bg-slate-800 text-white font-mono text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">print</span>
            Print Executive Audit
          </button>
        </div>
      </div>

      {/* SQL View Switcher Navigation Tabs */}
      <div className="bg-white rounded-sm border border-slate-300 p-2 shadow-sm mb-space-md flex flex-wrap items-center gap-2 text-[11px]">
        {[
          { id: 'top-products', label: 'Top Selling Products', view: 'v_top_products' },
          { id: 'monthly-sales', label: 'Monthly Revenue Ledger', view: 'v_monthly_sales' },
          { id: 'unpaid', label: 'Overdue Receivables Aging', view: 'v_unpaid_invoices' },
          { id: 'supplier-comp', label: 'Supplier Margin Matrix', view: 'v_supplier_comparison' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-sm font-bold uppercase transition-colors cursor-pointer border flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${
              activeTab === tab.id ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'
            }`}>
              {tab.view}
            </span>
          </button>
        ))}
      </div>

      {/* Report 1: Top Products View */}
      {activeTab === 'top-products' && (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden">
          <div className="bg-slate-100 px-space-md py-2.5 border-b border-slate-300 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-700">leaderboard</span>
              Top Volume Generators · SQL View: v_top_products
            </span>
            <span className="text-[10px] text-slate-500 uppercase">
              Aggregates units sold and gross receipts across confirmed orders
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider h-9 border-b border-slate-200 font-bold">
                  <th className="px-space-md py-1">RANK</th>
                  <th className="px-space-md py-1">PRODUCT SPECIFICATION</th>
                  <th className="px-space-md py-1">SKU</th>
                  <th className="px-space-md py-1">CATEGORY</th>
                  <th className="px-space-md py-1 text-right">TOTAL UNITS SOLD</th>
                  <th className="px-space-md py-1 text-right">GROSS REVENUE GENERATED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
                {topProducts.map((p, idx) => (
                  <tr key={p.product_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-space-md py-3 font-bold text-slate-500">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] ${
                        idx === 0 ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300' :
                        idx === 1 ? 'bg-slate-200 text-slate-800 font-bold' :
                        idx === 2 ? 'bg-amber-800/10 text-amber-950 font-bold' : 'text-slate-500'
                      }`}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="px-space-md py-3 font-bold text-slate-900">
                      {p.product_name}
                    </td>
                    <td className="px-space-md py-3 text-slate-600">
                      <span className="px-1 py-0.2 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-700 text-[11px]">
                        {p.sku}
                      </span>
                    </td>
                    <td className="px-space-md py-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-bold">
                        {p.category_name}
                      </span>
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums font-semibold text-slate-800">
                      {p.total_units_sold} units
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums font-bold text-blue-700 text-[13px]">
                      ${Number(p.total_revenue_generated).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 2: Monthly Sales Performance */}
      {activeTab === 'monthly-sales' && (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden">
          <div className="bg-slate-100 px-space-md py-2.5 border-b border-slate-300 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-700">calendar_month</span>
              Monthly Revenue Performance · SQL View: v_monthly_sales
            </span>
            <span className="text-[10px] text-slate-500 uppercase">
              Grouped by DATE_FORMAT(order_date, '%Y-%m')
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider h-9 border-b border-slate-200 font-bold">
                  <th className="px-space-md py-1">CALENDAR MONTH</th>
                  <th className="px-space-md py-1 text-center">TOTAL ORDERS DISPATCHED</th>
                  <th className="px-space-md py-1 text-right">GROSS LINE SUBTOTAL</th>
                  <th className="px-space-md py-1 text-right">STATE SURCHARGE (5%)</th>
                  <th className="px-space-md py-1 text-right">NET CASH REVENUE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
                {monthlySales.map(m => (
                  <tr key={m.sales_month} className="hover:bg-slate-50 transition-colors">
                    <td className="px-space-md py-3 font-bold text-slate-900">
                      {m.sales_month}
                    </td>
                    <td className="px-space-md py-3 text-center tabular-nums font-semibold text-slate-800">
                      {m.total_orders} manifests
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums text-slate-600">
                      ${Number(m.gross_subtotal).toFixed(2)}
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums text-slate-600">
                      ${Number(m.total_tax).toFixed(2)}
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums font-bold text-emerald-700 text-[13px]">
                      ${Number(m.total_revenue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: Unpaid & Overdue Invoices */}
      {activeTab === 'unpaid' && (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden">
          <div className="bg-slate-100 px-space-md py-2.5 border-b border-slate-300 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-rose-600">event_busy</span>
              Accounts Receivable Aging Analysis · SQL View: v_unpaid_invoices
            </span>
            <span className="text-[10px] text-slate-500 uppercase">
              Dynamically calculated DATEDIFF(CURRENT_TIMESTAMP, due_date)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider h-9 border-b border-slate-200 font-bold">
                  <th className="px-space-md py-1">INVOICE #</th>
                  <th className="px-space-md py-1">CUSTOMER / COMPANY</th>
                  <th className="px-space-md py-1">BILLING CONTACT</th>
                  <th className="px-space-md py-1 text-right">TOTAL RECEIVABLE</th>
                  <th className="px-space-md py-1">INVOICE DATE</th>
                  <th className="px-space-md py-1">NET 30 DUE DATE</th>
                  <th className="px-space-md py-1 text-center">DELINQUENCY (DAYS)</th>
                  <th className="px-space-md py-1 text-center">AGING BUCKET</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
                {unpaidInvoices.map(inv => (
                  <tr 
                    key={inv.invoice_id} 
                    className={`transition-colors ${inv.aging_category === 'OVERDUE' ? 'bg-rose-50/50 hover:bg-rose-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-space-md py-3 font-bold text-slate-900 font-mono">
                      {inv.invoice_number}
                    </td>
                    <td className="px-space-md py-3 font-bold text-slate-900">
                      {inv.company_name}
                    </td>
                    <td className="px-space-md py-3 text-slate-600 text-[11px]">
                      {inv.phone || inv.email}
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums font-bold text-rose-800 text-[13px]">
                      ${Number(inv.total_amount).toFixed(2)}
                    </td>
                    <td className="px-space-md py-3 text-slate-600 text-[11px]">
                      {new Date(inv.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-space-md py-3 text-slate-600 text-[11px]">
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-space-md py-3 text-center tabular-nums font-bold">
                      {inv.days_overdue > 0 ? (
                        <span className="text-rose-700">+{inv.days_overdue} days</span>
                      ) : (
                        <span className="text-slate-500">{inv.days_overdue} days</span>
                      )}
                    </td>
                    <td className="px-space-md py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                        inv.aging_category === 'OVERDUE' 
                          ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
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
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden">
          <div className="bg-slate-100 px-space-md py-2.5 border-b border-slate-300 flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-emerald-700">price_check</span>
              Supplier Cost &amp; Profit Margin Analysis · SQL View: v_supplier_comparison
            </span>
            <span className="text-[10px] text-slate-500 uppercase">
              Formula: (base_selling_price - supply_cost) / base_selling_price
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider h-9 border-b border-slate-200 font-bold">
                  <th className="px-space-md py-1">PRODUCT</th>
                  <th className="px-space-md py-1">SKU</th>
                  <th className="px-space-md py-1 text-right">SELLING BASE</th>
                  <th className="px-space-md py-1">SUPPLIER ENTITY</th>
                  <th className="px-space-md py-1 text-right">SUPPLY COST</th>
                  <th className="px-space-md py-1 text-right">UNIT MARGIN</th>
                  <th className="px-space-md py-1 text-center">MARGIN %</th>
                  <th className="px-space-md py-1 text-right">LEAD TIME</th>
                  <th className="px-space-md py-1 text-center">PREFERRED</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
                {supplierComparison.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-space-md py-3 font-bold text-slate-900">
                      {s.product_name}
                    </td>
                    <td className="px-space-md py-3 text-slate-600">
                      <span className="px-1 py-0.2 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-700 text-[11px]">
                        {s.sku}
                      </span>
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums text-slate-600">
                      ${Number(s.warehouse_selling_price).toFixed(2)}
                    </td>
                    <td className="px-space-md py-3 font-semibold text-slate-900">
                      {s.supplier_name}
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums text-slate-600">
                      ${Number(s.supply_price).toFixed(2)}
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums font-bold text-slate-900 text-[13px]">
                      ${Number(s.unit_margin).toFixed(2)}
                    </td>
                    <td className="px-space-md py-3 text-center">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                        {s.margin_pct}%
                      </span>
                    </td>
                    <td className="px-space-md py-3 text-right text-slate-600 text-[11px]">
                      {s.lead_time_days} days
                    </td>
                    <td className="px-space-md py-3 text-center">
                      {s.is_preferred ? (
                        <span className="text-amber-500 font-bold text-[13px]">★</span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
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
