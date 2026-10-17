import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

// Reliable product photography mapping by category or SKU
const getProductImage = (product) => {
  if (product.sku?.startsWith('BEV-001')) {
    return 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80';
  }
  if (product.sku?.startsWith('BEV')) {
    return 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80';
  }
  if (product.sku?.startsWith('GRN') || product.name?.toLowerCase().includes('rice') || product.name?.toLowerCase().includes('flour')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80';
  }
  if (product.sku?.startsWith('DRY') || product.name?.toLowerCase().includes('butter') || product.name?.toLowerCase().includes('cheese')) {
    return 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=400&q=80';
  }
  if (product.name?.toLowerCase().includes('oil')) {
    return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80';
  }
  if (product.sku?.startsWith('PKG') || product.name?.toLowerCase().includes('box') || product.name?.toLowerCase().includes('bag')) {
    return 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=400&q=80';
  }
  if (product.sku?.startsWith('CLN')) {
    return 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=400&q=80';
  }
  return 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
};

const getPackagingLabel = (product) => {
  const name = product.name?.toLowerCase() || '';
  if (name.includes('sack')) return 'SACK 25KG';
  if (name.includes('case') || name.includes('carton')) return 'CASE';
  if (name.includes('tin') || name.includes('pail')) return 'TIN / PAIL';
  if (name.includes('pack') || name.includes('bundle')) return 'BUNDLE';
  return 'PALLET';
};

const getRackLocation = (id) => {
  const rackRow = String.fromCharCode(65 + (id % 6));
  const rackNum = String((id % 12) + 1).padStart(2, '0');
  return `RACK ${rackNum}-${rackRow}`;
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(true);
  const [tier2Only, setTier2Only] = useState(false);
  const [sortBy, setSortBy] = useState('tier_discount');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [quantities, setQuantities] = useState({});
  const [addedNotice, setAddedNotice] = useState('');
  const [addedSku, setAddedSku] = useState(null);

  const { addToCart, getTierPrice, cartItems, totalItemCount, total } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/customer/products');
      setProducts(res.data);
      // Initialize quantities to minimum order quantity for each product
      const initialQty = {};
      res.data.forEach(p => {
        initialQty[p.product_id] = p.min_order_qty;
      });
      setQuantities(initialQty);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (productId, val, minQty, maxStock) => {
    let parsed = parseInt(val, 10);
    if (isNaN(parsed)) parsed = minQty;
    if (parsed > maxStock && maxStock > 0) parsed = maxStock;
    setQuantities(prev => ({
      ...prev,
      [productId]: parsed
    }));
  };

  const incrementQty = (productId, minQty, maxStock) => {
    const current = parseInt(quantities[productId], 10) || minQty;
    if (current < maxStock) {
      setQuantities(prev => ({ ...prev, [productId]: current + 1 }));
    }
  };

  const decrementQty = (productId, minQty) => {
    const current = parseInt(quantities[productId], 10) || minQty;
    if (current > minQty) {
      setQuantities(prev => ({ ...prev, [productId]: current - 1 }));
    }
  };

  const handleAddProduct = (product) => {
    const qty = parseInt(quantities[product.product_id], 10) || product.min_order_qty;
    addToCart(product, qty);
    setAddedSku(product.product_id);
    setAddedNotice(`Added ${qty} × "${product.name}" to cart.`);
    setTimeout(() => {
      setAddedSku(null);
      setAddedNotice('');
    }, 2000);
  };

  // Filter and Sort Logic
  const categoriesList = ['all', ...new Set(products.map(p => p.category_name))];

  let filtered = products.filter(p => {
    const matchCat = categoryFilter === 'all' || p.category_name.toLowerCase() === categoryFilter.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                        p.sku.toLowerCase().includes(search.toLowerCase());
    const matchStock = inStockOnly ? p.stock_qty > 0 : true;
    const matchTier2 = tier2Only ? (p.price_tiers && p.price_tiers.length >= 2) : true;
    return matchCat && matchSearch && matchStock && matchTier2;
  });

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === 'price_asc') return parseFloat(a.base_price) - parseFloat(b.base_price);
    if (sortBy === 'price_desc') return parseFloat(b.base_price) - parseFloat(a.base_price);
    if (sortBy === 'stock_desc') return b.stock_qty - a.stock_qty;
    // Default: highest tier discount
    const maxDiscountA = a.price_tiers?.reduce((max, t) => Math.max(max, parseFloat(t.discount_pct || 0)), 0) || 0;
    const maxDiscountB = b.price_tiers?.reduce((max, t) => Math.max(max, parseFloat(t.discount_pct || 0)), 0) || 0;
    return maxDiscountB - maxDiscountA;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] font-mono text-slate-500 text-[13px]">
        Loading wholesale inventory catalogue...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Top Command & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-md bg-white p-3.5 rounded-sm border border-slate-300 shadow-sm">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-headline-lg text-[18px] text-slate-900 font-bold tracking-tight uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-700 text-[20px]">shelves</span>
              Wholesale Products Catalogue
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Live Volume Matrix Active
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>
              CONTRACT TIER: <strong className="text-slate-900 font-bold bg-slate-200/80 px-1 py-0.5 rounded">GOLD PARTNER (NET 30)</strong>
            </span>
            <span>·</span>
            <span>HUB FACILITY: <strong className="text-slate-900">NEWARK CENTRAL [WH-02]</strong></span>
            <span>·</span>
            <span>RESELLER: <strong className="text-blue-700">{user?.companyName || user?.username}</strong></span>
          </p>
        </div>

        {/* Quick Cart Operations Header Badge */}
        <div className="flex items-center gap-space-sm">
          <Link
            to="/customer/cart"
            className="h-8 px-3 rounded-sm bg-slate-900 hover:bg-slate-800 text-white font-mono text-[12px] font-semibold shadow-sm transition-colors flex items-center gap-2 border border-slate-700 text-decoration-none"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-400">inventory</span>
            <span>
              Draft: <strong className="text-amber-300">{totalItemCount} items</strong> · ${total.toFixed(2)}
            </span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      </div>

      {/* Added Toast Notification */}
      {addedNotice && (
        <div className="mb-space-md p-2.5 rounded-sm bg-emerald-950 text-emerald-200 border border-emerald-700 flex items-center justify-between font-mono text-[12px] shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
            <span>{addedNotice}</span>
          </div>
          <Link to="/customer/cart" className="text-amber-300 hover:underline font-bold flex items-center gap-1">
            Review in Cart →
          </Link>
        </div>
      )}

      {/* Operational Filter Toolbar */}
      <div className="bg-white rounded-sm border border-slate-300 p-space-md shadow-sm mb-space-md flex flex-col gap-space-md">
        {/* Row 1: Search, Stock Toggles, View Selector */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
          {/* Search Input */}
          <div className="relative flex-1 max-w-lg">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">
              filter_alt
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter SKU (e.g. BEV-001), barcode, pallet spec..."
              className="w-full h-9 pl-9 pr-8 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 placeholder:text-slate-500 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 border-none bg-transparent cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Quick Flags & View Toggle */}
          <div className="flex flex-wrap items-center gap-space-md font-mono text-[12px]">
            <label className="flex items-center gap-1.5 cursor-pointer select-none bg-slate-50 px-2 py-1 rounded border border-slate-200 hover:border-slate-300 transition-colors">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer accent-blue-600"
              />
              <span className="text-slate-800 font-semibold">IN-STOCK ONLY</span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer select-none bg-slate-50 px-2 py-1 rounded border border-slate-200 hover:border-slate-300 transition-colors">
              <input
                type="checkbox"
                checked={tier2Only}
                onChange={e => setTier2Only(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer accent-blue-600"
              />
              <span className="text-slate-800 font-semibold">TIER 2+ ELIGIBLE</span>
            </label>

            <div className="h-4 w-[1px] bg-slate-300 hidden sm:block"></div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 uppercase tracking-wider text-[11px] font-bold">SORT:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="h-8 px-2 rounded-sm bg-slate-50 border border-slate-300 text-slate-800 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer font-semibold"
              >
                <option value="tier_discount">Volume Discount (Highest)</option>
                <option value="stock_desc">Available Stock (High to Low)</option>
                <option value="price_asc">Base Price (Lowest first)</option>
                <option value="price_desc">Base Price (Highest first)</option>
              </select>
            </div>

            <div className="h-4 w-[1px] bg-slate-300 hidden sm:block"></div>

            {/* Layout Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-sm border border-slate-300 font-mono text-[11px]">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2 py-1 rounded-sm flex items-center gap-1 transition-colors border-none cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white border border-slate-300 text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-semibold bg-transparent'
                }`}
                title="Dense Grid View"
              >
                <span className="material-symbols-outlined text-[15px] text-blue-600">grid_view</span>
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2 py-1 rounded-sm flex items-center gap-1 transition-colors border-none cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white border border-slate-300 text-slate-900 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 font-semibold bg-transparent'
                }`}
                title="Operational Data Sheet"
              >
                <span className="material-symbols-outlined text-[15px]">table_rows</span>
                <span className="hidden sm:inline">Dense Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 pt-1 scrollbar-none font-mono text-[11px]">
          {categoriesList.map(cat => {
            const isAll = cat === 'all';
            const count = isAll ? products.length : products.filter(p => p.category_name.toLowerCase() === cat.toLowerCase()).length;
            const isSelected = categoryFilter.toLowerCase() === cat.toLowerCase();

            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-sm font-bold flex items-center gap-1.5 shrink-0 transition-colors border cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.toUpperCase()}
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold tabular-nums ${
                    isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 border border-slate-200 text-slate-800'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: PRODUCT GRID VIEW (DENSE CARDS) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md mb-space-xl">
          {filtered.map(p => {
            const currentQty = parseInt(quantities[p.product_id], 10) || p.min_order_qty;
            const liveUnitPrice = getTierPrice(p, currentQty);
            const lineTotal = (liveUnitPrice * currentQty).toFixed(2);
            const isLowStock = p.stock_qty <= p.reorder_threshold;
            const packaging = getPackagingLabel(p);
            const rack = getRackLocation(p.product_id);
            const imageSrc = getProductImage(p);
            const isJustAdded = addedSku === p.product_id;

            // Tier schedule (ensure at least base tier + 2 discount tiers)
            const tiers = p.price_tiers && p.price_tiers.length > 0
              ? p.price_tiers
              : [
                  { tier_id: 1, min_qty: p.min_order_qty, max_qty: 19, unit_price: p.base_price, discount_pct: 0 },
                  { tier_id: 2, min_qty: 20, max_qty: 49, unit_price: Number((p.base_price * 0.91).toFixed(2)), discount_pct: 9 },
                  { tier_id: 3, min_qty: 50, max_qty: null, unit_price: Number((p.base_price * 0.82).toFixed(2)), discount_pct: 18 }
                ];

            return (
              <div
                key={p.product_id}
                className={`product-card bg-white rounded-sm border shadow-sm p-space-md flex flex-col justify-between hover:border-slate-400 hover:shadow-md transition-all relative ${
                  isLowStock ? 'border-2 border-amber-400' : 'border-slate-300'
                }`}
              >
                {/* Rack Badge in corner */}
                <div
                  className={`absolute -top-[1px] -right-[1px] font-mono text-[9px] px-1.5 py-0.5 rounded-bl-sm font-semibold tracking-wider border-l border-b flex items-center gap-1 ${
                    isLowStock
                      ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-700'
                  }`}
                >
                  <span className={`w-1 h-1 rounded-full ${isLowStock ? 'bg-red-700 animate-ping' : 'bg-emerald-400'}`}></span>
                  {isLowStock ? 'REORDER THRESHOLD' : rack}
                </div>

                <div>
                  {/* Top row: Thumbnail + SKU badge + Stock */}
                  <div className="flex items-start gap-space-md mb-space-sm">
                    <div className="w-20 h-20 rounded-sm border border-slate-300 bg-slate-100 overflow-hidden shrink-0 relative">
                      <img
                        src={imageSrc}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute top-1 left-1 px-1 bg-slate-900/90 text-white font-mono text-[9px] font-bold rounded-sm border border-slate-700">
                        {packaging}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 border border-slate-300 text-slate-800 font-mono text-[11px] font-bold tracking-wide">
                          SKU: {p.sku}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold flex items-center gap-1 ${
                            isLowStock
                              ? 'bg-amber-100 border border-amber-400 text-amber-900'
                              : 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isLowStock ? 'bg-amber-600' : 'bg-emerald-600'}`}></span>
                          {p.stock_qty} {p.unit_of_measure.toUpperCase()}S {isLowStock ? '· CRITICAL' : ''}
                        </span>
                      </div>

                      <h3 className="font-headline-sm text-[14px] text-slate-900 leading-tight truncate font-bold" title={p.name}>
                        {p.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                          {p.category_name}
                        </span>
                        <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                          Min MOQ: {p.min_order_qty}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          ID: {p.product_id}
                        </span>
                      </div>

                      <div className="mt-1 flex items-baseline gap-1">
                        <span className="font-display-md text-[20px] text-slate-900 font-bold tabular-nums">
                          ${Number(p.base_price).toFixed(2)}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 font-semibold">
                          / UNIT BASE
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Volume Discount Schedule Matrix */}
                  <div className="bg-slate-50 rounded-sm border border-slate-300 p-2 mb-space-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-slate-600 uppercase tracking-wider font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px] text-slate-500">stacked_bar_chart</span>
                        Volume Discount Schedule
                      </span>
                      {tiers.length > 1 && (
                        <span className="font-mono text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1 py-0.2 rounded font-bold">
                          Max Save {Math.round(tiers[tiers.length - 1].discount_pct || 0)}%
                        </span>
                      )}
                    </div>

                    <div className={`grid grid-cols-${Math.min(tiers.length, 3)} gap-1 text-center font-mono`}>
                      {tiers.slice(0, 3).map((t, idx) => {
                        const isCurrentActive =
                          currentQty >= t.min_qty && (t.max_qty === null || currentQty <= t.max_qty);

                        return (
                          <div
                            key={t.tier_id || idx}
                            className={`p-1 flex flex-col transition-all rounded-sm border ${
                              isCurrentActive
                                ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <span className={`text-[10px] ${isCurrentActive ? 'text-blue-900 font-semibold' : 'text-slate-500'}`}>
                              {t.min_qty}{t.max_qty ? ` – ${t.max_qty}` : '+'} units
                            </span>
                            <span className={`text-[13px] font-bold tabular-nums ${isCurrentActive ? 'text-blue-700' : 'text-slate-900'}`}>
                              ${Number(t.unit_price).toFixed(2)}
                            </span>
                            <span
                              className={`text-[9px] uppercase font-semibold ${
                                t.discount_pct > 0 ? 'text-emerald-700 font-bold' : 'text-slate-400'
                              }`}
                            >
                              {t.discount_pct > 0 ? `Save ${t.discount_pct}%` : 'Base MOQ'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Action & Stepper Control */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between gap-space-sm">
                    {/* Stepper */}
                    <div className="flex items-center bg-slate-100 rounded-sm border border-slate-300 p-0.5">
                      <button
                        onClick={() => decrementQty(p.product_id, p.min_order_qty)}
                        className="w-7 h-7 flex items-center justify-center rounded-sm bg-white border border-slate-300 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                        title="Decrease"
                      >
                        <span className="material-symbols-outlined text-[15px]">remove</span>
                      </button>
                      <input
                        type="number"
                        min={p.min_order_qty}
                        max={p.stock_qty}
                        value={currentQty}
                        onChange={e => handleQtyChange(p.product_id, e.target.value, p.min_order_qty, p.stock_qty)}
                        className="w-12 text-center bg-transparent font-mono text-[13px] font-bold text-slate-900 focus:outline-none tabular-nums"
                      />
                      <button
                        onClick={() => incrementQty(p.product_id, p.min_order_qty, p.stock_qty)}
                        className="w-7 h-7 flex items-center justify-center rounded-sm bg-white border border-slate-300 text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                        title="Increase"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                      </button>
                    </div>

                    {/* Dynamic calculation feedback */}
                    <div className="flex flex-col text-right flex-1 min-w-0 pr-1 font-mono">
                      <span className="text-[12px] text-slate-900 font-bold tabular-nums">
                        ${Number(liveUnitPrice).toFixed(2)} / ea
                      </span>
                      <span className="text-[10px] text-blue-700 font-semibold truncate">
                        Total ${lineTotal}
                      </span>
                    </div>

                    {/* Add to Cart CTA */}
                    <button
                      onClick={() => handleAddProduct(p)}
                      className={`h-8 px-3 rounded-sm font-mono text-[11px] font-bold shrink-0 flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer border ${
                        isJustAdded
                          ? 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-blue-700 hover:bg-blue-800 text-white border-blue-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {isJustAdded ? 'check' : 'add_shopping_cart'}
                      </span>
                      {isJustAdded ? 'Added' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: OPERATIONAL DENSE TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden mb-space-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[11px] uppercase tracking-wider h-9 border-b border-slate-300 font-bold">
                  <th className="px-space-md py-1">SKU / ITEM SPEC</th>
                  <th className="px-space-md py-1">CATEGORY</th>
                  <th className="px-space-md py-1">DEPOT STOCK</th>
                  <th className="px-space-md py-1 text-right">MOQ</th>
                  <th className="px-space-md py-1 text-right">BASE TIER</th>
                  <th className="px-space-md py-1 text-right">VOLUME TIER 2</th>
                  <th className="px-space-md py-1 text-right">VOLUME TIER 3</th>
                  <th className="px-space-md py-1 text-right">DISPATCH ORDER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
                {filtered.map(p => {
                  const currentQty = parseInt(quantities[p.product_id], 10) || p.min_order_qty;
                  const isLow = p.stock_qty <= p.reorder_threshold;
                  const rack = getRackLocation(p.product_id);
                  const tier2 = p.price_tiers?.[1];
                  const tier3 = p.price_tiers?.[2];

                  return (
                    <tr key={p.product_id} className={`hover:bg-slate-50 transition-colors ${isLow ? 'bg-amber-50/40' : ''}`}>
                      <td className="px-space-md py-2">
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {p.sku} · {p.unit_of_measure} · {rack}
                        </div>
                      </td>
                      <td className="px-space-md py-2">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 text-[10px] font-bold">
                          {p.category_name}
                        </span>
                      </td>
                      <td className="px-space-md py-2">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${
                            isLow
                              ? 'bg-amber-100 border-amber-400 text-amber-900'
                              : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          }`}
                        >
                          {p.stock_qty} {p.unit_of_measure}s {isLow ? '(Low)' : ''}
                        </span>
                      </td>
                      <td className="px-space-md py-2 text-right tabular-nums">{p.min_order_qty} units</td>
                      <td className="px-space-md py-2 text-right tabular-nums font-bold">
                        ${Number(p.base_price).toFixed(2)}
                      </td>
                      <td className="px-space-md py-2 text-right tabular-nums text-blue-700 font-bold">
                        {tier2 ? (
                          <span>
                            ${Number(tier2.unit_price).toFixed(2)}{' '}
                            <span className="text-[10px] text-emerald-700 font-normal">(-{tier2.discount_pct}%)</span>
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-space-md py-2 text-right tabular-nums text-blue-700 font-bold">
                        {tier3 ? (
                          <span>
                            ${Number(tier3.unit_price).toFixed(2)}{' '}
                            <span className="text-[10px] text-emerald-700 font-normal">(-{tier3.discount_pct}%)</span>
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-space-md py-2 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <input
                            type="number"
                            min={p.min_order_qty}
                            max={p.stock_qty}
                            value={currentQty}
                            onChange={e => handleQtyChange(p.product_id, e.target.value, p.min_order_qty, p.stock_qty)}
                            className="w-14 h-7 text-center bg-slate-100 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none"
                          />
                          <button
                            onClick={() => handleAddProduct(p)}
                            className="h-7 px-2.5 rounded-sm bg-blue-700 hover:bg-blue-800 text-white font-mono text-[11px] font-bold flex items-center gap-1 border border-blue-800 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[13px]">add</span> Add
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Operational Bottom Dock / Notice */}
      <div className="bg-slate-900 text-white rounded-sm p-space-md shadow-sm border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-space-md font-mono mt-4">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-sm bg-blue-900 border border-blue-500/50 flex items-center justify-center text-blue-400 shrink-0">
            <span className="material-symbols-outlined text-[18px]">sync_alt</span>
          </div>
          <div className="flex flex-col text-[12px]">
            <span className="font-bold text-white tracking-wide flex items-center gap-2">
              AUTOMATIC VOLUME TIER RECALIBRATION{' '}
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] rounded border border-emerald-500/40">
                ONLINE
              </span>
            </span>
            <span className="text-slate-400 font-normal text-[11px]">
              Tier brackets recalculate across orders instantly. Free multi-pallet freight triggered over{' '}
              <strong className="text-slate-100">$1,500.00</strong>.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-md shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">CURRENT DRAFT METRICS</span>
            <span className="text-[13px] text-white font-bold tabular-nums">
              ${total.toFixed(2)} · <span className="text-emerald-400">{totalItemCount} units</span>
            </span>
          </div>
          <Link
            to="/customer/cart"
            className="h-9 px-4 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-[12px] font-bold flex items-center gap-1.5 transition-colors border border-blue-400 shadow-sm text-decoration-none"
          >
            <span>Review & Proceed</span>
            <span className="material-symbols-outlined text-[16px]">shopping_cart_checkout</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
