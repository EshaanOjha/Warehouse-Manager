import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductTiers, setSelectedProductTiers] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // New product form
  const [newProd, setNewProd] = useState({
    category_id: 1,
    sku: '',
    name: '',
    description: '',
    unit_of_measure: 'unit',
    min_order_qty: 5,
    stock_qty: 50,
    reorder_threshold: 15,
    base_price: ''
  });

  // New tier form
  const [newTier, setNewTier] = useState({
    min_qty: '',
    max_qty: '',
    unit_price: '',
    discount_pct: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get('/admin/products'),
        api.get('/admin/categories')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await api.post('/admin/products', newProd);
      setMessage(`Product "${newProd.name}" (${newProd.sku}) created successfully.`);
      setShowAddProduct(false);
      setNewProd({
        category_id: categories[0]?.category_id || 1,
        sku: '',
        name: '',
        description: '',
        unit_of_measure: 'unit',
        min_order_qty: 5,
        stock_qty: 50,
        reorder_threshold: 15,
        base_price: ''
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product.');
    }
  };

  const handleAddTier = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await api.post(`/admin/products/${selectedProductTiers.product_id}/tiers`, {
        min_qty: parseInt(newTier.min_qty, 10),
        max_qty: newTier.max_qty ? parseInt(newTier.max_qty, 10) : null,
        unit_price: parseFloat(newTier.unit_price),
        discount_pct: newTier.discount_pct ? parseFloat(newTier.discount_pct) : 0
      });
      setMessage('Volume discount tier registered in price matrix.');
      setNewTier({ min_qty: '', max_qty: '', unit_price: '', discount_pct: '' });
      fetchData();
      
      const updatedProdRes = await api.get('/admin/products');
      const updatedTarget = updatedProdRes.data.find(p => p.product_id === selectedProductTiers.product_id);
      setSelectedProductTiers(updatedTarget);
    } catch (err) {
      setError(err.response?.data?.error || 'Database constraint: Tier min/max range invalid.');
    }
  };

  const handleDeleteTier = async (tierId) => {
    try {
      await api.delete(`/admin/tiers/${tierId}`);
      setMessage('Tier deleted.');
      fetchData();
      const updatedProdRes = await api.get('/admin/products');
      const updatedTarget = updatedProdRes.data.find(p => p.product_id === selectedProductTiers.product_id);
      setSelectedProductTiers(updatedTarget);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete tier.');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category_name === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-[12px] text-slate-500">
        <span className="material-symbols-outlined animate-spin mr-2 text-blue-600">sync</span>
        Loading warehouse product catalogue &amp; price matrices...
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
              <span className="material-symbols-outlined text-blue-700 text-[20px]">shelves</span>
              Warehouse Product Catalogue &amp; Tier Pricing
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-slate-100 text-slate-800 border border-slate-300 font-mono text-[10px] font-bold">
              {products.length} CATALOG ITEMS
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>DEPOT LOCATION: <strong className="text-slate-900">WH-02 NEWARK</strong></span>
            <span>·</span>
            <span>DISCOUNT MATRIX: <strong className="text-slate-900 font-bold bg-slate-200/80 px-1 py-0.5 rounded">AUTOMATED fn_unit_price</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <button
            onClick={() => {
              setShowAddProduct(true);
              setMessage('');
              setError('');
            }}
            className="h-8 px-3 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1.5 border border-blue-900 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            Register New SKU
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

      {/* Filter Toolbar */}
      <div className="bg-white rounded-sm border border-slate-300 p-space-md shadow-sm mb-space-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search SKU barcode or product title..."
            className="w-full h-8 pl-8 pr-3 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-sm font-bold uppercase transition-colors cursor-pointer border ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {categories.map(c => (
            <button
              key={c.category_id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-2.5 py-1 rounded-sm font-bold uppercase transition-colors cursor-pointer border shrink-0 ${
                selectedCategory === c.name
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase tracking-wider h-9 border-b border-slate-300 font-bold">
                <th className="px-space-md py-1">SKU / SPECIFICATION</th>
                <th className="px-space-md py-1">CATEGORY</th>
                <th className="px-space-md py-1 text-right">DEPOT STOCK</th>
                <th className="px-space-md py-1 text-right">MIN ORDER</th>
                <th className="px-space-md py-1 text-right">REORDER THRESHOLD</th>
                <th className="px-space-md py-1 text-right">BASE PRICE</th>
                <th className="px-space-md py-1 text-center">TIERS</th>
                <th className="px-space-md py-1 text-right">OPERATIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
              {filteredProducts.map(p => (
                <tr 
                  key={p.product_id}
                  className={`transition-colors ${p.is_low_stock ? 'bg-amber-50/40 hover:bg-amber-50' : 'hover:bg-slate-50'}`}
                >
                  <td className="px-space-md py-3">
                    <div className="font-bold text-slate-900 leading-tight">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      <span className="px-1 py-0.2 rounded bg-slate-100 border border-slate-300 font-semibold text-slate-700">
                        {p.sku}
                      </span>
                      <span className="ml-1.5">{p.unit_of_measure}</span>
                    </div>
                  </td>
                  <td className="px-space-md py-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-bold">
                      {p.category_name}
                    </span>
                  </td>
                  <td className="px-space-md py-3 text-right tabular-nums">
                    <span className={`font-bold ${p.is_low_stock ? 'text-amber-800' : 'text-slate-900'}`}>
                      {p.stock_qty}
                    </span>
                    {p.is_low_stock && (
                      <span className="ml-1 text-[9px] px-1 bg-amber-200 text-amber-900 rounded font-bold">
                        LOW
                      </span>
                    )}
                  </td>
                  <td className="px-space-md py-3 text-right tabular-nums text-slate-600">
                    {p.min_order_qty}
                  </td>
                  <td className="px-space-md py-3 text-right tabular-nums text-slate-600">
                    {p.reorder_threshold}
                  </td>
                  <td className="px-space-md py-3 text-right tabular-nums font-bold text-slate-900">
                    ${Number(p.base_price).toFixed(2)}
                  </td>
                  <td className="px-space-md py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.tiers?.length > 0 
                        ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {p.tiers?.length || 0} brackets
                    </span>
                  </td>
                  <td className="px-space-md py-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedProductTiers(p);
                        setMessage('');
                        setError('');
                      }}
                      className="h-7 px-2.5 rounded-sm bg-white hover:bg-slate-100 text-slate-800 font-mono text-[11px] font-bold border border-slate-300 shadow-sm transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[13px] text-blue-600">stacked_bar_chart</span>
                      Manage Tiers
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowAddProduct(false)}
        >
          <div 
            className="bg-white rounded-sm border border-slate-300 shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in font-mono"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#0d1520] text-white p-4 border-b border-[#202e42] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">add_box</span>
                <span className="font-bold text-[14px] uppercase tracking-tight">
                  Register New Warehouse Product
                </span>
              </div>
              <button
                onClick={() => setShowAddProduct(false)}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-4 flex flex-col gap-3 text-[12px]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">SKU Barcode *</label>
                  <input
                    type="text"
                    required
                    value={newProd.sku}
                    onChange={e => setNewProd({ ...newProd, sku: e.target.value })}
                    placeholder="e.g. BEV-008"
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Category *</label>
                  <select
                    value={newProd.category_id}
                    onChange={e => setNewProd({ ...newProd, category_id: parseInt(e.target.value, 10) })}
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  >
                    {categories.map(c => (
                      <option key={c.category_id} value={c.category_id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProd.name}
                  onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                  placeholder="e.g. Arabica Reserve Whole Beans 1kg"
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Packaging / Specs</label>
                <input
                  type="text"
                  value={newProd.description}
                  onChange={e => setNewProd({ ...newProd, description: e.target.value })}
                  placeholder="e.g. 12 bags per master carton"
                  className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Base Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProd.base_price}
                    onChange={e => setNewProd({ ...newProd, base_price: e.target.value })}
                    placeholder="25.00"
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Min Order Qty *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newProd.min_order_qty}
                    onChange={e => setNewProd({ ...newProd, min_order_qty: parseInt(e.target.value, 10) })}
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-600 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newProd.stock_qty}
                    onChange={e => setNewProd({ ...newProd, stock_qty: parseInt(e.target.value, 10) })}
                    className="w-full h-8 px-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="h-8 px-3 rounded-sm bg-white hover:bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-8 px-4 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[11px] font-bold border border-blue-900 cursor-pointer shadow-sm"
                >
                  Save &amp; Activate SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Price Tiers Modal */}
      {selectedProductTiers && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedProductTiers(null)}
        >
          <div 
            className="bg-white rounded-sm border border-slate-300 shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in font-mono"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#0d1520] text-white p-4 border-b border-[#202e42] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">stacked_bar_chart</span>
                <span className="font-bold text-[14px] uppercase tracking-tight">
                  Volume Price Matrix: {selectedProductTiers.name}
                </span>
              </div>
              <button
                onClick={() => setSelectedProductTiers(null)}
                className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white cursor-pointer border-none bg-transparent"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
              <div>
                SKU: <strong className="text-slate-900">{selectedProductTiers.sku}</strong> · Base Unit Price: <strong className="text-blue-700 font-bold">${Number(selectedProductTiers.base_price).toFixed(2)}</strong>
              </div>
              <span className="text-[10px] text-slate-400">Enforced by CHECK (max_qty &gt;= min_qty)</span>
            </div>

            {/* Existing Tiers Table */}
            <div className="p-4 max-h-56 overflow-y-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider h-7 border-b border-slate-300 font-bold">
                    <th className="px-2 py-1">MIN QTY</th>
                    <th className="px-2 py-1">MAX QTY</th>
                    <th className="px-2 py-1 text-right">UNIT PRICE</th>
                    <th className="px-2 py-1 text-right">DISCOUNT</th>
                    <th className="px-2 py-1 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-900">
                  {selectedProductTiers.tiers?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-slate-500 italic">
                        No bulk discount tiers configured. Base price applies to all quantities.
                      </td>
                    </tr>
                  ) : (
                    selectedProductTiers.tiers?.map(t => (
                      <tr key={t.tier_id} className="hover:bg-slate-50">
                        <td className="px-2 py-2 font-bold">{t.min_qty} units</td>
                        <td className="px-2 py-2">{t.max_qty ? `${t.max_qty} units` : '∞ (Max)'}</td>
                        <td className="px-2 py-2 text-right tabular-nums font-bold text-blue-700">
                          ${Number(t.unit_price).toFixed(2)}
                        </td>
                        <td className="px-2 py-2 text-right tabular-nums text-emerald-700 font-bold">
                          {t.discount_pct}% OFF
                        </td>
                        <td className="px-2 py-2 text-center">
                          <button
                            onClick={() => handleDeleteTier(t.tier_id)}
                            className="text-rose-600 hover:text-rose-800 font-bold text-[10px] cursor-pointer"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add New Tier Form */}
            <form onSubmit={handleAddTier} className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider">
                + Append Volume Tier Bracket
              </span>
              <div className="grid grid-cols-4 gap-2 text-[11px]">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Min Qty *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newTier.min_qty}
                    onChange={e => setNewTier({ ...newTier, min_qty: e.target.value })}
                    placeholder="20"
                    className="w-full h-7 px-2 bg-white border border-slate-300 rounded-sm font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Max Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={newTier.max_qty}
                    onChange={e => setNewTier({ ...newTier, max_qty: e.target.value })}
                    placeholder="49 (or blank)"
                    className="w-full h-7 px-2 bg-white border border-slate-300 rounded-sm font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newTier.unit_price}
                    onChange={e => setNewTier({ ...newTier, unit_price: e.target.value })}
                    placeholder="22.50"
                    className="w-full h-7 px-2 bg-white border border-slate-300 rounded-sm font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-0.5">Discount %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTier.discount_pct}
                    onChange={e => setNewTier({ ...newTier, discount_pct: e.target.value })}
                    placeholder="10.0"
                    className="w-full h-7 px-2 bg-white border border-slate-300 rounded-sm font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 mt-1">
                <button
                  type="button"
                  onClick={() => setSelectedProductTiers(null)}
                  className="h-7 px-3 rounded-sm bg-white hover:bg-slate-100 text-slate-700 font-mono text-[10px] font-bold border border-slate-300 cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="h-7 px-3 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[10px] font-bold border border-blue-900 cursor-pointer shadow-sm"
                >
                  Add Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
