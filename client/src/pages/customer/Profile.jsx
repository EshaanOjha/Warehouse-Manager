import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    shipping_address: ''
  });

  const [accountMeta, setAccountMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/customer/profile');
      const data = res.data;
      setFormData({
        company_name: data.company_name || '',
        contact_name: data.contact_name || '',
        email: data.email || '',
        phone: data.phone || '',
        shipping_address: data.shipping_address || ''
      });
      setAccountMeta({
        customer_id: data.customer_id,
        credit_limit: data.credit_limit,
        balance: data.balance,
        created_at: data.created_at
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      const res = await api.put('/customer/profile', formData);
      setMessage(res.data.message || 'Terminal account profile updated.');
      
      // Update global user state so Navbar reflects new company name immediately
      updateUser({
        companyName: formData.company_name,
        contactName: formData.contact_name,
        customerEmail: formData.email,
        phone: formData.phone,
        shippingAddress: formData.shipping_address
      });
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-[12px] text-slate-500">
        <span className="material-symbols-outlined animate-spin mr-2 text-blue-600">sync</span>
        Querying terminal account parameters...
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
              <span className="material-symbols-outlined text-blue-700 text-[20px]">tune</span>
              Terminal &amp; Account Configuration
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 border border-emerald-300 font-mono text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              ACCT #RET-{String(accountMeta?.customer_id || user?.customerId || 100).padStart(6, '0')}
            </span>
          </div>
          <p className="font-mono text-[11px] text-slate-600 mt-1 flex flex-wrap items-center gap-2">
            <span>REGISTERED ENTITY: <strong className="text-slate-900">{formData.company_name || user?.username}</strong></span>
            <span>·</span>
            <span>DEPOT HUB: <strong className="text-slate-900">NEWARK CENTRAL [WH-02]</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-space-sm">
          <Link
            to="/customer/products"
            className="h-8 px-3 rounded-sm bg-slate-900 hover:bg-slate-800 text-white font-mono text-[11px] font-bold shadow-sm transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <span className="material-symbols-outlined text-[15px]">inventory_2</span>
            Browse Catalogue
          </Link>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 bg-white rounded-sm border border-slate-300 shadow-sm p-space-md">
          <div className="border-b border-slate-200 pb-2.5 mb-4 flex items-center justify-between">
            <span className="font-headline-sm text-slate-900 text-[14px] font-bold uppercase tracking-tight flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-700 text-[18px]">store</span>
              Retailer Commercial Profile
            </span>
            <span className="text-[10px] text-slate-500 uppercase">
              Used for B2B Manifests &amp; Bills of Lading
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-[12px]">
            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">
                Commercial Shop / Registered Company Name *
              </label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={e => handleChange('company_name', e.target.value)}
                placeholder="e.g. Urban Corner Groceries"
                className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">
                  Procurement Manager / Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact_name}
                  onChange={e => handleChange('contact_name', e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">
                  Dispatch Contact Phone
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  placeholder="e.g. +1 (555) 234-5678"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">
                Official Billing &amp; Electronic Notice Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="procurement@urbangroceries.com"
                className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-700 mb-1">
                Default Pallet Shipping &amp; Receiving Dock Address *
              </label>
              <textarea
                rows="3"
                required
                value={formData.shipping_address}
                onChange={e => handleChange('shipping_address', e.target.value)}
                placeholder="Full delivery street address, loading bay number, dock specifications..."
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-sm font-mono text-[12px] text-slate-900 focus:outline-none focus:bg-white focus:border-blue-600 transition-colors"
              />
              <span className="block text-[10px] text-slate-500 mt-1">
                Pre-populates automated Bills of Lading and driver dispatch instructions.
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={fetchProfile}
                disabled={saving}
                className="h-9 px-4 rounded-sm bg-white hover:bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-300 transition-colors cursor-pointer"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving}
                className="h-9 px-5 rounded-sm bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white font-mono text-[11px] font-bold border border-blue-900 transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined text-[15px] animate-spin">sync</span>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[15px]">save</span>
                    Update Terminal Parameters
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Account & Revolving Credit Ledger */}
        <div className="flex flex-col gap-space-md">
          {/* Terminal Credit Card */}
          <div className="bg-[#0d1520] text-slate-200 rounded-sm border border-[#202e42] p-space-md shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#202e42] mb-3">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                COMMERCIAL LEDGER DOCK
              </span>
              <span className="text-[9px] bg-blue-900/60 border border-blue-700 text-blue-300 px-1 py-0.2 rounded font-bold">
                ACTIVE
              </span>
            </div>

            <div className="flex flex-col gap-3 text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] uppercase block">ACCOUNT IDENTIFIER:</span>
                <strong className="text-white text-[13px]">
                  ACCT #RET-{String(accountMeta?.customer_id || 100).padStart(6, '0')}
                </strong>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase block">LOGIN PRINCIPAL:</span>
                <strong className="text-slate-200">{user?.username}</strong>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase block">APPROVED CREDIT FACILITY:</span>
                <span className="text-emerald-400 text-[18px] font-bold tabular-nums">
                  ${Number(accountMeta?.credit_limit || 50000).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase block">CURRENT OUTSTANDING BALANCE:</span>
                <span className={`text-[14px] font-bold tabular-nums ${Number(accountMeta?.balance) > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                  ${Number(accountMeta?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="pt-2 border-t border-[#202e42]">
                <span className="text-slate-400 text-[10px] uppercase block">REVOLVING SETTLEMENT TERMS:</span>
                <strong className="text-white">NET 30 DAYS (GOLD CONTRACT TIER)</strong>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase block">ACCOUNT REGISTERED ON:</span>
                <span className="text-slate-400">
                  {accountMeta?.created_at ? new Date(accountMeta.created_at).toLocaleDateString() : 'Active Partner'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Security / Facility Card */}
          <div className="bg-white rounded-sm border border-slate-300 p-space-md text-[11px] text-slate-600">
            <span className="font-bold text-slate-900 text-[12px] block mb-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-blue-700">security</span>
              Facility Security Notice
            </span>
            <p className="text-slate-500 leading-normal mb-2">
              All transactions executed on this terminal are cryptographically logged against audit trails with foreign key constraints.
            </p>
            <div className="text-[10px] text-slate-400 font-mono">
              SESSION SHA-256: VALIDATED · NEWARK-HUB-WH02
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
