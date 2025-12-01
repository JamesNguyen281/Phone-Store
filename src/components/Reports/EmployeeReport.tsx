import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, DollarSign, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';

interface EmployeeStats {
  employee_id: string;
  employee_name: string;
  total_orders: number;
  total_revenue: number;
  total_items_sold: number;
  avg_order_value: number;
}

export default function EmployeeReport() {
  const [stats, setStats] = useState<EmployeeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalEmployees: 0,
  });

  useEffect(() => {
    // Set default date range (current month)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateFrom(firstDay.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) {
      loadEmployeeReport();
    }
  }, [dateFrom, dateTo]);

  const loadEmployeeReport = async () => {
    setLoading(true);
    try {
      // Get all invoices with employee info in date range
      const { data: invoices } = await supabase
        .from('hoa_don')
        .select(`
          *,
          nhan_vien(id, ho_ten),
          don_hang(
            chi_tiet_don_hang(so_luong)
          )
        `)
        .eq('phan_loai', 'BAN')
        .eq('trang_thai_thanh_toan', true)
        .gte('ngay_tao', dateFrom)
        .lte('ngay_tao', dateTo + 'T23:59:59');

      if (!invoices) return;

      // Process data by employee
      const statsMap = new Map<string, EmployeeStats>();

      invoices.forEach((invoice: any) => {
        if (!invoice.nhan_vien) return;

        const employeeId = invoice.nhan_vien.id;
        const employeeName = invoice.nhan_vien.ho_ten;

        if (!statsMap.has(employeeId)) {
          statsMap.set(employeeId, {
            employee_id: employeeId,
            employee_name: employeeName,
            total_orders: 0,
            total_revenue: 0,
            total_items_sold: 0,
            avg_order_value: 0,
          });
        }

        const stat = statsMap.get(employeeId)!;
        stat.total_orders += 1;
        stat.total_revenue += invoice.tong_tien;

        // Count items sold
        invoice.don_hang?.chi_tiet_don_hang?.forEach((detail: any) => {
          stat.total_items_sold += detail.so_luong;
        });
      });

      // Calculate average order value
      statsMap.forEach((stat) => {
        stat.avg_order_value = stat.total_orders > 0 ? stat.total_revenue / stat.total_orders : 0;
      });

      const statsArray = Array.from(statsMap.values()).sort(
        (a, b) => b.total_revenue - a.total_revenue
      );
      setStats(statsArray);

      // Calculate summary
      const summaryData = {
        totalOrders: statsArray.reduce((sum, stat) => sum + stat.total_orders, 0),
        totalRevenue: statsArray.reduce((sum, stat) => sum + stat.total_revenue, 0),
        totalEmployees: statsArray.length,
      };
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading employee report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Thống kê theo nhân viên</h2>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <span className="text-sm text-slate-600">Tổng nhân viên</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.totalEmployees}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingCart size={20} className="text-green-600" />
            </div>
            <span className="text-sm text-slate-600">Tổng đơn hàng</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary.totalOrders}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign size={20} className="text-purple-600" />
            </div>
            <span className="text-sm text-slate-600">Tổng doanh thu</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {summary.totalRevenue.toLocaleString('vi-VN')} đ
          </p>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Chi tiết theo nhân viên</h3>

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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Xếp hạng
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Nhân viên
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    Số đơn hàng
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    Sản phẩm bán
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                    Doanh thu
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                    Giá trị TB/đơn
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                    % Doanh thu
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {stats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  stats.map((stat, index) => {
                    const revenuePercent =
                      summary.totalRevenue > 0
                        ? (stat.total_revenue / summary.totalRevenue) * 100
                        : 0;
                    return (
                      <tr key={stat.employee_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-center">
                          {index === 0 && (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-700 rounded-full font-bold">
                              🏆
                            </span>
                          )}
                          {index === 1 && (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-100 text-slate-700 rounded-full font-bold">
                              🥈
                            </span>
                          )}
                          {index === 2 && (
                            <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-700 rounded-full font-bold">
                              🥉
                            </span>
                          )}
                          {index > 2 && (
                            <span className="text-sm text-slate-600">{index + 1}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {stat.employee_name}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-900">
                          {stat.total_orders}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-slate-900">
                          {stat.total_items_sold}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                          {stat.total_revenue.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-slate-900">
                          {stat.avg_order_value.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex-1 max-w-[100px] bg-slate-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${revenuePercent}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-900">
                              {revenuePercent.toFixed(1)}%
                            </span>
                          </div>
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

      {/* Performance Insights */}
      {stats.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Phân tích hiệu suất
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Nhân viên xuất sắc nhất</p>
              <p className="text-lg font-bold text-blue-600">{stats[0]?.employee_name}</p>
              <p className="text-sm text-slate-500">
                {stats[0]?.total_revenue.toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Trung bình đơn/nhân viên</p>
              <p className="text-lg font-bold text-slate-900">
                {summary.totalEmployees > 0
                  ? Math.round(summary.totalOrders / summary.totalEmployees)
                  : 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Trung bình doanh thu/nhân viên</p>
              <p className="text-lg font-bold text-slate-900">
                {summary.totalEmployees > 0
                  ? (summary.totalRevenue / summary.totalEmployees).toLocaleString('vi-VN')
                  : 0}{' '}
                đ
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
