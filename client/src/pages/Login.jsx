import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(username, password);
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/customer/products');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or unauthorized terminal.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09101a] p-4 font-mono select-none relative overflow-hidden">
      {/* Background Subtle Grid Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none"></div>

      <div className="relative w-full max-w-md bg-[#0d1520] border border-[#202e42] rounded-sm p-6 shadow-2xl text-slate-200 z-10">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#202e42] mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-blue-600 to-slate-900 border border-blue-400/40 flex items-center justify-center text-white shadow-inner">
              <span className="material-symbols-outlined text-[20px]">precision_manufacturing</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-white font-bold tracking-tight uppercase text-[14px]">
                  Wholesale
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 tracking-wider font-semibold">
                  B2B / ADMIN
                </span>
              </div>
              <span className="text-[10px] text-slate-400 leading-none mt-0.5 tracking-wider uppercase">
                LOGISTICS SYS v4.2
              </span>
            </div>
          </div>
          <span className="text-[10px] bg-blue-950/80 border border-blue-800 text-blue-300 px-2 py-0.5 rounded font-bold">
            WH-02
          </span>
        </div>

        {/* Security / Welcome Subtitle */}
        <div className="mb-6">
          <h2 className="text-white text-[16px] font-bold tracking-tight uppercase">
            Terminal Access Portal
          </h2>
          <p className="text-slate-400 text-[11px] mt-1 leading-normal">
            Newark Central Depot Hub WH-02. Authenticate using your provisioned operator ID or reseller credentials.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-2.5 rounded-sm bg-rose-950/80 border border-rose-700 text-rose-200 text-[11px] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-rose-400">gpp_bad</span>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-[12px]">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Terminal Operator / Username
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">
                badge
              </span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full h-9 pl-9 pr-3 bg-[#121c29] border border-[#202e42] rounded-sm font-mono text-[12px] text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. admin or urban_grocers"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
              Access Secret / Password
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[16px]">
                key
              </span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full h-9 pl-9 pr-3 bg-[#121c29] border border-[#202e42] rounded-sm font-mono text-[12px] text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 mt-2 rounded-sm bg-blue-700 hover:bg-blue-600 disabled:bg-slate-700 text-white font-mono text-[12px] font-bold border border-blue-500 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                Authenticating Session...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">login</span>
                Connect to Terminal
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Pre-fill Credentials */}
        <div className="mt-6 pt-4 border-t border-[#202e42]">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
            Quick 1-Click Sandbox Credentials:
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin', 'admin123')}
              className="p-2 rounded-sm bg-[#121c29] hover:bg-[#1a293e] border border-[#202e42] text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <strong className="text-white group-hover:text-blue-400">Admin Controller</strong>
                <span className="text-[9px] px-1 bg-amber-950 text-amber-300 border border-amber-800 rounded">ROOT</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">admin / admin123</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('urban_grocers', 'password123')}
              className="p-2 rounded-sm bg-[#121c29] hover:bg-[#1a293e] border border-[#202e42] text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <strong className="text-white group-hover:text-blue-400">Urban Grocers</strong>
                <span className="text-[9px] px-1 bg-blue-950 text-blue-300 border border-blue-800 rounded">RETAILER</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">urban_grocers</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('metro_mart', 'password123')}
              className="p-2 rounded-sm bg-[#121c29] hover:bg-[#1a293e] border border-[#202e42] text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <strong className="text-white group-hover:text-blue-400">Metro Supermarket</strong>
                <span className="text-[9px] px-1 bg-blue-950 text-blue-300 border border-blue-800 rounded">RETAILER</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">metro_mart</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('green_valley', 'password123')}
              className="p-2 rounded-sm bg-[#121c29] hover:bg-[#1a293e] border border-[#202e42] text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <strong className="text-white group-hover:text-blue-400">Green Valley</strong>
                <span className="text-[9px] px-1 bg-blue-950 text-blue-300 border border-blue-800 rounded">RETAILER</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">green_valley</span>
            </button>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#202e42] text-center text-[10px] text-slate-500">
          CSC2103 Relational Database Management Systems · Manipal University Jaipur
        </div>
      </div>
    </div>
  );
}
