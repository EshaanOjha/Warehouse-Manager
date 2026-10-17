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
      setMessage(`Supplier "${newSupplier.name}" registered successfully.`);
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
      setMessage('Supplier supply price mapped successfully.');
      setShowMapPrice(false);
      setMapForm(f => ({ ...f, supplier_sku: '', supply_price: '' }));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to map price.');
    }
  };

  if (loading) return <div className="container"><p>Loading suppliers...</p></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Wholesale Suppliers</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Distributor contact registry and multi-supplier procurement pricing.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => setShowAddSupplier(true)}>
            + Add Supplier
          </button>
          <button className="btn" onClick={() => setShowMapPrice(true)}>
            Map Product Supply Price
          </button>
        </div>
      </div>

      {message && <div style={{ background: '#dcfce7', color: '#15803d', padding: 10, borderRadius: 6, marginBottom: 16 }}>{message}</div>}
      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 6, marginBottom: 16 }}>{error}</div>}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Supplier Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s.supplier_id}>
                <td>#{s.supplier_id}</td>
                <td><strong>{s.name}</strong></td>
                <td>{s.contact_name || '—'}</td>
                <td>{s.email}</td>
                <td>{s.phone || '—'}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="modal-overlay" onClick={() => setShowAddSupplier(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Register New Supplier</h3>
            <form onSubmit={handleAddSupplier} style={{ marginTop: 16 }}>
              <div className="form-group">
                <label>Company Name</label>
                <input 
                  type="text" 
                  required 
                  value={newSupplier.name} 
                  onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} 
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Contact Person</label>
                  <input 
                    type="text" 
                    value={newSupplier.contact_name} 
                    onChange={e => setNewSupplier({ ...newSupplier, contact_name: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    required 
                    value={newSupplier.email} 
                    onChange={e => setNewSupplier({ ...newSupplier, email: e.target.value })} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="text" 
                  value={newSupplier.phone} 
                  onChange={e => setNewSupplier({ ...newSupplier, phone: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>Warehouse / Facility Address</label>
                <textarea 
                  rows="2" 
                  value={newSupplier.address} 
                  onChange={e => setNewSupplier({ ...newSupplier, address: e.target.value })} 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button type="button" className="btn" onClick={() => setShowAddSupplier(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Supply Price Modal */}
      {showMapPrice && (
        <div className="modal-overlay" onClick={() => setShowMapPrice(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Map Supplier Pricing (product_supplier)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
              Demonstrates M:N relationship between Products and multiple Suppliers with competing costs.
            </p>
            <form onSubmit={handleMapPricing}>
              <div className="form-group">
                <label>Supplier</label>
                <select 
                  value={mapForm.supplier_id} 
                  onChange={e => setMapForm({ ...mapForm, supplier_id: e.target.value })}
                >
                  {suppliers.map(s => (
                    <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Product</label>
                <select 
                  value={mapForm.product_id} 
                  onChange={e => setMapForm({ ...mapForm, product_id: e.target.value })}
                >
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Supply Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={mapForm.supply_price} 
                    onChange={e => setMapForm({ ...mapForm, supply_price: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Lead Time (Days)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={mapForm.lead_time_days} 
                    onChange={e => setMapForm({ ...mapForm, lead_time_days: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Supplier SKU (optional)</label>
                <input 
                  type="text" 
                  value={mapForm.supplier_sku} 
                  onChange={e => setMapForm({ ...mapForm, supplier_sku: e.target.value })} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button type="button" className="btn" onClick={() => setShowMapPrice(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Pricing</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
