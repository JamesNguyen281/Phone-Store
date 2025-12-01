import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart, LogOut, LayoutDashboard, User, Package, MessageSquare, PackagePlus, BarChart3 } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Navbar({ currentView, onViewChange }: NavbarProps) {
  const { taiKhoan, signOut, khachHang, nhanVien } = useAuth();
  const { getTotalItems } = useCart();

  const isAdmin = taiKhoan?.ma_vai_tro === 'ADMIN';
  const isNhanVien = taiKhoan?.ma_vai_tro === 'NHANVIEN';
  const isKhachHang = taiKhoan?.ma_vai_tro === 'KHACHHANG';

  const userName = isKhachHang ? khachHang?.ho_ten : nhanVien?.ho_ten;

  const handleSignOut = async () => {
    await signOut();
  };

  const getNavbarStyle = () => {
    if (isAdmin || isNhanVien) {
      return 'bg-gradient-to-r from-slate-800 to-slate-900';
    }
    return 'bg-white';
  };

  const getTextColor = () => {
    if (isAdmin || isNhanVien) {
      return 'text-white';
    }
    return 'text-slate-900';
  };

  const getButtonStyle = (isActive: boolean) => {
    if (isAdmin || isNhanVien) {
      return isActive
        ? 'bg-white/20 text-white'
        : 'text-slate-200 hover:bg-white/10';
    }
    return isActive
      ? 'bg-blue-50 text-blue-700'
      : 'text-slate-700 hover:bg-slate-50';
  };

  return (
    <nav className={`${getNavbarStyle()} shadow-lg border-b ${isAdmin || isNhanVien ? 'border-slate-700' : 'border-slate-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex-shrink-0 flex items-center">
              <Package className={`h-8 w-8 ${isAdmin || isNhanVien ? 'text-blue-400' : 'text-blue-600'}`} />
              <div className="ml-2">
                <span className={`text-xl font-bold ${getTextColor()}`}>PhoneStore</span>
                {(isAdmin || isNhanVien) && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs font-semibold rounded">
                    {isAdmin ? 'ADMIN' : 'STAFF'}
                  </span>
                )}
              </div>
            </div>

            <div className="hidden md:flex space-x-4">
              {(isAdmin || isNhanVien) && (
                <>
                  <button
                    onClick={() => onViewChange('dashboard')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonStyle(currentView === 'dashboard')}`}
                  >
                    <LayoutDashboard className="inline-block mr-1" size={16} />
                    Dashboard
                  </button>
                  <button
                    onClick={() => onViewChange('products')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonStyle(currentView === 'products')}`}
                  >
                    Sản phẩm
                  </button>
                  <button
                    onClick={() => onViewChange('orders')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonStyle(currentView === 'orders')}`}
                  >
                    Đơn hàng
                  </button>
                  <button
                    onClick={() => onViewChange('import')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonStyle(currentView === 'import')}`}
                  >
                    <PackagePlus className="inline-block mr-1" size={16} />
                    Nhập hàng
                  </button>
                  <button
                    onClick={() => onViewChange('feedback')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonStyle(currentView === 'feedback')}`}
                  >
                    <MessageSquare className="inline-block mr-1" size={16} />
                    Phản hồi
                  </button>
                  <button
                    onClick={() => onViewChange('inventory-report')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonStyle(currentView === 'inventory-report')}`}
                  >
                    <BarChart3 className="inline-block mr-1" size={16} />
                    BC Nhập xuất
                  </button>
                </>
              )}

              {isAdmin && (
                <>
                  <button
                    onClick={() => onViewChange('employee-report')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonStyle(currentView === 'employee-report')}`}
                  >
                    <BarChart3 className="inline-block mr-1" size={16} />
                    BC Nhân viên
                  </button>
                  <button
                    onClick={() => onViewChange('users')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonStyle(currentView === 'users')}`}
                  >
                    <User className="inline-block mr-1" size={16} />
                    Người dùng
                  </button>
                </>
              )}

              {isKhachHang && (
                <>
                  <button
                    onClick={() => onViewChange('shop')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonStyle(currentView === 'shop')}`}
                  >
                    Mua sắm
                  </button>
                  <button
                    onClick={() => onViewChange('my-orders')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonStyle(currentView === 'my-orders')}`}
                  >
                    Đơn hàng của tôi
                  </button>
                  <button
                    onClick={() => onViewChange('my-feedback')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${getButtonStyle(currentView === 'my-feedback')}`}
                  >
                    Phản hồi
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isKhachHang && (
              <button
                onClick={() => onViewChange('cart')}
                className="relative p-2 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <ShoppingCart size={24} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className={`text-sm font-medium ${getTextColor()}`}>{userName}</p>
                <p className={`text-xs ${isAdmin || isNhanVien ? 'text-slate-400' : 'text-slate-500'}`}>
                  {isAdmin ? 'Quản trị viên' : isNhanVien ? 'Nhân viên' : 'Khách hàng'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className={`p-2 rounded-lg transition-colors ${
                  isAdmin || isNhanVien
                    ? 'text-slate-200 hover:bg-red-600 hover:text-white'
                    : 'text-slate-700 hover:bg-red-50 hover:text-red-600'
                }`}
                title="Đăng xuất"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
