import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, TrendingUp, TrendingDown, Archive, Calendar } from 'lucide-react';

interface InventoryStats {
  product_id: string;
  product_name: string;
  brand_name: string;
  current_stock: number;
  total_imported: number;
  total_sold: number;
  import_value: number;
  sales_value: number;
}

export default function InventoryReport() {
  const [stats, setStats] = useState<InventoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [summary, setSummary] = useState({
    totalImported: 0,
    totalSold: 0,
    totalStock: 0,
    importValue: 0,
    salesValue: 0,
  });

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date();
    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setDateTo(today.toISOString().split('T')[0]);
    setDateFrom(lastMonth.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) {
      loadInventoryReport();
    }
  }, [dateFrom, dateTo]);

  const loadInventoryReport = async () => {
    setLoading(true);
    try {
      // Get all products with current stock
      const { data: products } = await supabase
        .from('dien_thoai')
        .select('id, ten_sp, so_luong_ton, gia_tien, hang_dien_thoai(ten_hang)');

      if (!products) return;

      // Get import data (from invoices with NHAP type)
      const { data: imports } = await supabase
        .from('hoa_don')
        .select('don_hang(chi_tiet_don_hang(dien_thoai_id, so_luong, gia_ban, thanh_tien))')
        .eq('phan_loai', 'NHAP')
        .gte('ngay_tao', dateFrom)
        .lte('ngay_tao', dateTo + 'T23:59:59');

      // Get sales data (from orders with DAGIAO status = exported/sold)
      const { data: salesOrders } = await supabase
        .from('don_hang')
        .select('chi_tiet_don_hang(dien_thoai_id, so_luong, gia_ban, thanh_tien)')
        .eq('ma_trang_thai', 'DAGIAO')
        .not('khach_hang_id', 'is', null)
        .gte('ngay_dat', dateFrom)
        .lte('ngay_dat', dateTo + 'T23:59:59');

      // Process data
      const statsMap = new Map<string, InventoryStats>();

      products.forEach((product: any) => {
        statsMap.set(product.id, {
          product_id: product.id,
          product_name: product.ten_sp,
          brand_name: product.hang_dien_thoai?.ten_hang || 'N/A',
          current_stock: product.so_luong_ton,
          total_imported: 0,
          total_sold: 0,
          import_value: 0,
          sales_value: 0,
        });
      });

      // Calculate imports
      imports?.forEach((invoice: any) => {
        invoice.don_hang?.chi_tiet_don_hang?.forEach((detail: any) => {
          const stat = statsMap.get(detail.dien_thoai_id);
          if (stat) {
            stat.total_imported += detail.so_luong;
            stat.import_value += detail.thanh_tien;
          }
        });
      });

      // Calculate sales (from delivered orders)
      salesOrders?.forEach((order: any) => {
        order.chi_tiet_don_hang?.forEach((detail: any) => {
          const stat = statsMap.get(detail.dien_thoai_id);
          if (stat) {
            stat.total_sold += detail.so_luong;
            stat.sales_value += detail.thanh_tien;
          }
        });
      });

      const statsArray = Array.from(statsMap.values());
      setStats(statsArray);

      // Calculate summary
      const summaryData = statsArray.reduce(
        (acc, stat) => ({
          totalImported: acc.totalImported + stat.total_imported,
          totalSold: acc.totalSold + stat.total_sold,
          totalStock: acc.totalStock + stat.current_stock,
          importValue: acc.importValue + stat.import_value,
          salesValue: acc.salesValue + stat.sales_value,
        }),
        { totalImported: 0, totalSold: 0, totalStock: 0, importValue: 0, salesValue: 0 }
      );

      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading inventory report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Báo cáo nhập xuất tồn</h2>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <Calendar size={20} className="text-slate-600" />
          <div className="flex items-center gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Từ ngày</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Đến ngày</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <span className="text-sm text-slate-600">Tổng nhập</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.totalImported}</p>
          <p className="text-sm text-slate-500 mt-1">
            {summary.importValue.toLocaleString('vi-VN')} đ
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingDown size={20} className="text-green-600" />
            </div>
            <span className="text-sm text-slate-600">Tổng bán</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.totalSold}</p>
          <p className="text-sm text-slate-500 mt-1">
            {summary.salesValue.toLocaleString('vi-VN')} đ
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Archive size={20} className="text-purple-600" />
            </div>
            <span className="text-sm text-slate-600">Tồn kho</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.totalStock}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package size={20} className="text-orange-600" />
            </div>
            <span className="text-sm text-slate-600">Lợi nhuận</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {(summary.salesValue - summary.importValue).toLocaleString('vi-VN')} đ
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp size={20} className="text-yellow-600" />
            </div>
            <span className="text-sm text-slate-600">Tỷ suất LN</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {summary.importValue > 0
              ? (((summary.salesValue - summary.importValue) / summary.importValue) * 100).toFixed(1)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Chi tiết theo sản phẩm</h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">STT</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hãng</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    Tồn đầu
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    Nhập
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    Bán
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    Tồn cuối
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                    GT Nhập
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                    GT Bán
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                    Lợi nhuận
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stats.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  stats.map((stat, index) => {
                    const tonDau = stat.current_stock - stat.total_imported + stat.total_sold;
                    const profit = stat.sales_value - stat.import_value;
                    return (
                      <tr key={stat.product_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{stat.product_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{stat.brand_name}</td>
                        <td className="px-4 py-3 text-center text-sm text-slate-900">{tonDau}</td>
                        <td className="px-4 py-3 text-center text-sm text-blue-600 font-semibold">
                          {stat.total_imported}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-green-600 font-semibold">
                          {stat.total_sold}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-900 font-semibold">
                          {stat.current_stock}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-900">
                          {stat.import_value.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-900">
                          {stat.sales_value.toLocaleString('vi-VN')} đ
                        </td>
                        <td
                          className={`px-4 py-3 text-right text-sm font-semibold ${
                            profit >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {profit.toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
