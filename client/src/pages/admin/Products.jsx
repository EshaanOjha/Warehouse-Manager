import React, { useState, useEffect } from 'react';
import api from '../../api/axios';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductTiers, setSelectedProductTiers] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

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
      setMessage(`Product "${newProd.name}" added successfully.`);
      setShowAddProduct(false);
      setNewProd({
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
      setMessage('Tier added successfully.');
      setNewTier({ min_qty: '', max_qty: '', unit_price: '', discount_pct: '' });
      fetchData();
      // Update modal view
      const updatedProdRes = await api.get('/admin/products');
      const updatedTarget = updatedProdRes.data.find(p => p.product_id === selectedProductTiers.product_id);
      setSelectedProductTiers(updatedTarget);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add tier.');
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

  if (loading) return <div className="container"><p>Loading catalogue products...</p></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Product Catalogue & Price Tiers</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Manage warehouse inventory, SKU definitions, and bulk discount structures.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddProduct(true)}>
          + Add New Product
        </button>
      </div>

      {message && <div style={{ background: '#dcfce7', color: '#15803d', padding: 10, borderRadius: 6, marginBottom: 16 }}>{message}</div>}
      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 6, marginBottom: 16 }}>{error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock Qty</th>
              <th>Min Order</th>
              <th>Threshold</th>
              <th>Base Price</th>
              <th>Tiers</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.product_id}>
                <td>{p.product_id}</td>
                <td><strong>{p.sku}</strong></td>
                <td>{p.name}</td>
                <td><span className="badge badge-secondary">{p.category_name}</span></td>
                <td>
                  <strong style={{ color: p.is_low_stock ? 'var(--danger)' : 'inherit' }}>
                    {p.stock_qty}
                  </strong>
                  {p.is_low_stock ? ' (Low)' : ''}
                </td>
                <td>{p.min_order_qty}</td>
                <td>{p.reorder_threshold}</td>
                <td>${Number(p.base_price).toFixed(2)}</td>
                <td>
                  <span className="badge badge-info">{p.tiers?.length || 0} tiers</span>
                </td>
                <td>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      setSelectedProductTiers(p);
                      setMessage('');
                      setError('');
                    }}
                  >
                    Manage Tiers
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal-overlay" onClick={() => setShowAddProduct(false)}>
          <div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
            <h3>Add New Wholesale Product</h3>
            <form onSubmit={handleAddProduct} style={{ marginTop: 16 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label>SKU</label>
                  <input 
                    type="text" 
                    required 
                    value={newProd.sku} 
                    onChange={e => setNewProd({ ...newProd, sku: e.target.value })} 
                    placeholder="e.g. BEV-005"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={newProd.category_id} 
                    onChange={e => setNewProd({ ...newProd, category_id: parseInt(e.target.value, 10) })}
                  >
                    {categories.map(c => (
                      <option key={c.category_id} value={c.category_id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  required 
                  value={newProd.name} 
                  onChange={e => setNewProd({ ...newProd, name: e.target.value })} 
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  value={newProd.description} 
                  onChange={e => setNewProd({ ...newProd, description: e.target.value })} 
                />
              </div>

              <div className="grid-3">
                <div className="form-group">
                  <label>Base Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={newProd.base_price} 
                    onChange={e => setNewProd({ ...newProd, base_price: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Min Order Qty</label>
                  <input 
                    type="number" 
                    min="1" 
                    required 
                    value={newProd.min_order_qty} 
                    onChange={e => setNewProd({ ...newProd, min_order_qty: parseInt(e.target.value, 10) })} 
                  />
                </div>
                <div className="form-group">
                  <label>Initial Stock</label>
                  <input 
                    type="number" 
                    min="0" 
                    value={newProd.stock_qty} 
                    onChange={e => setNewProd({ ...newProd, stock_qty: parseInt(e.target.value, 10) })} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button type="button" className="btn" onClick={() => setShowAddProduct(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Price Tiers Modal */}
      {selectedProductTiers && (
        <div className="modal-overlay" onClick={() => setSelectedProductTiers(null)}>
          <div className="modal-content" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
            <h3>Price Tiers for {selectedProductTiers.name}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
              Base Price: ${Number(selectedProductTiers.base_price).toFixed(2)}. Discounted prices apply based on order quantity.
            </p>

            {/* Existing Tiers Table */}
            <table style={{ marginBottom: 20 }}>
              <thead>
                <tr>
                  <th>Min Qty</th>
                  <th>Max Qty</th>
                  <th>Unit Price</th>
                  <th>Discount %</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {selectedProductTiers.tiers?.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No tiers configured (base price applies to all orders).</td></tr>
                ) : (
                  selectedProductTiers.tiers?.map(t => (
                    <tr key={t.tier_id}>
                      <td>{t.min_qty}</td>
                      <td>{t.max_qty || '∞'}</td>
                      <td><strong>${Number(t.unit_price).toFixed(2)}</strong></td>
                      <td>{t.discount_pct}%</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteTier(t.tier_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Add New Tier Form */}
            <h4>Add New Volume Tier</h4>
            <form onSubmit={handleAddTier} style={{ marginTop: 10 }}>
              <div className="grid-4">
                <div className="form-group">
                  <label>Min Qty</label>
                  <input 
                    type="number" 
                    required 
                    min="1" 
                    value={newTier.min_qty} 
                    onChange={e => setNewTier({ ...newTier, min_qty: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Max Qty (opt)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={newTier.max_qty} 
                    onChange={e => setNewTier({ ...newTier, max_qty: e.target.value })} 
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div className="form-group">
                  <label>Unit Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={newTier.unit_price} 
                    onChange={e => setNewTier({ ...newTier, unit_price: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Discount %</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={newTier.discount_pct} 
                    onChange={e => setNewTier({ ...newTier, discount_pct: e.target.value })} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button type="button" className="btn" onClick={() => setSelectedProductTiers(null)}>Close</button>
                <button type="submit" className="btn btn-primary">+ Add Tier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
