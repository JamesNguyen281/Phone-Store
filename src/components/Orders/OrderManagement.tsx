import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DonHang, ChiTietDonHang } from '../../types';
import { Eye, FileText, Trash2 } from 'lucide-react';
import InvoiceTemplate from '../Invoice/InvoiceTemplate';

export default function OrderManagement() {
  const [orders, setOrders] = useState<DonHang[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DonHang | null>(null);
  const [orderDetails, setOrderDetails] = useState<ChiTietDonHang[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrderId, setInvoiceOrderId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async () => {
    try {
      let query = supabase
        .from('don_hang')
        .select('*, khach_hang(*)')
        .not('khach_hang_id', 'is', null)
        .order('ngay_dat', { ascending: false });

      if (statusFilter) {
        query = query.eq('ma_trang_thai', statusFilter);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error loading orders:', error);
        alert('Lỗi khi tải đơn hàng: ' + error.message);
        return;
      }
      
      console.log('Orders loaded:', data?.length || 0, 'orders');
      if (data) setOrders(data as any);
    } catch (error) {
      console.error('Exception loading orders:', error);
    }
  };

  const loadOrderDetails = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from('chi_tiet_don_hang')
        .select('*, dien_thoai(*, hang_dien_thoai(*))')
        .eq('don_hang_id', orderId);

      if (error) {
        console.error('Error loading order details:', error);
        alert('Không thể tải chi tiết đơn hàng: ' + error.message);
        return;
      }

      console.log('Order details loaded:', data);
      if (data) setOrderDetails(data as any);
    } catch (error) {
      console.error('Exception loading order details:', error);
      alert('Có lỗi xảy ra khi tải chi tiết đơn hàng');
    }
  };

  const handleViewDetails = async (order: DonHang) => {
    setSelectedOrder(order);
    await loadOrderDetails(order.id);
    setShowModal(true);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      // Nếu chuyển sang "Đã giao", tự động xuất hàng (trừ tồn kho)
      if (newStatus === 'DAGIAO') {
        // Lấy chi tiết đơn hàng
        const { data: details, error: detailsError } = await supabase
          .from('chi_tiet_don_hang')
          .select('dien_thoai_id, so_luong')
          .eq('don_hang_id', orderId);

        if (detailsError) {
          console.error('Error loading order details:', detailsError);
          alert('Không thể tải chi tiết đơn hàng');
          return;
        }

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
            alert(`Sản phẩm không đủ tồn kho để xuất! Tồn: ${product.so_luong_ton}, Cần: ${detail.so_luong}`);
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
            alert('Có lỗi khi cập nhật tồn kho');
            return;
          }
        }
      }

      // Cập nhật trạng thái đơn hàng
      const { error } = await supabase
        .from('don_hang')
        .update({ ma_trang_thai: newStatus })
        .eq('id', orderId);

      if (error) {
        alert('Có lỗi khi cập nhật trạng thái');
        return;
      }

      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, ma_trang_thai: newStatus as any });
      }

      const statusText =
        newStatus === 'DANGXULY' ? 'Đang xử lý' :
        newStatus === 'DANGGIAO' ? 'Đang giao' :
        newStatus === 'DAGIAO' ? 'Đã giao (Đã xuất hàng)' : 'Đã hủy';
      alert(`Đã cập nhật trạng thái thành: ${statusText}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Có lỗi xảy ra khi cập nhật đơn hàng');
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?\n\nLưu ý: Nếu đơn đã giao, tồn kho sẽ được hoàn lại.')) {
      return;
    }

    try {
      // Lấy thông tin đơn hàng
      const { data: order } = await supabase
        .from('don_hang')
        .select('ma_trang_thai')
        .eq('id', orderId)
        .single();

      // Nếu đơn đã giao, hoàn lại tồn kho
      if (order?.ma_trang_thai === 'DAGIAO') {
        const { data: details } = await supabase
          .from('chi_tiet_don_hang')
          .select('dien_thoai_id, so_luong')
          .eq('don_hang_id', orderId);

        for (const detail of details || []) {
          const { data: product } = await supabase
            .from('dien_thoai')
            .select('so_luong_ton')
            .eq('id', detail.dien_thoai_id)
            .single();

          if (product) {
            await supabase
              .from('dien_thoai')
              .update({ so_luong_ton: product.so_luong_ton + detail.so_luong })
              .eq('id', detail.dien_thoai_id);
          }
        }
      }

      // Xóa hóa đơn
      await supabase.from('hoa_don').delete().eq('don_hang_id', orderId);

      // Xóa chi tiết đơn hàng
      await supabase.from('chi_tiet_don_hang').delete().eq('don_hang_id', orderId);

      // Xóa đơn hàng
      const { error } = await supabase.from('don_hang').delete().eq('id', orderId);

      if (error) throw error;

      alert('Đã xóa đơn hàng thành công!');
      setShowModal(false);
      loadOrders();
    } catch (error: any) {
      console.error('Error deleting order:', error);
      alert('Có lỗi xảy ra khi xóa đơn hàng: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DANGXULY':
        return 'bg-yellow-100 text-yellow-800';
      case 'DANGGIAO':
        return 'bg-blue-100 text-blue-800';
      case 'DAGIAO':
        return 'bg-green-100 text-green-800';
      case 'DAHUY':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DANGXULY':
        return 'Đang xử lý';
      case 'DANGGIAO':
        return 'Đang giao';
      case 'DAGIAO':
        return 'Đã giao';
      case 'DAHUY':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const handleViewInvoice = (orderId: string) => {
    setInvoiceOrderId(orderId);
    setShowInvoice(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Quản lý đơn hàng</h2>
          <p className="text-sm text-slate-600 mt-1">
            Tổng số: <span className="font-semibold text-blue-600">{orders.length}</span> đơn hàng
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Làm mới
          </button>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DANGXULY">Đang xử lý</option>
            <option value="DANGGIAO">Đang giao</option>
            <option value="DAGIAO">Đã giao</option>
            <option value="DAHUY">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Mã đơn</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Khách hàng</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Ngày đặt</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Tổng tiền</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Trạng thái</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-900 font-mono">
                  {order.id.slice(0, 8)}...
                </td>
                <td className="px-4 py-3 text-sm text-slate-900">{order.khach_hang?.ho_ten}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {new Date(order.ngay_dat).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                  {order.tong_tien.toLocaleString('vi-VN')} đ
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.ma_trang_thai)}`}>
                    {getStatusText(order.ma_trang_thai)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleViewInvoice(order.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Xuất hóa đơn"
                    >
                      <FileText size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Chi tiết đơn hàng</h3>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Khách hàng</p>
                  <p className="font-semibold">{selectedOrder.khach_hang?.ho_ten}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Ngày đặt</p>
                  <p className="font-semibold">
                    {new Date(selectedOrder.ngay_dat).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Địa chỉ giao hàng</p>
                  <p className="font-semibold">{selectedOrder.dia_chi_giao_hang}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Số điện thoại</p>
                  <p className="font-semibold">{selectedOrder.so_dien_thoai_nhan}</p>
                </div>
              </div>

              {selectedOrder.ghi_chu && (
                <div>
                  <p className="text-sm text-slate-600">Ghi chú</p>
                  <p className="font-semibold">{selectedOrder.ghi_chu}</p>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h4 className="font-semibold mb-3">Sản phẩm</h4>
              {orderDetails.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>Không có sản phẩm trong đơn hàng này</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orderDetails.map((detail) => (
                    <div
                      key={detail.id}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{detail.dien_thoai?.ten_sp || 'Sản phẩm không xác định'}</p>
                        <p className="text-sm text-slate-600">
                          Số lượng: {detail.so_luong || 0} x {(detail.gia_tien || (detail.so_luong > 0 ? detail.thanh_tien / detail.so_luong : 0)).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                      <p className="font-semibold">{(detail.thanh_tien || 0).toLocaleString('vi-VN')} đ</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Tổng cộng:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {(selectedOrder.tong_tien || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Cập nhật trạng thái đơn hàng
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'DANGXULY')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    selectedOrder.ma_trang_thai === 'DANGXULY'
                      ? 'bg-yellow-500 text-white shadow-md'
                      : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                  }`}
                >
                  Đang xử lý
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'DANGGIAO')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    selectedOrder.ma_trang_thai === 'DANGGIAO'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  Đang giao
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'DAGIAO')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    selectedOrder.ma_trang_thai === 'DAGIAO'
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                  }`}
                >
                  Đã giao
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'DAHUY')}
                  className={`px-4 py-3 rounded-lg font-medium transition-all ${
                    selectedOrder.ma_trang_thai === 'DAHUY'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                  }`}
                >
                  Đã hủy
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleViewInvoice(selectedOrder.id)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                Xuất hóa đơn
              </button>
              <button
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                title="Xóa đơn hàng"
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoice && invoiceOrderId && (
        <InvoiceTemplate
          orderId={invoiceOrderId}
          onClose={() => {
            setShowInvoice(false);
            setInvoiceOrderId(null);
          }}
        />
      )}
    </div>
  );
}
