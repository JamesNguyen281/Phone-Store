import { useEffect, useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { Printer, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceTemplateProps {
  orderId: string;
  onClose: () => void;
}

interface OrderDetail {
  id: string;
  don_hang_id: string;
  dien_thoai_id: string;
  so_luong: number;
  gia_tien: number;
  thanh_tien: number;
  dien_thoai?: {
    ten_sp: string;
    hang_dien_thoai?: {
      ten_hang: string;
    };
  };
}

interface Order {
  id: string;
  khach_hang_id: string;
  tong_tien: number;
  dia_chi_giao_hang: string;
  so_dien_thoai_nhan: string;
  email_nhan: string | null;
  ghi_chu: string | null;
  ngay_dat: string;
  ma_trang_thai: string;
  khach_hang?: {
    ho_ten: string;
    email: string | null;
    so_dien_thoai: string | null;
  };
}

export default function InvoiceTemplate({ orderId, onClose }: InvoiceTemplateProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadOrderData();
  }, [orderId]);

  const loadOrderData = async () => {
    setLoading(true);

    const { data: orderData } = await supabase
      .from('don_hang')
      .select('*, khach_hang(*)')
      .eq('id', orderId)
      .maybeSingle();

    const { data: detailsData } = await supabase
      .from('chi_tiet_don_hang')
      .select('*, dien_thoai(*, hang_dien_thoai(*))')
      .eq('don_hang_id', orderId);

    if (orderData) setOrder(orderData as any);
    if (detailsData) setOrderDetails(detailsData as any);
    setLoading(false);
  };

  const exportToPDF = async () => {
    if (!invoiceRef.current) return;

    try {
      const element = invoiceRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`HoaDon-HD${order?.id.slice(0, 8).toUpperCase() || orderId.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Có lỗi khi xuất PDF. Vui lòng thử lại.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Đang tải hóa đơn...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <p className="text-red-600">Không tìm thấy đơn hàng</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-slate-600 text-white rounded-lg">
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <div className="flex justify-between items-center p-6 border-b border-slate-200 print:hidden">
          <h2 className="text-2xl font-bold text-slate-900">Hóa đơn bán hàng</h2>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
              title="In hóa đơn"
            >
              <Printer size={20} />
              In
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
              title="Xuất PDF"
            >
              <Download size={20} />
              Xuất PDF
            </button>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium shadow-sm"
              title="Đóng"
            >
              <X size={20} />
              Đóng
            </button>
          </div>
        </div>

        <div ref={invoiceRef} className="p-8 bg-white">
          <article itemScope itemType="https://schema.org/Invoice">
            <header className="text-center border-b-2 border-slate-900 pb-6 mb-6">
              <h1 className="text-3xl font-bold text-slate-900 mb-2" itemProp="name">
                HÓA ĐƠN BÁN HÀNG
              </h1>
              <div itemProp="provider" itemScope itemType="https://schema.org/Organization">
                <p className="text-xl font-semibold text-blue-600" itemProp="name">
                  PHONESTORE
                </p>
                <address
                  className="text-sm text-slate-600 not-italic mt-2"
                  itemProp="address"
                  itemScope
                  itemType="https://schema.org/PostalAddress"
                >
                  <p itemProp="streetAddress">123 Đường ABC, Quận 1</p>
                  <p>
                    <span itemProp="addressLocality">TP. Hồ Chí Minh</span>,{' '}
                    <span itemProp="addressCountry">Việt Nam</span>
                  </p>
                  <p itemProp="telephone">Hotline: 1900-xxxx</p>
                  <p itemProp="email">Email: support@phonestore.vn</p>
                </address>
              </div>
            </header>

            <section className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">
                  Thông tin khách hàng
                </h2>
                <div
                  itemProp="customer"
                  itemScope
                  itemType="https://schema.org/Person"
                  className="space-y-1"
                >
                  <p className="font-semibold text-slate-900">
                    <span itemProp="name">{order.khach_hang?.ho_ten}</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Email:</strong> <span itemProp="email">{order.email_nhan || order.khach_hang?.email || 'Không có'}</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Số điện thoại:</strong> <span itemProp="telephone" className="font-medium text-slate-900">{order.so_dien_thoai_nhan}</span>
                  </p>
                  <address className="text-sm text-slate-600 not-italic mt-2">
                    <strong>Địa chỉ giao hàng:</strong><br />
                    {order.dia_chi_giao_hang}
                  </address>
                </div>
              </div>

              <div className="text-right">
                <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">
                  Thông tin hóa đơn
                </h2>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">
                    Số hóa đơn: <span itemProp="identifier">HD-{order.id.slice(0, 8).toUpperCase()}</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    Ngày lập:{' '}
                    <time itemProp="paymentDueDate" dateTime={order.ngay_dat}>
                      {new Date(order.ngay_dat).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </p>
                  <p className="text-sm text-slate-600">
                    Trạng thái:{' '}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
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
                        : order.ma_trang_thai === 'DANGGIAO'
                        ? 'Đang giao'
                        : 'Đang xử lý'}
                    </span>
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Chi tiết đơn hàng</h2>
              <table className="w-full border-collapse" itemProp="referencesOrder" itemScope itemType="https://schema.org/Order">
                <thead>
                  <tr className="bg-slate-100 border-y-2 border-slate-300">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">STT</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Sản phẩm
                    </th>
                    <th className="text-center py-3 px-4 font-semibold text-slate-900">
                      Số lượng
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">
                      Đơn giá
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-900">
                      Thành tiền
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {orderDetails.map((detail, index) => (
                    <tr key={detail.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-700">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div itemProp="orderedItem" itemScope itemType="https://schema.org/Product">
                          <p className="font-medium text-slate-900" itemProp="name">
                            {detail.dien_thoai?.ten_sp}
                          </p>
                          {detail.dien_thoai?.hang_dien_thoai?.ten_hang && (
                            <p className="text-sm text-slate-600">
                              {detail.dien_thoai.hang_dien_thoai.ten_hang}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-slate-700">
                        {detail.so_luong || 0}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">
                        <span itemProp="price">
                          {(detail.gia_tien || (detail.so_luong > 0 ? detail.thanh_tien / detail.so_luong : 0)).toLocaleString('vi-VN')}
                        </span>
                        <meta itemProp="priceCurrency" content="VND" /> đ
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        {(detail.thanh_tien || 0).toLocaleString('vi-VN')} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-300">
                    <td colSpan={4} className="py-4 px-4 text-right font-bold text-lg text-slate-900">
                      Tổng cộng:
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-2xl text-blue-600">
                      <span itemProp="totalPaymentDue" itemScope itemType="https://schema.org/PriceSpecification">
                        <span itemProp="price">{(order.tong_tien || 0).toLocaleString('vi-VN')}</span>
                        <meta itemProp="priceCurrency" content="VND" /> đ
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </section>

            {order.ghi_chu && (
              <section className="mb-6 p-4 bg-slate-50 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-700 mb-1">Ghi chú:</h3>
                <p className="text-slate-600" itemProp="description">{order.ghi_chu}</p>
              </section>
            )}

            <footer className="mt-8 pt-6 border-t border-slate-300">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 mb-12">
                    Người giao hàng
                  </p>
                  <p className="text-sm text-slate-500">(Ký và ghi rõ họ tên)</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 mb-12">
                    Khách hàng
                  </p>
                  <p className="text-sm text-slate-500">(Ký và ghi rõ họ tên)</p>
                </div>
              </div>

              <div className="text-center mt-8 pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  Cảm ơn quý khách đã mua hàng tại PhoneStore!
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Mọi thắc mắc xin liên hệ: 1900-xxxx | support@phonestore.vn
                </p>
              </div>
            </footer>
          </article>
        </div>

        <div className="flex justify-center gap-3 p-6 border-t border-slate-200 bg-slate-50 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Printer size={20} />
            In hóa đơn
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
          >
            <Download size={20} />
            Tải xuống PDF
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium shadow-sm"
          >
            <X size={20} />
            Đóng
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          ${invoiceRef.current ? `
          #invoice-${orderId}, #invoice-${orderId} * {
            visibility: visible;
          }
          #invoice-${orderId} {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          ` : ''}
        }
      `}</style>
    </div>
  );
}
