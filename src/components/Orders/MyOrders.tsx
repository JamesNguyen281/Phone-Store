import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DonHang, ChiTietDonHang } from '../../types';
import { Package, Eye, FileText } from 'lucide-react';
import InvoiceTemplate from '../Invoice/InvoiceTemplate';

export default function MyOrders() {
  const [orders, setOrders] = useState<DonHang[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<DonHang | null>(null);
  const [orderDetails, setOrderDetails] = useState<ChiTietDonHang[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrderId, setInvoiceOrderId] = useState<string | null>(null);
  const { khachHang } = useAuth();

  useEffect(() => {
    if (khachHang) {
      loadOrders();
    }
  }, [khachHang]);

  const loadOrders = async () => {
    if (!khachHang) return;

    try {
      const { data, error } = await supabase
        .from('don_hang')
        .select('*')
        .eq('khach_hang_id', khachHang.id)
        .order('ngay_dat', { ascending: false });

      if (error) {
        console.error('Error loading orders:', error);
        return;
      }

      console.log('Orders loaded:', data);
      if (data) setOrders(data);
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
      <h2 className="text-2xl font-bold text-slate-900">Đơn hàng của tôi</h2>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg">Bạn chưa có đơn hàng nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">
                    Đơn hàng #{order.id.slice(0, 8)}...
                  </p>
                  <p className="text-sm text-slate-600">
                    Ngày đặt: {new Date(order.ngay_dat).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    order.ma_trang_thai
                  )}`}
                >
                  {getStatusText(order.ma_trang_thai)}
                </span>
              </div>

              <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Địa chỉ giao hàng:</p>
                <p className="font-medium">{order.dia_chi_giao_hang}</p>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-600">Tổng tiền</p>
                  <p className="text-xl font-bold text-blue-600">
                    {(order.tong_tien || 0).toLocaleString('vi-VN')} đ
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(order)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                  >
                    <Eye size={18} />
                    Chi tiết
                  </button>
                  <button
                    onClick={() => handleViewInvoice(order.id)}
                    className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-2"
                  >
                    <FileText size={18} />
                    Hóa đơn
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Chi tiết đơn hàng</h3>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Ngày đặt</p>
                  <p className="font-semibold">
                    {new Date(selectedOrder.ngay_dat).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Trạng thái</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      selectedOrder.ma_trang_thai
                    )}`}
                  >
                    {getStatusText(selectedOrder.ma_trang_thai)}
                  </span>
                </div>
                <div className="col-span-2">
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

            <div className="border-t border-slate-200 pt-4 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Tổng cộng:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {(selectedOrder.tong_tien || 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleViewInvoice(selectedOrder.id)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <FileText size={20} />
                Xem hóa đơn
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
