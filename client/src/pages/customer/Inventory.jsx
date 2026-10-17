import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [usageQty, setUsageQty] = useState('');
  const [usageNotes, setUsageNotes] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Threshold modal state
  const [editingThresholdProduct, setEditingThresholdProduct] = useState(null);
  const [newThreshold, setNewThreshold] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get('/customer/inventory');
      setInventory(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordUsage = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    const qty = parseInt(usageQty, 10);
    if (!qty || qty <= 0) {
      setActionError('Quantity must be greater than zero.');
      return;
    }

    try {
      const res = await api.post(`/customer/inventory/${selectedProduct.product_id}/use`, {
        quantity: qty,
        notes: usageNotes
      });
      setActionSuccess(res.data.message || 'Inventory usage recorded in audit ledger.');
      setSelectedProduct(null);
      setUsageQty('');
      setUsageNotes('');
      fetchInventory();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to record usage.');
    }
  };

  const handleUpdateThreshold = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    const threshold = parseInt(newThreshold, 10);
    if (isNaN(threshold) || threshold < 0) {
      setActionError('Threshold must be a non-negative number.');
      return;
    }

    try {
      await api.patch(`/customer/inventory/${editingThresholdProduct.product_id}/threshold`, {
        threshold
      });
      setActionSuccess(`Low-stock alert threshold updated to ${threshold} units.`);
      setEditingThresholdProduct(null);
      setNewThreshold('');
      fetchInventory();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update threshold.');
    }
  };

  const lowStockCount = inventory.filter(i => i.is_low_stock).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-[12px] text-slate-500">
        <span className="material-symbols-outlined animate-spin mr-2 text-blue-600">sync</span>
        Querying depot inventory and telemetry registers...
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
              <span className="material-symbols-outlined text-blue-700 text-[20px]">warehouse</span>
              Depot &amp; Retail Store Inventory
            </span>
            {lowStockCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                {lowStockCount} LOW-STOCK ALERTS ACTIVE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                ALL DEPOT STOCK HEALTHY
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>REGISTERED SKUS: <strong className="text-slate-900">{inventory.length}</strong></span>
            <span>·</span>
            <span>DEPOT SOURCE: <strong className="text-slate-900">DELIVERED MANIFESTS (WH-02)</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <Link
            to="/customer/products"
            className="h-8 px-3 rounded-sm bg-slate-900 hover:bg-slate-800 text-white font-mono text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-400">add_shopping_cart</span>
            Reorder Stock
          </Link>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="mb-space-md p-3 rounded-sm bg-emerald-950 text-emerald-200 border border-emerald-700 flex items-center justify-between font-mono text-[12px] shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
            <span>{actionSuccess}</span>
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

      {inventory.length === 0 ? (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 mb-3">
            <span className="material-symbols-outlined text-[28px]">shelves</span>
          </div>
          <h3 className="font-headline-sm text-slate-900 text-[16px] font-bold mb-1">
            Depot Inventory Empty
          </h3>
          <p className="text-slate-500 text-[12px] max-w-sm mb-4">
            Stock registers are automatically credited when wholesale manifests are delivered by our logistics team.
          </p>
          <Link
            to="/customer/products"
            className="h-8 px-3 rounded-sm bg-blue-700 hover:bg-blue-800 text-white text-[11px] font-bold flex items-center gap-1.5 border border-blue-800 shadow-sm"
          >
            <span className="material-symbols-outlined text-[15px]">inventory</span>
            Order Wholesale Inventory
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase tracking-wider h-9 border-b border-slate-300 font-bold">
                  <th className="px-space-md py-1">SKU / PRODUCT SPECIFICATION</th>
                  <th className="px-space-md py-1">CATEGORY</th>
                  <th className="px-space-md py-1 text-right">ON-HAND QUANTITY</th>
                  <th className="px-space-md py-1 text-right">ALERT THRESHOLD</th>
                  <th className="px-space-md py-1 text-center">DEPOT STATUS</th>
                  <th className="px-space-md py-1">LAST RESTOCKED</th>
                  <th className="px-space-md py-1 text-right">OPERATIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
                {inventory.map(item => (
                  <tr 
                    key={item.inventory_id} 
                    className={`transition-colors ${item.is_low_stock ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-space-md py-3">
                      <div className="font-bold text-slate-900 leading-tight">
                        {item.product_name}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <span className="px-1 py-0.2 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-700">
                          {item.sku}
                        </span>
                      </div>
                    </td>
                    <td className="px-space-md py-3">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-bold">
                        {item.category_name}
                      </span>
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums">
                      <span className={`text-[14px] font-bold ${item.is_low_stock ? 'text-amber-800' : 'text-slate-900'}`}>
                        {item.quantity_on_hand}
                      </span>{' '}
                      <span className="text-[10px] text-slate-500 uppercase">{item.unit_of_measure}</span>
                    </td>
                    <td className="px-space-md py-3 text-right tabular-nums text-slate-600 text-[11px]">
                      {item.alert_threshold} units
                    </td>
                    <td className="px-space-md py-3 text-center">
                      {item.is_low_stock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          HEALTHY
                        </span>
                      )}
                    </td>
                    <td className="px-space-md py-3 text-slate-600 text-[11px]">
                      {item.last_restocked_at ? new Date(item.last_restocked_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-space-md py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedProduct(item);
                            setActionError('');
                            setActionSuccess('');
                          }}
                          className="h-7 px-2 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[11px] font-bold border border-blue-900 shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                          title="Record Store Usage or Sale"
                        >
                          <span className="material-symbols-outlined text-[13px]">remove_shopping_cart</span>
                          Use Stock
                        </button>
                        <button
                          onClick={() => {
                            editingThresholdProduct && setEditingThresholdProduct(null);
                            setEditingThresholdProduct(item);
                            setNewThreshold(item.alert_threshold);
                            setActionError('');
                            setActionSuccess('');
                          }}
                          className="h-7 px-2 rounded-sm bg-white hover:bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-300 shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                          title="Set Alert Threshold"
                        >
                          <span className="material-symbols-outlined text-[13px]">notifications_active</span>
                          Alert
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Usage Modal */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className="bg-white rounded-sm border border-slate-300 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in font-mono"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#0d1520] text-white p-4 border-b border-[#202e42] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">remove_shopping_cart</span>
                <span className="font-bold text-[14px] uppercase tracking-tight">
                  Record Usage / Retail Sale
                </span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleRecordUsage} className="p-4 flex flex-col gap-3">
              <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-200 text-[11px]">
                <div className="font-bold text-slate-900">{selectedProduct.product_name}</div>
                <div className="text-slate-500 mt-0.5">
                  SKU: {selectedProduct.sku} · Current Available: <strong className="text-blue-700">{selectedProduct.quantity_on_hand} {selectedProduct.unit_of_measure}</strong>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">
                  Quantity Depleted / Sold
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.quantity_on_hand}
                  value={usageQty}
                  onChange={e => setUsageQty(e.target.value)}
                  placeholder={`Max ${selectedProduct.quantity_on_hand}`}
                  required
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">
                  Reason / Consumption Note
                </label>
                <input
                  type="text"
                  value={usageNotes}
                  onChange={e => setUsageNotes(e.target.value)}
                  placeholder="e.g. In-store retail register checkout"
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="h-8 px-3 rounded-sm bg-white hover:bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-3 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[11px] font-bold border border-blue-900 cursor-pointer shadow-sm"
                >
                  Confirm &amp; Deduct
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Threshold Modal */}
      {editingThresholdProduct && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditingThresholdProduct(null)}
        >
          <div 
            className="bg-white rounded-sm border border-slate-300 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in font-mono"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#0d1520] text-white p-4 border-b border-[#202e42] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">notifications_active</span>
                <span className="font-bold text-[14px] uppercase tracking-tight">
                  Configure Low-Stock Alert
                </span>
              </div>
              <button
                onClick={() => setEditingThresholdProduct(null)}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateThreshold} className="p-4 flex flex-col gap-3">
              <div className="bg-slate-50 p-2.5 rounded-sm border border-slate-200 text-[11px]">
                <div className="font-bold text-slate-900">{editingThresholdProduct.product_name}</div>
                <div className="text-slate-500 mt-0.5">
                  Current Stock: <strong>{editingThresholdProduct.quantity_on_hand}</strong> · Existing Threshold: <strong>{editingThresholdProduct.alert_threshold}</strong>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">
                  Minimum Reorder Warning Level (Units)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newThreshold}
                  onChange={e => setNewThreshold(e.target.value)}
                  required
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
                <span className="block text-[10px] text-slate-500 mt-1">
                  Triggers real-time alerts in top dock bell when stock drops below this level.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingThresholdProduct(null)}
                  className="h-8 px-3 rounded-sm bg-white hover:bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-3 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[11px] font-bold border border-blue-900 cursor-pointer shadow-sm"
                >
                  Save Parameter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
