import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showMapPrice, setShowMapPrice] = useState(false);

  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact_name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [mapForm, setMapForm] = useState({
    supplier_id: '',
    product_id: '',
    supplier_sku: '',
    supply_price: '',
    lead_time_days: 3,
    is_preferred: false
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [supRes, prodRes] = await Promise.all([
        api.get('/admin/suppliers'),
        api.get('/admin/products')
      ]);
      setSuppliers(supRes.data);
      setProducts(prodRes.data);
      if (supRes.data.length > 0) setMapForm(f => ({ ...f, supplier_id: supRes.data[0].supplier_id }));
      if (prodRes.data.length > 0) setMapForm(f => ({ ...f, product_id: prodRes.data[0].product_id }));
    } catch (err) {
      console.error('Error fetching suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await api.post('/admin/suppliers', newSupplier);
      setMessage(`Supplier "${newSupplier.name}" registered in vendor registry.`);
      setShowAddSupplier(false);
      setNewSupplier({ name: '', contact_name: '', email: '', phone: '', address: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add supplier.');
    }
  };

  const handleMapPricing = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await api.post('/admin/product-suppliers', {
        supplier_id: parseInt(mapForm.supplier_id, 10),
        product_id: parseInt(mapForm.product_id, 10),
        supplier_sku: mapForm.supplier_sku,
        supply_price: parseFloat(mapForm.supply_price),
        lead_time_days: parseInt(mapForm.lead_time_days, 10),
        is_preferred: mapForm.is_preferred
      });
      setMessage('Supplier cost & lead time mapped in product_supplier table.');
      setShowMapPrice(false);
      setMapForm(f => ({ ...f, supplier_sku: '', supply_price: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to map price.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-[12px] text-slate-500">
        <span className="material-symbols-outlined animate-spin mr-2 text-blue-600">sync</span>
        Querying approved vendor directory &amp; supply matrices...
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
              <span className="material-symbols-outlined text-amber-600 text-[20px]">handshake</span>
              Wholesale Suppliers &amp; Procurement Registry
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px] font-bold">
              {suppliers.length} APPROVED VENDORS
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>RELATIONAL SCHEMA: <strong className="text-slate-900 font-bold bg-slate-200/80 px-1 py-0.5 rounded">M:N product_supplier</strong></span>
            <span>·</span>
            <span>DEPOT HUB: <strong className="text-slate-900">NEWARK CENTRAL [WH-02]</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => {
              setShowAddSupplier(true);
              setMessage('');
              setError('');
            }}
            className="h-8 px-3 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1.5 border border-blue-900 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            Register Supplier
          </button>
          <button
            onClick={() => {
              setShowMapPrice(true);
              setMessage('');
              setError('');
            }}
            className="h-8 px-3 rounded-sm bg-slate-900 hover:bg-slate-800 text-white font-mono text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px] text-amber-400">link</span>
            Map Supply Cost
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

      {/* Suppliers Table */}
      <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden">
        <div className="bg-slate-100 px-space-md py-2.5 border-b border-slate-300 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px] text-blue-700">corporate_fare</span>
            Verified Commercial Vendors
          </span>
          <span className="text-[10px] text-slate-500 uppercase">
            Supplier lead times &amp; purchase order endpoints
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider h-9 border-b border-slate-200 font-bold">
                <th className="px-space-md py-1">VENDOR ID</th>
                <th className="px-space-md py-1">SUPPLIER ENTITY</th>
                <th className="px-space-md py-1">DISPATCH CONTACT</th>
                <th className="px-space-md py-1">COMMERCIAL EMAIL</th>
                <th className="px-space-md py-1">PHONE</th>
                <th className="px-space-md py-1">FACILITY ADDRESS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
              {suppliers.map(s => (
                <tr key={s.supplier_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-space-md py-3 font-bold text-blue-700">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300">
                      SUP-{String(s.supplier_id).padStart(3, '0')}
                    </span>
                  </td>
                  <td className="px-space-md py-3 font-bold text-slate-900">
                    {s.name}
                  </td>
                  <td className="px-space-md py-3 text-slate-700">
                    {s.contact_name || '—'}
                  </td>
                  <td className="px-space-md py-3 text-slate-600 text-[11px]">
                    {s.email}
                  </td>
                  <td className="px-space-md py-3 text-slate-600 text-[11px]">
                    {s.phone || '—'}
                  </td>
                  <td className="px-space-md py-3 text-slate-500 text-[11px] max-w-xs truncate">
                    {s.address || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddSupplier(false)}
        >
          <div 
            className="bg-white rounded-sm border border-slate-300 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in font-mono"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#0d1520] text-white p-4 border-b border-[#202e42] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">add_business</span>
                <span className="font-bold text-[14px] uppercase tracking-tight">
                  Register New Commercial Supplier
                </span>
              </div>
              <button
                onClick={() => setShowAddSupplier(false)}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddSupplier} className="p-4 flex flex-col gap-3 text-[12px]">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Company / Entity Name *</label>
                <input
                  type="text"
                  required
                  value={newSupplier.name}
                  onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="e.g. Apex Agri Commodities Corp"
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={newSupplier.contact_name}
                    onChange={e => setNewSupplier({ ...newSupplier, contact_name: e.target.value })}
                    placeholder="e.g. David Vance"
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Dispatch Email *</label>
                  <input
                    type="email"
                    required
                    value={newSupplier.email}
                    onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })}
                    placeholder="supply@apexagri.com"
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Phone</label>
                <input
                  type="text"
                  value={newSupplier.phone}
                  onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="+1 (555) 789-0123"
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Depot / Warehouse Address</label>
                <textarea
                  rows="2"
                  value={newSupplier.address}
                  onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  placeholder="Facility street address, port terminal or depot gate"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="h-8 px-3 rounded-sm bg-white hover:bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[11px] font-bold border border-blue-900 cursor-pointer shadow-sm"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Supply Price Modal */}
      {showMapPrice && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowMapPrice(false)}
        >
          <div 
            className="bg-white rounded-sm border border-slate-300 shadow-2xl w-full max-w-md overflow-hidden animate-fade-in font-mono"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#0d1520] text-white p-4 border-b border-[#202e42] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">link</span>
                <span className="font-bold text-[14px] uppercase tracking-tight">
                  Map Product Supply Cost (M:N)
                </span>
              </div>
              <button
                onClick={() => setShowMapPrice(false)}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="p-3 bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500">
              Populates <code className="text-slate-800 font-bold">product_supplier</code> table with competing procurement rates and lead times.
            </div>

            <form onSubmit={handleMapPricing} className="p-4 flex flex-col gap-3 text-[12px]">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Select Supplier *</label>
                <select
                  value={mapForm.supplier_id}
                  onChange={e => setMapForm({ ...mapForm, supplier_id: e.target.value })}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                >
                  {suppliers.map(s => (
                    <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Select Warehouse Product *</label>
                <select
                  value={mapForm.product_id}
                  onChange={e => setMapForm({ ...mapForm, product_id: e.target.value })}
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                >
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Supply Unit Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={mapForm.supply_price}
                    onChange={e => setMapForm({ ...mapForm, supply_price: e.target.value })}
                    placeholder="12.50"
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={mapForm.lead_time_days}
                    onChange={e => setMapForm({ ...mapForm, lead_time_days: e.target.value })}
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Vendor SKU Identifier</label>
                <input
                  type="text"
                  value={mapForm.supplier_sku}
                  onChange={e => setMapForm({ ...mapForm, supplier_sku: e.target.value })}
                  placeholder="e.g. APX-BEV-99"
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => setShowMapPrice(false)}
                  className="h-8 px-3 rounded-sm bg-white hover:bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[11px] font-bold border border-blue-900 cursor-pointer shadow-sm"
                >
                  Save Supply Cost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
