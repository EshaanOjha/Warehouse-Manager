import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Catalogue() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState({}); // { [productId]: quantity }
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCatalogue();
  }, []);

  const fetchCatalogue = async () => {
    try {
      const res = await api.get('/customer/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching catalogue:', err);
    } finally {
      setLoading(false);
    }
  };

  // Compute tiered bulk price dynamically in frontend for live preview
  const getTierPrice = (product, qty) => {
    if (!qty || qty <= 0) return product.base_price;
    if (!product.price_tiers || product.price_tiers.length === 0) return product.base_price;

    const matchedTiers = product.price_tiers
      .filter(t => qty >= t.min_qty && (t.max_qty === null || qty <= t.max_qty))
      .sort((a, b) => b.min_qty - a.min_qty);

    if (matchedTiers.length > 0) {
      return matchedTiers[0].unit_price;
    }
    return product.base_price;
  };

  const updateCartQty = (product, newQty) => {
    const qty = Math.max(0, parseInt(newQty, 10) || 0);
    setCart(prev => {
      const updated = { ...prev };
      if (qty === 0) {
        delete updated[product.product_id];
      } else {
        updated[product.product_id] = qty;
      }
      return updated;
    });
  };

  const handlePlaceOrder = async () => {
    setOrderError('');
    setOrderSuccess('');
    setSubmitting(true);

    const items = Object.entries(cart).map(([productId, quantity]) => ({
      product_id: parseInt(productId, 10),
      quantity
    }));

    if (items.length === 0) {
      setOrderError('Your cart is empty. Please add items to place an order.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.post('/customer/orders', {
        items,
        notes
      });
      setOrderSuccess(`Order placed successfully! Order #${res.data.order?.order_id || ''}. Warehouse stock updated.`);
      setCart({});
      setNotes('');
      // Refresh catalogue to show reduced stock
      fetchCatalogue();
      setTimeout(() => navigate('/customer/orders'), 1500);
    } catch (err) {
      console.error('Order placement failed:', err);
      // Trigger error (e.g. stock limit or minimum order quantity check)
      setOrderError(err.response?.data?.error || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['ALL', ...new Set(products.map(p => p.category_name))];

  const filteredProducts = products.filter(p => {
    const matchCat = categoryFilter === 'ALL' || p.category_name === categoryFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                        p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartItemEntries = Object.entries(cart);
  const cartSubtotal = cartItemEntries.reduce((sum, [pId, qty]) => {
    const prod = products.find(p => p.product_id === parseInt(pId, 10));
    if (!prod) return sum;
    const unitPrice = getTierPrice(prod, qty);
    return sum + (unitPrice * qty);
  }, 0);

  const cartTax = cartSubtotal * 0.05;
  const cartTotal = cartSubtotal + cartTax;

  if (loading) return <div className="container"><p>Loading catalogue...</p></div>;

  return (
    <div className="container">
      <h2>Wholesale Catalogue & Bulk Ordering</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
        Tiered bulk discounts applied automatically based on order volume.
      </p>

      {orderSuccess && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          {orderSuccess}
        </div>
      )}

      {orderError && (
        <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          <strong>Order Rejected by Database:</strong> {orderError}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
        <div style={{ flex: '1', minWidth: 200 }}>
          <input 
            type="text" 
            placeholder="Search by product name or SKU..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: cartItemEntries.length > 0 ? '2fr 1fr' : '1fr', gap: 24 }}>
        {/* Products Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filteredProducts.map(p => {
            const currentCartQty = cart[p.product_id] || 0;
            const liveUnitPrice = getTierPrice(p, currentCartQty || p.min_order_qty);

            return (
              <div key={p.product_id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span className="badge badge-secondary">{p.category_name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SKU: {p.sku}</span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>{p.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>{p.description}</p>
                  
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', marginBottom: 8 }}>
                    <span>Base Price: <strong>${Number(p.base_price).toFixed(2)}</strong> / {p.unit_of_measure}</span>
                    <span>Min Order: <strong>{p.min_order_qty}</strong></span>
                    <span>Warehouse Stock: <strong style={{ color: p.stock_qty < p.min_order_qty ? 'red' : 'inherit' }}>{p.stock_qty}</strong></span>
                  </div>

                  {/* Volume Tiers Breakdown */}
                  {p.price_tiers && p.price_tiers.length > 0 && (
                    <div style={{ background: '#f8fafc', padding: '6px 10px', borderRadius: 6, fontSize: '0.8rem', border: '1px solid var(--border)' }}>
                      <strong>Bulk Pricing Tiers: </strong>
                      {p.price_tiers.map(t => (
                        <span key={t.tier_id} style={{ marginRight: 12 }}>
                          {t.min_qty}{t.max_qty ? `–${t.max_qty}` : '+'} units: <strong>${Number(t.unit_price).toFixed(2)}</strong>
                          {t.discount_pct > 0 && <span style={{ color: 'var(--success)' }}> ({t.discount_pct}% off)</span>}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ minWidth: 160, textAlign: 'right' }}>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Live Tier Unit Price:</span>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
                      ${Number(liveUnitPrice).toFixed(2)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                    <input 
                      type="number" 
                      min="0"
                      max={p.stock_qty}
                      value={currentCartQty || ''}
                      placeholder={`Min ${p.min_order_qty}`}
                      onChange={e => updateCartQty(p, e.target.value)}
                      style={{ width: 85, textAlign: 'center' }}
                    />
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => updateCartQty(p, currentCartQty > 0 ? currentCartQty + p.min_order_qty : p.min_order_qty)}
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Cart Panel */}
        {cartItemEntries.length > 0 && (
          <div>
            <div className="card" style={{ position: 'sticky', top: 20 }}>
              <h3 style={{ marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                Current Bulk Order ({cartItemEntries.length} items)
              </h3>

              <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 16 }}>
                {cartItemEntries.map(([productId, qty]) => {
                  const prod = products.find(p => p.product_id === parseInt(productId, 10));
                  if (!prod) return null;
                  const unitPrice = getTierPrice(prod, qty);
                  const subtotal = unitPrice * qty;

                  return (
                    <div key={productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px dashed var(--border)', fontSize: '0.85rem' }}>
                      <div>
                        <strong>{prod.name}</strong>
                        <div style={{ color: 'var(--text-muted)' }}>
                          {qty} × ${Number(unitPrice).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div><strong>${Number(subtotal).toFixed(2)}</strong></div>
                        <button 
                          onClick={() => updateCartQty(prod, 0)} 
                          style={{ border: 'none', background: 'transparent', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.75rem' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10, fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Subtotal:</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: 'var(--text-muted)' }}>
                  <span>Tax (5%):</span>
                  <span>${cartTax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700, margin: '8px 0' }}>
                  <span>Total:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Delivery / Loading Notes</label>
                <textarea 
                  rows="2" 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="e.g. Deliver to rear bay between 9am-12pm"
                />
              </div>

              <button 
                className="btn btn-success" 
                style={{ width: '100%', padding: '10px 0' }}
                onClick={handlePlaceOrder}
                disabled={submitting}
              >
                {submitting ? 'Processing Transaction...' : 'Place Wholesale Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
