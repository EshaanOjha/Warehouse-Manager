import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function PurchaseOrders() {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New PO modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [poItems, setPoItems] = useState([{ product_id: '', quantity: 50, unit_cost: '' }]);
  const [poNotes, setPoNotes] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lowRes, poRes, supRes, prodRes] = await Promise.all([
        api.get('/admin/low-stock'),
        api.get('/admin/purchase-orders'),
        api.get('/admin/suppliers'),
        api.get('/admin/products')
      ]);
      setLowStockProducts(lowRes.data);
      setPurchaseOrders(poRes.data);
      setSuppliers(supRes.data);
      setProducts(prodRes.data);
      if (supRes.data.length > 0) setSelectedSupplierId(supRes.data[0].supplier_id);
    } catch (err) {
      console.error('Error fetching PO data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReorder = (item) => {
    setSelectedSupplierId(item.supplier_id || (suppliers[0]?.supplier_id || ''));
    setPoItems([{
      product_id: item.product_id,
      quantity: 50,
      unit_cost: item.min_supply_price || ''
    }]);
    setPoNotes(`Automated replenishment for low-stock product ${item.sku}`);
    setShowCreateModal(true);
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    const formattedItems = poItems
      .filter(it => it.product_id && it.quantity > 0)
      .map(it => ({
        product_id: parseInt(it.product_id, 10),
        quantity: parseInt(it.quantity, 10),
        unit_cost: parseFloat(it.unit_cost)
      }));

    if (formattedItems.length === 0) {
      setError('Please specify at least one valid product line with quantity and unit cost.');
      return;
    }

    try {
      const res = await api.post('/admin/purchase-orders', {
        supplier_id: parseInt(selectedSupplierId, 10),
        notes: poNotes,
        items: formattedItems
      });
      setMessage(`Purchase Order #${res.data.poId} submitted to supplier.`);
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create purchase order.');
    }
  };

  const handleReceivePO = async (poId) => {
    setMessage('');
    setError('');

    try {
      const res = await api.patch(`/admin/purchase-orders/${poId}/receive`);
      setMessage(res.data.message || `PO #${poId} received: Inventory credited via trigger.`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to receive purchase order.');
    }
  };

  const updateItemRow = (idx, field, val) => {
    setPoItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const addItemRow = () => {
    setPoItems(prev => [...prev, { product_id: '', quantity: 50, unit_cost: '' }]);
  };

  const removeItemRow = (idx) => {
    setPoItems(prev => prev.filter((_, i) => i !== idx));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-[12px] text-slate-500">
        <span className="material-symbols-outlined animate-spin mr-2 text-blue-600">sync</span>
        Calculating low-stock replenishment views &amp; purchase logs...
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
              <span className="material-symbols-outlined text-purple-700 text-[20px]">move_to_inbox</span>
              Procurement &amp; Supplier Purchase Orders
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px] font-bold">
              {purchaseOrders.length} PURCHASE ORDERS
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>DEPOT INBOUND: <strong className="text-slate-900">WH-02 NEWARK CENTRAL</strong></span>
            <span>·</span>
            <span>OPTIMIZATION VIEW: <strong className="text-slate-900 font-bold bg-slate-200/80 px-1 py-0.5 rounded">v_warehouse_low_stock</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => {
              setPoItems([{ product_id: products[0]?.product_id || '', quantity: 50, unit_cost: '' }]);
              setShowCreateModal(true);
            }}
            className="h-8 px-3 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1.5 border border-blue-900 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            Draft Purchase Order
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="mb-space-md p-3 rounded-sm bg-emerald-950 text-emerald-200 border border-emerald-700 flex items-center justify-between font-mono text-[12px] shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
            <span>{message}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-space-md p-3 rounded-sm bg-rose-950 text-rose-200 border border-rose-700 flex items-center justify-between font-mono text-[12px] shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-rose-400">error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Section 1: Low-Stock Products with Cheapest Supplier View (v_warehouse_low_stock) */}
      <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden mb-space-md">
        <div className="bg-amber-500/10 px-space-md py-2.5 border-b border-amber-300/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600 text-[18px]">warning</span>
            <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wider">
              Warehouse Low-Stock Replenishment View (v_warehouse_low_stock)
            </span>
          </div>
          <span className="text-[10px] text-amber-900 font-bold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
            AUTOMATIC CHEAPEST SUPPLIER CALCULATION
          </span>
        </div>

        {lowStockProducts.length === 0 ? (
          <div className="p-4 text-[12px] text-emerald-700 font-semibold bg-emerald-50/50 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-600">task_alt</span>
            All central warehouse inventory SKUs are above reorder thresholds.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider h-8 border-b border-slate-200 font-bold">
                  <th className="px-space-md py-1">SKU</th>
                  <th className="px-space-md py-1">PRODUCT SPEC</th>
                  <th className="px-space-md py-1 text-right">CURRENT STOCK</th>
                  <th className="px-space-md py-1 text-right">THRESHOLD</th>
                  <th className="px-space-md py-1">OPTIMAL SUPPLIER (CHEAPEST)</th>
                  <th className="px-space-md py-1 text-right">SUPPLY COST</th>
                  <th className="px-space-md py-1 text-right">LEAD TIME</th>
                  <th className="px-space-md py-1 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
                {lowStockProducts.map(item => (
                  <tr key={item.product_id} className="bg-amber-50/40 hover:bg-amber-50 transition-colors">
                    <td className="px-space-md py-2.5 font-bold text-slate-800">
                      <span className="px-1 py-0.2 rounded bg-white border border-slate-300 text-slate-800">
                        {item.sku}
                      </span>
                    </td>
                    <td className="px-space-md py-2.5 font-bold text-slate-900">
                      {item.product_name}
                    </td>
                    <td className="px-space-md py-2.5 text-right tabular-nums">
                      <strong className="text-amber-800">{item.stock_qty}</strong>
                    </td>
                    <td className="px-space-md py-2.5 text-right tabular-nums text-slate-600">
                      {item.reorder_threshold}
                    </td>
                    <td className="px-space-md py-2.5 text-slate-900 font-semibold">
                      {item.supplier_name || <span className="text-slate-400 italic">No supplier mapped</span>}
                    </td>
                    <td className="px-space-md py-2.5 text-right tabular-nums font-bold text-blue-700">
                      {item.min_supply_price ? `$${Number(item.min_supply_price).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-space-md py-2.5 text-right text-slate-600 text-[11px]">
                      {item.lead_time_days ? `${item.lead_time_days} days` : '—'}
                    </td>
                    <td className="px-space-md py-2.5 text-right">
                      <button
                        onClick={() => handleQuickReorder(item)}
                        className="h-7 px-2.5 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[10px] font-bold border border-blue-900 shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">replay</span>
                        Reorder Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Purchase Orders Log Table */}
      <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-slate-100 px-space-md py-2.5 border-b border-slate-300 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-blue-700">receipt</span>
            Inbound Restocking Orders Log
          </span>
          <span className="text-[10px] text-slate-500 uppercase">
            Receiving stock executes <code className="bg-slate-200 px-1 py-0.2 rounded font-bold text-slate-800">trg_po_after_update</code>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider h-9 border-b border-slate-200 font-bold">
                <th className="px-space-md py-1">PO #</th>
                <th className="px-space-md py-1">SUPPLIER</th>
                <th className="px-space-md py-1">ORDER DATE</th>
                <th className="px-space-md py-1">ITEMS / UNITS</th>
                <th className="px-space-md py-1 text-right">PROCUREMENT COST</th>
                <th className="px-space-md py-1 text-center">STATUS</th>
                <th className="px-space-md py-1">RECEIVED STAMP</th>
                <th className="px-space-md py-1 text-right">DOCK OPERATION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
              {purchaseOrders.map(po => (
                <tr key={po.po_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-space-md py-3 font-bold text-blue-700">
                    PO #{String(po.po_id).padStart(5, '0')}
                  </td>
                  <td className="px-space-md py-3 font-bold text-slate-900">
                    {po.supplier_name}
                  </td>
                  <td className="px-space-md py-3 text-slate-600 text-[11px]">
                    {new Date(po.order_date).toLocaleDateString()}
                  </td>
                  <td className="px-space-md py-3 text-slate-700">
                    {po.total_items} items ({po.total_units} units)
                  </td>
                  <td className="px-space-md py-3 text-right tabular-nums font-bold text-slate-900 text-[13px]">
                    ${Number(po.total_amount).toFixed(2)}
                  </td>
                  <td className="px-space-md py-3 text-center">
                    {po.status === 'RECEIVED' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                        RECEIVED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                        {po.status}
                      </span>
                    )}
                  </td>
                  <td className="px-space-md py-3 text-slate-600 text-[11px]">
                    {po.received_date ? new Date(po.received_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-space-md py-3 text-right">
                    {po.status !== 'RECEIVED' ? (
                      <button
                        onClick={() => handleReceivePO(po.po_id)}
                        className="h-7 px-2.5 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-[10px] font-bold border border-emerald-900 shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Executes trg_po_after_update which adds stock to warehouse"
                      >
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Receive Stock
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        Restocked
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-white rounded-sm border border-slate-300 shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in font-mono"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#0d1520] text-white p-4 border-b border-[#202e42] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-[18px]">add_shopping_cart</span>
                <span className="font-bold text-[14px] uppercase tracking-tight">
                  Draft Restocking Purchase Order
                </span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="p-4 flex flex-col gap-3 text-[12px]">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Select Supplier *</label>
                <select
                  value={selectedSupplierId}
                  onChange={e => setSelectedSupplierId(e.target.value)}
                  required
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                >
                  {suppliers.map(s => (
                    <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Line Items</label>
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {poItems.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <select
                        value={row.product_id}
                        onChange={e => updateItemRow(idx, 'product_id', e.target.value)}
                        required
                        className="flex-1 h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[11px] text-slate-900"
                      >
                        <option value="">Select product...</option>
                        {products.map(p => (
                          <option key={p.product_id} value={p.product_id}>{p.name} ({p.sku})</option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={e => updateItemRow(idx, 'quantity', e.target.value)}
                        placeholder="Qty"
                        required
                        className="w-20 h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[11px] text-center"
                      />

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={row.unit_cost}
                        onChange={e => updateItemRow(idx, 'unit_cost', e.target.value)}
                        placeholder="Unit Cost $"
                        required
                        className="w-24 h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[11px] text-right"
                      />

                      {poItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[15px]">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addItemRow}
                  className="mt-2 text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  Add Another Line Item
                </button>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Procurement Notes</label>
                <input
                  type="text"
                  value={poNotes}
                  onChange={e => setPoNotes(e.target.value)}
                  placeholder="e.g. Expedited warehouse replenishment for WH-02"
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="h-8 px-3 rounded-sm bg-white hover:bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[11px] font-bold border border-blue-900 cursor-pointer shadow-sm"
                >
                  Submit Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
