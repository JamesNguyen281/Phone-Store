import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: [] as any[],
    totalImport: 0,
    totalExport: 0,
    lowStockProducts: [] as any[],
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: orders } = await supabase
      .from('don_hang')
      .select('*, khach_hang(*)')
      .not('khach_hang_id', 'is', null);

    const { data: products } = await supabase
      .from('dien_thoai')
      .select('*')
      .eq('trang_thai', true);

    const { data: customers } = await supabase
      .from('khach_hang')
      .select('*');

    const { data: importInvoices } = await supabase
      .from('hoa_don')
      .select('tong_tien')
      .eq('phan_loai', 'NHAP');

    const { data: lowStock } = await supabase
      .from('dien_thoai')
      .select('*, hang_dien_thoai(*)')
      .eq('trang_thai', true)
      .lte('so_luong_ton', 5)
      .order('so_luong_ton', { ascending: true })
      .limit(5);

    // Tổng doanh thu = Tổng đơn hàng đã giao (= Tổng xuất hàng)
    const totalRevenue = orders
      ?.filter((o) => o.ma_trang_thai === 'DAGIAO')
      .reduce((sum, o) => sum + o.tong_tien, 0) || 0;

    const totalImport = importInvoices?.reduce((sum, inv) => sum + Number(inv.tong_tien), 0) || 0;
    
    // Tổng xuất = Tổng bán (đơn hàng đã giao)
    const totalExport = totalRevenue;

    setStats({
      totalRevenue,
      totalOrders: orders?.length || 0,
      totalProducts: products?.length || 0,
      totalCustomers: customers?.length || 0,
      recentOrders: orders?.slice(0, 5) || [],
      totalImport,
      totalExport,
      lowStockProducts: lowStock || [],
    });
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <p className="text-sm text-slate-600">{label}</p>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          label="Doanh thu bán hàng"
          value={stats.totalRevenue.toLocaleString('vi-VN') + ' đ'}
          color="bg-green-500"
        />
        <StatCard
          icon={ShoppingCart}
          label="Đơn hàng khách"
          value={stats.totalOrders}
          color="bg-blue-500"
        />
        <StatCard
          icon={Package}
          label="Sản phẩm"
          value={stats.totalProducts}
          color="bg-orange-500"
        />
        <StatCard
          icon={Users}
          label="Khách hàng"
          value={stats.totalCustomers}
          color="bg-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownCircle className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-slate-900">Tổng giá trị nhập hàng</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {stats.totalImport.toLocaleString('vi-VN')} đ
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ArrowUpCircle className="text-orange-600" size={24} />
            <h3 className="text-lg font-semibold text-slate-900">Tổng giá trị bán hàng (Xuất)</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {stats.totalExport.toLocaleString('vi-VN')} đ
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Đơn hàng đã giao = Đã xuất kho
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-slate-900">Đơn hàng gần đây</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Ngày đặt
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">
                    {order.khach_hang?.ho_ten}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(order.ngay_dat).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                    {order.tong_tien.toLocaleString('vi-VN')} đ
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        order.ma_trang_thai === 'DAGIAO'
                          ? 'bg-green-100 text-green-800'
                          : order.ma_trang_thai === 'DAHUY'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {order.ma_trang_thai === 'DAGIAO'
                        ? 'Đã giao'
                        : order.ma_trang_thai === 'DAHUY'
                        ? 'Đã hủy'
                        : 'Đang xử lý'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {stats.lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="text-red-600" size={24} />
            <h3 className="text-lg font-semibold text-slate-900">Sản phẩm sắp hết hàng</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Hãng
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Số lượng tồn
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Giá bán
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stats.lowStockProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {product.ten_sp}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {product.hang_dien_thoai?.ten_hang || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.so_luong_ton === 0
                          ? 'bg-red-100 text-red-800'
                          : product.so_luong_ton <= 3
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.so_luong_ton} sản phẩm
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                      {product.gia_tien.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
