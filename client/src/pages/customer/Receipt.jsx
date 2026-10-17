import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

export default function Receipt() {
  const [receipts, setReceipts] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      const res = await api.get('/customer/receipts');
      setReceipts(res.data);
    } catch (err) {
      console.error('Error fetching receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewReceiptDetail = async (invoiceId) => {
    try {
      const res = await api.get(`/customer/receipts/${invoiceId}`);
      setSelectedReceipt(res.data);
    } catch (err) {
      console.error('Error fetching receipt detail:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-[12px] text-slate-500">
        <span className="material-symbols-outlined animate-spin mr-2 text-blue-600">sync</span>
        Retrieving Bills of Lading and Invoices from Ledger...
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
              <span className="material-symbols-outlined text-blue-700 text-[20px]">receipt_long</span>
              Bills of Lading &amp; Tax Invoices
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px] font-bold">
              {receipts.length} SETTLEMENT DOCUMENTS
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>ISSUING AUTHORITY: <strong className="text-slate-900">WH-02 LOGISTICS DEPOT</strong></span>
            <span>·</span>
            <span>TERMS: <strong className="text-slate-900 font-bold bg-slate-200/80 px-1 py-0.5 rounded">NET 30 REVOLVING</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <Link
            to="/customer/orders"
            className="h-8 px-3 rounded-sm bg-white hover:bg-slate-100 text-slate-800 font-mono text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1.5 border border-slate-300"
          >
            <span className="material-symbols-outlined text-[15px]">local_shipping</span>
            Inspect Manifests
          </Link>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 mb-3">
            <span className="material-symbols-outlined text-[28px]">receipt</span>
          </div>
          <h3 className="font-headline-sm text-slate-900 text-[16px] font-bold mb-1">
            No Invoices Generated Yet
          </h3>
          <p className="text-slate-500 text-[12px] max-w-sm mb-4">
            Once wholesale orders are finalized in the system, automated commercial tax invoices and Bills of Lading appear here.
          </p>
          <Link
            to="/customer/products"
            className="h-8 px-3 rounded-sm bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold flex items-center gap-1.5 border border-blue-800 shadow-sm"
          >
            <span className="material-symbols-outlined text-[15px]">shopping_cart</span>
            Create First Order
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase tracking-wider h-9 border-b border-slate-300 font-bold">
                  <th className="px-space-md py-1">INVOICE NUMBER</th>
                  <th className="px-space-md py-1">ORDER REF</th>
                  <th className="px-space-md py-1">ISSUE DATE</th>
                  <th className="px-space-md py-1">NET DUE DATE</th>
                  <th className="px-space-md py-1 text-right">TOTAL SETTLEMENT</th>
                  <th className="px-space-md py-1 text-center">STATUS</th>
                  <th className="px-space-md py-1">PAYMENT STAMP</th>
                  <th className="px-space-md py-1 text-right">DOCUMENT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
                {receipts.map(r => (
                  <tr key={r.invoice_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-space-md py-3 font-bold text-slate-900">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-900 font-mono">
                        {r.invoice_number}
                      </span>
                    </td>
                    <td className="px-space-md py-3 font-mono text-[11px] text-blue-700 font-semibold">
                      #{String(r.order_id).padStart(5, '0')}
                    </td>
                    <td className="px-space-md py-3 text-slate-600 text-[11px]">
                      {new Date(r.invoice_date).toLocaleDateString()}
                    </td>
                    <td className="px-space-md py-3 text-slate-600 text-[11px]">
                      {new Date(r.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums font-bold text-slate-900 text-[13px]">
                      ${Number(r.total_amount).toFixed(2)}
                    </td>
                    <td className="px-space-md py-3 text-center">
                      {r.payment_status === 'PAID' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          SETTLED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                          OPEN (NET 30)
                        </span>
                      )}
                    </td>
                    <td className="px-space-md py-3 text-[11px] text-slate-500">
                      {r.paid_date ? (
                        <span className="text-emerald-700 font-semibold">
                          {new Date(r.paid_date).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">PENDING RECEIPT</span>
                      )}
                    </td>
                    <td className="px-space-md py-3 text-right">
                      <button
                        onClick={() => viewReceiptDetail(r.invoice_id)}
                        className="h-7 px-2.5 rounded-sm bg-white hover:bg-slate-100 text-slate-800 font-mono text-[11px] font-bold border border-slate-300 shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px] text-blue-600">visibility</span>
                        Bill of Lading
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Bill of Lading / Tax Invoice Modal */}
      {selectedReceipt && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedReceipt(null)}
        >
          <div 
            className="bg-white rounded-sm border border-slate-300 shadow-2xl w-full max-w-3xl overflow-hidden my-8 animate-fade-in font-mono"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Bar for Action */}
            <div className="bg-[#09101a] text-slate-300 px-4 py-2 border-b border-[#202e42] flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-200">
                <span className="material-symbols-outlined text-[16px] text-amber-400">lock</span>
                Official Commercial Document · Verification Hash: {selectedReceipt.invoice_number}-SEC
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2 py-0.5 rounded-sm bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-600 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[13px]">print</span>
                  Print Document
                </button>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="w-6 h-6 rounded-sm flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>

            {/* Document Body (Printable Area) */}
            <div className="p-8 text-slate-900 bg-white">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[20px] font-black uppercase tracking-tight text-slate-950">
                      WHOLESALE LOGISTICS DEPOT WH-02
                    </span>
                    <span className="px-1.5 py-0.2 bg-slate-900 text-white text-[9px] font-bold rounded">
                      B2B TERMINAL
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    100 Terminal Boulevard, Port Newark Logistics Hub, NJ 07114
                  </div>
                  <div className="text-[10px] text-slate-500">
                    DOT #884920 · FED TAX ID: XX-XXXX901 · FREIGHT DISPATCH TERMINAL
                  </div>
                </div>

                <div className="text-right flex flex-col items-end">
                  <span className="text-[18px] font-black tracking-tight text-blue-900 uppercase">
                    BILL OF LADING &amp; INVOICE
                  </span>
                  <span className="font-bold text-[13px] text-slate-900">
                    {selectedReceipt.invoice_number}
                  </span>
                  <span className={`mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                    selectedReceipt.payment_status === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                      : 'bg-amber-100 text-amber-900 border-amber-400'
                  }`}>
                    {selectedReceipt.payment_status === 'PAID' ? 'PAID IN FULL (NET 30)' : 'PAYMENT DUE UPON NET 30'}
                  </span>
                </div>
              </div>

              {/* Shipper & Consignee Columns */}
              <div className="grid grid-cols-2 gap-6 p-3 bg-slate-50 border border-slate-300 rounded-sm mb-6 text-[11px]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    SHIPPER / CONSIGNOR:
                  </span>
                  <div className="font-bold text-slate-900">Newark Central Distribution Depot [WH-02]</div>
                  <div className="text-slate-600">Dispatched from Dock Bay #04</div>
                  <div className="text-slate-600">Inventory Ledger: Newark Regional B2B</div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    CONSIGNEE (BILLED TO):
                  </span>
                  <div className="font-bold text-slate-900">{selectedReceipt.company_name}</div>
                  <div className="text-slate-600">{selectedReceipt.customer_email}</div>
                  <div className="text-slate-600">Order Reference: #{selectedReceipt.order_id}</div>
                </div>
              </div>

              {/* Dates & Terms Bar */}
              <div className="grid grid-cols-3 gap-2 border-y border-slate-300 py-2.5 mb-6 text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">DOCUMENT DATE:</span>
                  <strong className="text-slate-900">{new Date(selectedReceipt.invoice_date).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">SETTLEMENT DUE:</span>
                  <strong className="text-slate-900">{new Date(selectedReceipt.due_date).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">PAYMENT RECORD:</span>
                  <strong className={selectedReceipt.paid_date ? 'text-emerald-700' : 'text-amber-700'}>
                    {selectedReceipt.paid_date ? `Paid ${new Date(selectedReceipt.paid_date).toLocaleDateString()}` : 'Awaiting Settlement'}
                  </strong>
                </div>
              </div>

              {/* Line Items Table */}
              <table className="w-full text-left border-collapse text-[11px] mb-6">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider h-7 border-b border-slate-300 font-bold">
                    <th className="px-2 py-1">SKU</th>
                    <th className="px-2 py-1">ITEM SPECIFICATION</th>
                    <th className="px-2 py-1 text-center">QUANTITY</th>
                    <th className="px-2 py-1 text-right">TIER UNIT PRICE</th>
                    <th className="px-2 py-1 text-right">LINE TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-900">
                  {selectedReceipt.items?.map(item => (
                    <tr key={item.item_id}>
                      <td className="px-2 py-2 font-bold text-slate-800">{item.sku}</td>
                      <td className="px-2 py-2">{item.product_name}</td>
                      <td className="px-2 py-2 text-center font-bold">{item.quantity}</td>
                      <td className="px-2 py-2 text-right tabular-nums">${Number(item.unit_price).toFixed(2)}</td>
                      <td className="px-2 py-2 text-right tabular-nums font-bold text-slate-900">
                        ${Number(item.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation Area */}
              <div className="flex justify-end pt-2 border-t border-slate-300">
                <div className="w-64 flex flex-col gap-1.5 text-[12px]">
                  <div className="flex justify-between text-slate-600">
                    <span>Goods Subtotal:</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      ${(Number(selectedReceipt.total_amount) / 1.05).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Wholesale Surcharge (5%):</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      ${(Number(selectedReceipt.total_amount) - (Number(selectedReceipt.total_amount) / 1.05)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pallet Freight Handling:</span>
                    <span className="font-bold text-emerald-700">INCLUDED</span>
                  </div>
                  <div className="pt-2 border-t-2 border-slate-900 flex justify-between text-[15px] font-bold text-slate-950">
                    <span>Grand Total:</span>
                    <span className="tabular-nums text-blue-900">
                      ${Number(selectedReceipt.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legal Footer */}
              <div className="mt-8 pt-4 border-t border-slate-200 text-[9px] text-slate-400 leading-tight">
                This commercial Bill of Lading certifies the custody transfer of specified cargo units under Net 30 wholesale credit agreements. Goods receipt constitutes acceptance of standard B2B depot terms.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
