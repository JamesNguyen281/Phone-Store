import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import LoginForm from './components/Auth/LoginForm';
import Navbar from './components/Layout/Navbar';
import Dashboard from './components/Dashboard/Dashboard';
import ProductManagementTabs from './components/Products/ProductManagementTabs';
import SalesManagementTabs from './components/Sales/SalesManagementTabs';
import UserManagement from './components/Users/UserManagement';
import FeedbackManagement from './components/Feedback/FeedbackManagement';
import ImportManagement from './components/Inventory/ImportManagement';
import InventoryReport from './components/Reports/InventoryReport';
import EmployeeReport from './components/Reports/EmployeeReport';
import ShopView from './components/Shop/ShopView';
import CartView from './components/Cart/CartView';
import MyOrders from './components/Orders/MyOrders';
import CustomerFeedback from './components/Feedback/CustomerFeedback';

function AppContent() {
  const { user, taiKhoan, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || !taiKhoan) {
    return <LoginForm />;
  }

  const isAdmin = taiKhoan.ma_vai_tro === 'ADMIN';
  const isNhanVien = taiKhoan.ma_vai_tro === 'NHANVIEN';
  const isKhachHang = taiKhoan.ma_vai_tro === 'KHACHHANG';

  if (isKhachHang && currentView === 'dashboard') {
    setCurrentView('shop');
  }

  const renderView = () => {
    if (isKhachHang) {
      switch (currentView) {
        case 'shop':
          return <ShopView />;
        case 'cart':
          return <CartView />;
        case 'my-orders':
          return <MyOrders />;
        case 'my-feedback':
          return <CustomerFeedback />;
        default:
          return <ShopView />;
      }
    }

    if (isAdmin || isNhanVien) {
      switch (currentView) {
        case 'dashboard':
          return <Dashboard />;
        case 'products':
        case 'categories':
        case 'brands':
          return <ProductManagementTabs />;
        case 'sales':
        case 'orders':
          return <SalesManagementTabs />;
        case 'import':
          return <ImportManagement />;
        case 'inventory-report':
          return <InventoryReport />;
        case 'employee-report':
          return isAdmin ? <EmployeeReport /> : <Dashboard />;
        case 'feedback':
          return <FeedbackManagement />;
        case 'users':
          return isAdmin ? <UserManagement /> : <Dashboard />;
        default:
          return <Dashboard />;
      }
    }

    return <Dashboard />;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar currentView={currentView} onViewChange={setCurrentView} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
