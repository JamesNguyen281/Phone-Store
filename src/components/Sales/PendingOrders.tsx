import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function PendingOrders() {
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const loadPendingOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('don_hang')
        .select(`
          *,
          khach_hang(*),
          chi_tiet_don_hang(
            *,
            dien_thoai(*, hang_dien_thoai(*))
          )
        `)
        .neq('ma_trang_thai', 'DAGIAO')
        .neq('ma_trang_thai', 'DAHUY')
        .order('ngay_dat', { ascending: false });

      if (error) throw error;
      setPendingOrders(data || []);
    } catch (error: any) {
      console.error('Error loading pending orders:', error);
      alert('Lỗi khi tải đơn hàng: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    if (!confirm('Xác nhận đơn hàng đã giao?\n\nTồn kho sẽ được trừ tự động.')) return;

    try {
      // Lấy chi tiết đơn hàng
      const { data: details, error: detailsError } = await supabase
        .from('chi_tiet_don_hang')
        .select('dien_thoai_id, so_luong')
        .eq('don_hang_id', orderId);

      if (detailsError) throw detailsError;

      // Cập nhật tồn kho cho từng sản phẩm
      for (const detail of details || []) {
        // Lấy số lượng tồn hiện tại
        const { data: product, error: productError } = await supabase
          .from('dien_thoai')
          .select('so_luong_ton')
          .eq('id', detail.dien_thoai_id)
          .single();

        if (productError) {
          console.error('Error loading product:', productError);
          continue;
        }

        // Kiểm tra tồn kho đủ không
        if (product.so_luong_ton < detail.so_luong) {
          alert(`Sản phẩm không đủ tồn kho để xuất!\nTồn: ${product.so_luong_ton}, Cần: ${detail.so_luong}`);
          return;
        }

        // Trừ tồn kho
        const newStock = product.so_luong_ton - detail.so_luong;
        const { error: updateError } = await supabase
          .from('dien_thoai')
          .update({ so_luong_ton: newStock })
          .eq('id', detail.dien_thoai_id);

        if (updateError) {
          console.error('Error updating stock:', updateError);
          throw updateError;
        }
      }

      // Cập nhật trạng thái đơn hàng
      const { error } = await supabase
        .from('don_hang')
        .update({ ma_trang_thai: 'DAGIAO' })
        .eq('id', orderId);

      if (error) throw error;

      alert('Đã giao hàng thành công!\nTồn kho đã được cập nhật.');
      loadPendingOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      alert('Lỗi khi cập nhật: ' + error.message);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Hủy đơn hàng này?')) return;

    try {
      const { error } = await supabase
        .from('don_hang')
        .update({ ma_trang_thai: 'DAHUY' })
        .eq('id', orderId);

      if (error) throw error;

      alert('Đã hủy đơn hàng!');
      loadPendingOrders();
    } catch (error: any) {
      console.error('Error canceling order:', error);
      alert('Lỗi khi hủy: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      DANGXULY: { label: 'Đang xử lý', color: 'bg-yellow-100 text-yellow-800' },
      DANGGIAO: { label: 'Đang giao', color: 'bg-blue-100 text-blue-800' },
      DAGIAO: { label: 'Đã giao', color: 'bg-green-100 text-green-800' },
      DAHUY: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
    };
    const info = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${info.color}`}>
        {info.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Package size={24} />
          Hàng tồn - Đơn hàng chưa giao ({pendingOrders.length})
        </h3>
        <button
          onClick={loadPendingOrders}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Làm mới
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Clock className="text-blue-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <p className="font-semibold text-blue-900 mb-1">Quy trình xử lý đơn hàng</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Đơn hàng "Đang xử lý" hoặc "Đang giao" sẽ hiển thị ở đây</li>
              <li>• Khi xác nhận "Đã giao" → Đơn hàng tự động biến mất khỏi danh sách</li>
              <li>• Tồn kho sẽ được trừ tự động khi đơn chuyển sang "Đã giao"</li>
            </ul>
          </div>
        </div>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <Package size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600 text-lg">Không có đơn hàng chờ xử lý</p>
          <p className="text-slate-500 text-sm mt-2">Tất cả đơn hàng đã được giao hoặc hủy</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold text-lg text-slate-900">
                      Đơn hàng #{order.id.slice(0, 8)}
                    </h4>
                    {getStatusBadge(order.ma_trang_thai)}
                  </div>
                  <p className="text-sm text-slate-600">
                    Khách hàng: <span className="font-medium">{order.khach_hang?.ho_ten || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    SĐT: {order.so_dien_thoai_nhan || order.khach_hang?.so_dien_thoai || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-600">
                    Địa chỉ: {order.dia_chi_giao_hang || 'N/A'}
                  </p>
                  <p className="text-sm text-slate-600">
                    Ngày đặt: {new Date(order.ngay_dat).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">
                    {order.tong_tien.toLocaleString('vi-VN')} đ
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mb-4">
                <h5 className="font-semibold text-slate-900 mb-3">Chi tiết sản phẩm:</h5>
                <div className="space-y-2">
                  {order.chi_tiet_don_hang?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {item.dien_thoai?.ten_sp || 'N/A'}
                        </p>
                        <p className="text-sm text-slate-600">
                          {item.dien_thoai?.hang_dien_thoai?.ten_hang || ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">
                          SL: {item.so_luong} x {item.gia_ban.toLocaleString('vi-VN')} đ
                        </p>
                        <p className="font-semibold text-slate-900">
                          {item.thanh_tien.toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.ghi_chu && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    <span className="font-semibold">Ghi chú:</span> {order.ghi_chu}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleMarkAsDelivered(order.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Xác nhận đã giao
                </button>
                <button
                  onClick={() => handleCancelOrder(order.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  Hủy đơn
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
