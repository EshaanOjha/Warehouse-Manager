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

  // Quick reorder shortcut directly from low stock table with prefilled cheapest supplier
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
      setMessage(`Purchase Order #${res.data.poId} created successfully.`);
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
      setMessage(res.data.message || `PO #${poId} received. Stock added.`);
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

  if (loading) return <div className="container"><p>Loading purchase orders...</p></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>Procurement & Purchase Orders</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Replenish central warehouse inventory by buying from suppliers.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => {
          setPoItems([{ product_id: products[0]?.product_id || '', quantity: 50, unit_cost: '' }]);
          setShowCreateModal(true);
        }}>
          + Create Purchase Order
        </button>
      </div>

      {message && <div style={{ background: '#dcfce7', color: '#15803d', padding: 10, borderRadius: 6, marginBottom: 16 }}>{message}</div>}
      {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 6, marginBottom: 16 }}>{error}</div>}

      {/* Section 1: Low-Stock Products with Cheapest Supplier View (v_warehouse_low_stock) */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>
          ⚠️ Warehouse Low-Stock Alerts (v_warehouse_low_stock)
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 14 }}>
          This view calculates products with current stock below threshold and identifies the <strong>cheapest supplier</strong> offering the product.
        </p>

        {lowStockProducts.length === 0 ? (
          <p style={{ color: 'var(--success)' }}>All warehouse products currently have adequate stock levels.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Threshold</th>
                  <th>Cheapest Supplier</th>
                  <th>Supplier Cost</th>
                  <th>Lead Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(item => (
                  <tr key={item.product_id} style={{ background: '#fffbeb' }}>
                    <td><strong>{item.sku}</strong></td>
                    <td>{item.product_name}</td>
                    <td><strong style={{ color: 'var(--danger)' }}>{item.stock_qty}</strong></td>
                    <td>{item.reorder_threshold}</td>
                    <td>{item.supplier_name || 'No supplier mapped'}</td>
                    <td>
                      {item.min_supply_price ? (
                        <strong>${Number(item.min_supply_price).toFixed(2)}</strong>
                      ) : '—'}
                    </td>
                    <td>{item.lead_time_days ? `${item.lead_time_days} days` : '—'}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleQuickReorder(item)}
                      >
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

      {/* Section 2: Purchase Orders List */}
      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Purchase Orders Log</h3>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>PO #</th>
                <th>Supplier</th>
                <th>Order Date</th>
                <th>Items / Units</th>
                <th>Total Cost</th>
                <th>Status</th>
                <th>Received Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map(po => (
                <tr key={po.po_id}>
                  <td><strong>PO #{po.po_id}</strong></td>
                  <td>{po.supplier_name}</td>
                  <td>{new Date(po.order_date).toLocaleDateString()}</td>
                  <td>{po.total_items} items ({po.total_units} units)</td>
                  <td><strong>${Number(po.total_amount).toFixed(2)}</strong></td>
                  <td>
                    <span className={`badge ${po.status === 'RECEIVED' ? 'badge-success' : 'badge-warning'}`}>
                      {po.status}
                    </span>
                  </td>
                  <td>{po.received_date ? new Date(po.received_date).toLocaleDateString() : '—'}</td>
                  <td>
                    {po.status !== 'RECEIVED' ? (
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => handleReceivePO(po.po_id)}
                        title="Executes trg_po_after_update which adds stock to warehouse"
                      >
                        Receive Stock
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Inventory Restocked</span>
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
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <h3>Create Purchase Order to Supplier</h3>
            <form onSubmit={handleCreatePO} style={{ marginTop: 16 }}>
              <div className="form-group">
                <label>Select Supplier</label>
                <select 
                  value={selectedSupplierId} 
                  onChange={e => setSelectedSupplierId(e.target.value)}
                  required
                >
                  {suppliers.map(s => (
                    <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <label style={{ marginTop: 12 }}>Order Line Items</label>
              {poItems.map((row, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 10, marginBottom: 8, alignItems: 'center' }}>
                  <select 
                    value={row.product_id}
                    onChange={e => updateItemRow(idx, 'product_id', e.target.value)}
                    required
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
                  />

                  <input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    value={row.unit_cost} 
                    onChange={e => updateItemRow(idx, 'unit_cost', e.target.value)} 
                    placeholder="Unit Cost ($)" 
                    required 
                  />

                  {poItems.length > 1 && (
                    <button 
                      type="button" 
                      className="btn btn-sm btn-danger"
                      onClick={() => removeItemRow(idx)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}

              <button type="button" className="btn btn-sm" onClick={addItemRow} style={{ marginTop: 4 }}>
                + Add Another Product
              </button>

              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Notes</label>
                <input 
                  type="text" 
                  value={poNotes} 
                  onChange={e => setPoNotes(e.target.value)} 
                  placeholder="e.g. Expedited warehouse replenishment" 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button type="button" className="btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Purchase Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
