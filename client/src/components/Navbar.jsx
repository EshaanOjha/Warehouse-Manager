import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import AlertBell from './AlertBell';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { totalItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <>
      {/* LEFT INDUSTRIAL SIDEBAR (w-[260px]) */}
      <aside className="fixed left-0 top-0 h-full w-[260px] bg-[#0d1520] border-r border-[#202e42] z-50 flex flex-col justify-between text-slate-200 select-none">
        <div className="flex flex-col">
          {/* Top Brand & Facility Badge */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-[#202e42] bg-[#09101a]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-blue-600 to-slate-900 border border-blue-400/30 flex items-center justify-center text-white shadow-inner">
                <span className="material-symbols-outlined text-[18px]">precision_manufacturing</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-sm text-white font-bold tracking-tight uppercase text-[13px]">Warehouse</span>
                  <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 tracking-wider font-semibold">
                    {isAdmin ? 'ADMIN' : 'B2B'}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400 leading-none mt-0.5 tracking-wider uppercase">
                  LOGISTICS SYS v4.2
                </span>
              </div>
            </div>
            <span className="font-mono text-[10px] bg-blue-950/80 border border-blue-800 text-blue-300 px-1.5 py-0.5 rounded font-bold">
              WH-02
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1 p-2 font-mono text-[12px]">
            {isAdmin ? (
              <>
                <NavLink
                  to="/admin/dashboard"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1a293e] text-white border-l-2 border-blue-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-[#152030] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-blue-400">dashboard</span>
                    <span className="tracking-wide">Operations Desk</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/admin/products"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1a293e] text-white border-l-2 border-blue-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-[#152030] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-emerald-400">shelves</span>
                    <span className="tracking-wide">Products & Tiers</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/admin/suppliers"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1a293e] text-white border-l-2 border-blue-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-[#152030] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-amber-400">handshake</span>
                    <span className="tracking-wide">Suppliers & Cost</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/admin/orders"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1a293e] text-white border-l-2 border-blue-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-[#152030] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-cyan-400">local_shipping</span>
                    <span className="tracking-wide">Sales Manifests</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/admin/purchase-orders"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1a293e] text-white border-l-2 border-blue-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-[#152030] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-purple-400">move_to_inbox</span>
                    <span className="tracking-wide">Procurement POs</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/admin/reports"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1a293e] text-white border-l-2 border-blue-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-[#152030] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-indigo-400">query_stats</span>
                    <span className="tracking-wide">SQL Analytics</span>
                  </div>
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/customer/products"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1a293e] text-white border-l-2 border-blue-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-[#152030] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px] text-blue-400">inventory_2</span>
                    <span className="tracking-wide">Catalogue [F1]</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/customer/cart"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1a293e] text-white border-l-2 border-blue-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-[#152030] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px]">shopping_cart</span>
                    <span className="tracking-wide">Cart Draft</span>
                  </div>
                  {totalItemCount > 0 && (
                    <span className="font-mono text-[10px] px-1.5 py-0.2 bg-blue-600 text-white rounded font-bold">
                      {totalItemCount}
                    </span>
                  )}
                </NavLink>

                <NavLink
                  to="/customer/orders"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1a293e] text-white border-l-2 border-blue-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-[#152030] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px]">local_shipping</span>
                    <span className="tracking-wide">Manifests</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/customer/inventory"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1a293e] text-white border-l-2 border-blue-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-[#152030] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px]">warehouse</span>
                    <span className="tracking-wide">Depot Inventory</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/customer/receipts"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1a293e] text-white border-l-2 border-blue-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-[#152030] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px]">receipt_long</span>
                    <span className="tracking-wide">Bill of Lading</span>
                  </div>
                </NavLink>

                <NavLink
                  to="/customer/profile"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-sm transition-colors ${
                      isActive
                        ? 'bg-[#1a293e] text-white border-l-2 border-blue-500 font-semibold shadow-sm'
                        : 'text-slate-400 hover:bg-[#152030] hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[17px]">tune</span>
                    <span className="tracking-wide">Terminal Config</span>
                  </div>
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* BOTTOM USER DOCK */}
        <div className="p-2 border-t border-[#202e42] bg-[#09101a]">
          <div className="p-2.5 rounded-sm bg-[#121c29] border border-[#202e42] flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                ONLINE
              </span>
              <button 
                onClick={handleLogout}
                className="font-mono text-[10px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer border-none bg-transparent"
              >
                SWITCH
              </button>
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-[13px] font-bold text-white truncate">
                {isAdmin ? 'System Administrator' : (user.companyName || user.username)}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {isAdmin ? 'ROOT DISPATCH CONTROLLER' : `ACCT #RET-${String(user.customerId || 100).padStart(6, '0')}`}
              </span>
            </div>
            {!isAdmin && (
              <div className="pt-1.5 mt-0.5 border-t border-[#202e42] flex items-center justify-between font-mono text-[10px]">
                <span className="text-slate-400">CREDIT:</span>
                <strong className="text-emerald-400 tabular-nums">${Number(user.creditLimit || 50000).toLocaleString()}</strong>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* TOP COMMAND HEADER (fixed top-0 left-[260px] right-0 h-14) */}
      <header className="fixed top-0 left-[260px] right-0 h-14 bg-slate-900 border-b border-slate-800 text-slate-200 z-40 px-4 flex items-center justify-between shadow-sm">
        {/* Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              placeholder="Search inventory SKU, lot barcode, order id... (⌘K)"
              className="w-full h-8 pl-8 pr-12 bg-slate-950 border border-slate-700 rounded-sm font-mono text-[12px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] text-slate-400 bg-slate-800 px-1 py-0.5 rounded border border-slate-700">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section Actions & User Badge */}
        <div className="flex items-center gap-3">
          {/* Facility Badge */}
          <div className="hidden md:flex items-center gap-1.5 font-mono text-[11px] bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700 text-slate-300">
            <span className="material-symbols-outlined text-[15px] text-amber-400">warehouse</span>
            <span>HUB: <strong className="text-white">NEWARK-WH-02</strong></span>
          </div>

          {/* Alert Notification Bell */}
          {!isAdmin && <AlertBell />}

          {/* Small Cart Shortcut in Header */}
          {!isAdmin && (
            <Link
              to="/customer/cart"
              className="relative h-8 px-2.5 rounded-sm border border-slate-700 bg-slate-950 flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors font-mono text-[11px]"
              title="Cart Draft"
            >
              <span className="material-symbols-outlined text-[17px] text-blue-400">shopping_cart</span>
              <span className="font-bold text-white tabular-nums">{totalItemCount}</span>
            </Link>
          )}

          <div className="h-5 w-[1px] bg-slate-700"></div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-1">
            <div className="flex flex-col text-right font-mono">
              <span className="text-[12px] font-semibold text-white leading-tight">
                {user.contactName || user.username}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                {isAdmin ? 'Warehouse Controller' : `${user.companyName || 'Retail Partner'}`}
              </span>
            </div>
            <Link
              to={isAdmin ? '/admin/dashboard' : '/customer/profile'}
              className="w-8 h-8 rounded bg-gradient-to-tr from-blue-700 to-slate-800 border border-blue-400/40 flex items-center justify-center text-white"
              title="User Account"
            >
              <span className="material-symbols-outlined text-[18px]">badge</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-7 h-7 rounded flex items-center justify-center text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors border-none bg-transparent cursor-pointer"
              title="Log Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
