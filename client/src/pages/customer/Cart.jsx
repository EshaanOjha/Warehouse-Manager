import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Cart() {
  const { 
    cartItems, 
    updateCartQty, 
    removeFromCart, 
    clearCart,
    subtotal, 
    tax, 
    total,
    getTierPrice 
  } = useCart();
  const { user } = useAuth();

  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    setOrderError('');
    setOrderSuccess('');
    setSubmitting(true);

    const items = cartItems.map(item => ({
      product_id: item.product.product_id,
      quantity: item.quantity
    }));

    if (items.length === 0) {
      setOrderError('Your procurement draft manifest is empty.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.post('/customer/orders', {
        items,
        notes
      });
      setOrderSuccess(`Order confirmed! Manifest #${res.data.order?.order_id || ''} created. Warehouse stock allocated.`);
      clearCart();
      setNotes('');
      setTimeout(() => {
        navigate('/customer/orders');
      }, 1500);
    } catch (err) {
      console.error('Order placement failed:', err);
      // Catches database trigger checks (e.g. min_qty or insufficient stock)
      setOrderError(err.response?.data?.error || 'Database rejected order.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFreeFreight = subtotal >= 1500;

  return (
    <div className="flex flex-col w-full">
      {/* Top Command & Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-md bg-white p-3.5 rounded-sm border border-slate-300 shadow-sm">
        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-headline-lg text-[18px] text-slate-900 font-bold tracking-tight uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-700 text-[20px]">shopping_cart_checkout</span>
              Procurement Manifest Draft
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-blue-100 text-blue-800 border border-blue-300 font-mono text-[10px] font-bold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              {cartItems.length} SKU Line{cartItems.length !== 1 ? 's' : ''} Staged
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>DISPATCH HUB: <strong className="text-slate-900">NEWARK CENTRAL [WH-02]</strong></span>
            <span>·</span>
            <span>CONTRACT: <strong className="text-slate-900 font-bold bg-slate-200/80 px-1 py-0.5 rounded">GOLD (NET 30)</strong></span>
            <span>·</span>
            <span>RETAILER: <strong className="text-blue-700">{user?.companyName || user?.username}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <Link
            to="/customer/products"
            className="h-8 px-3 rounded-sm bg-white hover:bg-slate-100 text-slate-800 font-mono text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1.5 border border-slate-300"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            Continue Adding SKUs
          </Link>
          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              disabled={submitting}
              className="h-8 px-2.5 rounded-sm bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-mono text-[11px] font-semibold transition-colors flex items-center gap-1 border border-slate-300 cursor-pointer"
              title="Clear Draft"
            >
              <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
              Clear Draft
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {orderSuccess && (
        <div className="mb-space-md p-3 rounded-sm bg-emerald-950 text-emerald-200 border border-emerald-700 flex items-center justify-between font-mono text-[12px] shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-emerald-400">task_alt</span>
            <span className="font-bold">{orderSuccess}</span>
          </div>
          <span className="text-emerald-300 text-[11px]">Redirecting to Manifests...</span>
        </div>
      )}

      {orderError && (
        <div className="mb-space-md p-3 rounded-sm bg-rose-950 text-rose-200 border border-rose-700 flex items-center justify-between font-mono text-[12px] shadow-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-rose-400">gpp_bad</span>
            <span><strong className="text-rose-100">DATABASE CONSTRAINT REJECTION:</strong> {orderError}</span>
          </div>
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-sm border border-slate-300 shadow-sm p-12 flex flex-col items-center justify-center text-center font-mono">
          <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400 mb-4">
            <span className="material-symbols-outlined text-[36px]">production_quantity_limits</span>
          </div>
          <h3 className="font-headline-sm text-slate-900 text-[18px] font-bold mb-1">
            No Line Items Staged in Draft
          </h3>
          <p className="text-slate-500 text-[12px] max-w-md mb-6">
            Review the live inventory catalogue to configure case quantities and trigger automated volume discount tiers.
          </p>
          <Link
            to="/customer/products"
            className="h-9 px-4 rounded-sm bg-blue-700 hover:bg-blue-800 text-white text-[12px] font-bold flex items-center gap-2 border border-blue-800 shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">shelves</span>
            Open Products Catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          {/* Left Column: Items Manifest Table */}
          <div className="lg:col-span-2 flex flex-col gap-space-md">
            <div className="bg-white rounded-sm border border-slate-300 shadow-sm overflow-hidden font-mono">
              <div className="bg-slate-100 px-space-md py-2.5 border-b border-slate-300 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-blue-700">fact_check</span>
                  Allocated SKUs ({cartItems.length})
                </span>
                <span className="text-[10px] text-slate-500 uppercase">
                  Automatic Live Tier Pricing Active
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase tracking-wider h-8 border-b border-slate-200 font-bold">
                      <th className="px-space-md py-1">SKU / SPEC</th>
                      <th className="px-space-md py-1 text-right">BASE PRICE</th>
                      <th className="px-space-md py-1 text-center">QUANTITY</th>
                      <th className="px-space-md py-1 text-right">TIER PRICE</th>
                      <th className="px-space-md py-1 text-right">TOTAL</th>
                      <th className="px-space-md py-1 text-center">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[12px] text-slate-900">
                    {cartItems.map(({ product, quantity }) => {
                      const liveUnitPrice = getTierPrice(product, quantity);
                      const itemSubtotal = liveUnitPrice * quantity;
                      const hasDiscount = liveUnitPrice < product.base_price;
                      const discountPct = hasDiscount 
                        ? (((product.base_price - liveUnitPrice) / product.base_price) * 100).toFixed(0)
                        : 0;

                      return (
                        <tr key={product.product_id} className="hover:bg-slate-50 transition-colors">
                          {/* Product Details */}
                          <td className="px-space-md py-3">
                            <div className="font-bold text-slate-900 leading-tight">
                              {product.name}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                              <span className="px-1 py-0.2 bg-slate-100 border border-slate-300 rounded font-semibold text-slate-700">
                                {product.sku}
                              </span>
                              <span>·</span>
                              <span>Stock: <strong className="text-slate-800">{product.stock_qty}</strong></span>
                              <span>·</span>
                              <span>MOQ: <strong className="text-slate-800">{product.min_order_qty || 1}</strong></span>
                            </div>
                          </td>

                          {/* Base Price */}
                          <td className="px-space-md py-3 text-right tabular-nums text-slate-500">
                            ${Number(product.base_price).toFixed(2)}
                          </td>

                          {/* Quantity Stepper */}
                          <td className="px-space-md py-3 text-center">
                            <div className="inline-flex items-center bg-slate-100 rounded-sm border border-slate-300 p-0.5">
                              <button
                                onClick={() => updateCartQty(product.product_id, Math.max((product.min_order_qty || 1), quantity - 1), product)}
                                disabled={quantity <= (product.min_order_qty || 1)}
                                className="w-6 h-6 flex items-center justify-center rounded-sm bg-white border border-slate-300 text-slate-800 hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[13px]">remove</span>
                              </button>
                              <input
                                type="number"
                                min={product.min_order_qty || 1}
                                max={product.stock_qty}
                                value={quantity}
                                onChange={e => updateCartQty(product.product_id, e.target.value, product)}
                                className="w-12 text-center bg-transparent font-mono text-[12px] font-bold text-slate-900 focus:outline-none tabular-nums"
                              />
                              <button
                                onClick={() => updateCartQty(product.product_id, Math.min(product.stock_qty, quantity + 1), product)}
                                disabled={quantity >= product.stock_qty}
                                className="w-6 h-6 flex items-center justify-center rounded-sm bg-white border border-slate-300 text-slate-800 hover:bg-slate-200 disabled:opacity-40 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[13px]">add</span>
                              </button>
                            </div>
                          </td>

                          {/* Tier Unit Price */}
                          <td className="px-space-md py-3 text-right tabular-nums">
                            <div className="font-bold text-slate-900">
                              ${Number(liveUnitPrice).toFixed(2)}
                            </div>
                            {hasDiscount ? (
                              <span className="inline-block font-mono text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold">
                                -{discountPct}% OFF
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">Base Tier</span>
                            )}
                          </td>

                          {/* Line Total */}
                          <td className="px-space-md py-3 text-right tabular-nums font-bold text-blue-700 text-[13px]">
                            ${Number(itemSubtotal).toFixed(2)}
                          </td>

                          {/* Remove */}
                          <td className="px-space-md py-3 text-center">
                            <button
                              onClick={() => removeFromCart(product.product_id)}
                              className="w-7 h-7 inline-flex items-center justify-center rounded-sm text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Freight Policy Banner */}
            <div className="bg-slate-900 text-slate-200 rounded-sm p-3 border border-slate-700 flex items-center justify-between font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">local_shipping</span>
                <span>
                  {isFreeFreight ? (
                    <strong className="text-emerald-400">FREE MULTI-PALLET FREIGHT APPLIED (Manifest &gt; $1,500.00)</strong>
                  ) : (
                    <span>Add <strong className="text-amber-300">${(1500 - subtotal).toFixed(2)}</strong> more to unlock Free Pallet Logistics</span>
                  )}
                </span>
              </div>
              <span className="text-slate-400">HUB-WH02 TRUCKLOAD</span>
            </div>
          </div>

          {/* Right Column: Checkout Summary & Submission */}
          <div className="flex flex-col gap-space-md font-mono">
            <div className="bg-white rounded-sm border border-slate-300 shadow-sm p-space-md">
              <div className="border-b border-slate-200 pb-2.5 mb-3 flex items-center justify-between">
                <span className="font-headline-sm text-slate-900 text-[14px] font-bold uppercase tracking-tight flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-blue-700 text-[17px]">receipt</span>
                  Financial Summary
                </span>
                <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
                  USD CURRENCY
                </span>
              </div>

              <div className="flex flex-col gap-2 text-[12px] mb-4">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Gross Line Subtotal:</span>
                  <span className="font-bold text-slate-900 tabular-nums">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Wholesale State Surcharge (5%):</span>
                  <span className="font-bold text-slate-900 tabular-nums">${tax.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Pallet Freight Logistics:</span>
                  <span className="font-bold text-emerald-700">
                    {isFreeFreight ? 'FREE' : '$120.00'}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex items-baseline justify-between text-[14px]">
                  <span className="font-bold text-slate-900">Total Settlement:</span>
                  <span className="font-display-md text-blue-700 font-bold tabular-nums text-[18px]">
                    ${(total + (isFreeFreight ? 0 : 120)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-4">
                <label className="block text-[10px] uppercase font-bold text-slate-700 tracking-wider mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">edit_note</span>
                  Dock Receiving / Driver Instructions
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Unload at Bay 3, call logistics 30 mins prior to arrival."
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                />
              </div>

              {/* Submit CTA */}
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full h-10 rounded-sm bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white font-mono text-[12px] font-bold shadow-sm transition-all flex items-center justify-center gap-2 border border-blue-900 cursor-pointer active:scale-98"
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[17px] animate-spin">sync</span>
                    Executing sp_finalize_order...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[17px]">send</span>
                    Confirm &amp; Dispatch Order
                  </>
                )}
              </button>

              <div className="mt-3 pt-3 border-t border-slate-200 text-[10px] text-slate-500 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span>Terms: <strong>NET 30 Invoicing</strong></span>
                  <span>Credit Limit: <strong className="text-emerald-700">${Number(user?.creditLimit || 50000).toLocaleString()}</strong></span>
                </div>
                <p className="text-slate-400 mt-0.5 leading-tight">
                  Inventory is reserved immediately upon confirmation using ACID transaction triggers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
