import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';

// Customer Pages
import CustomerProducts from './pages/customer/Products';
import CustomerCart from './pages/customer/Cart';
import CustomerOrders from './pages/customer/Orders';
import CustomerReceipt from './pages/customer/Receipt';
import CustomerInventory from './pages/customer/Inventory';
import CustomerProfile from './pages/customer/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminSuppliers from './pages/admin/Suppliers';
import AdminOrders from './pages/admin/Orders';
import AdminPurchaseOrders from './pages/admin/PurchaseOrders';
import AdminReports from './pages/admin/Reports';

function AuthenticatedLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#eceff3]">
      <Navbar />
      <div className="pl-[260px] min-h-screen bg-[#eceff3]">
        <main className="w-full pt-14 px-6 py-6 bg-[#eceff3] min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09101a] text-slate-300 font-mono text-sm">
        <span className="material-symbols-outlined animate-spin mr-2 text-blue-400">sync</span>
        Authenticating session & connecting to Newark Depot WH-02...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/customer/products'} replace />;
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

function DefaultRedirect() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09101a] text-slate-300 font-mono text-sm">
        <span className="material-symbols-outlined animate-spin mr-2 text-blue-400">sync</span>
        Connecting...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/customer/products'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Customer Routes */}
            <Route path="/customer/products" element={
              <ProtectedRoute role="customer">
                <CustomerProducts />
              </ProtectedRoute>
            } />
            <Route path="/customer/catalogue" element={
              <Navigate to="/customer/products" replace />
            } />
            <Route path="/customer/cart" element={
              <ProtectedRoute role="customer">
                <CustomerCart />
              </ProtectedRoute>
            } />
            <Route path="/customer/orders" element={
              <ProtectedRoute role="customer">
                <CustomerOrders />
              </ProtectedRoute>
            } />
            <Route path="/customer/receipts" element={
              <ProtectedRoute role="customer">
                <CustomerReceipt />
              </ProtectedRoute>
            } />
            <Route path="/customer/inventory" element={
              <ProtectedRoute role="customer">
                <CustomerInventory />
              </ProtectedRoute>
            } />
            <Route path="/customer/profile" element={
              <ProtectedRoute role="customer">
                <CustomerProfile />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/products" element={
              <ProtectedRoute role="admin">
                <AdminProducts />
              </ProtectedRoute>
            } />
            <Route path="/admin/suppliers" element={
              <ProtectedRoute role="admin">
                <AdminSuppliers />
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute role="admin">
                <AdminOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/purchase-orders" element={
              <ProtectedRoute role="admin">
                <AdminPurchaseOrders />
              </ProtectedRoute>
            } />
            <Route path="/admin/reports" element={
              <ProtectedRoute role="admin">
                <AdminReports />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<DefaultRedirect />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
