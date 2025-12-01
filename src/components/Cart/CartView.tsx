import { useState, useMemo } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Trash2, ShoppingBag, Minus, Plus, CreditCard, MapPin, Phone, FileText, ShieldCheck, Truck, Store } from 'lucide-react';
import { vietnamLocations, storeLocations } from '../../data/vietnamLocations';

export default function CartView() {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { khachHang } = useAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedStore, setSelectedStore] = useState('');
  const [orderForm, setOrderForm] = useState({
    dia_chi_cu_the: '',
    tinh_thanh: '',
    quan_huyen: '',
    phuong_xa: '',
    so_dien_thoai_nhan: khachHang?.so_dien_thoai || '',
    email_nhan: khachHang?.email || '',
    ghi_chu: '',
    phuong_thuc_thanh_toan: 'COD',
  });

  const availableDistricts = useMemo(() => {
    if (!orderForm.tinh_thanh) return [];
    const province = vietnamLocations.find((p) => p.name === orderForm.tinh_thanh);
    return province?.districts || [];
  }, [orderForm.tinh_thanh]);

  const availableWards = useMemo(() => {
    if (!orderForm.quan_huyen) return [];
    const district = availableDistricts.find((d) => d.name === orderForm.quan_huyen);
    return district?.wards || [];
  }, [orderForm.quan_huyen, availableDistricts]);

  const handleProvinceChange = (value: string) => {
    setOrderForm({
      ...orderForm,
      tinh_thanh: value,
      quan_huyen: '',
      phuong_xa: '',
    });
  };

  const handleDistrictChange = (value: string) => {
    setOrderForm({
      ...orderForm,
      quan_huyen: value,
      phuong_xa: '',
    });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!khachHang) return;

    setLoading(true);
    try {
      const tongTien = getTotalPrice();

      let diaChiDayDu = '';
      if (deliveryType === 'pickup') {
        const store = storeLocations.find((s) => s.name === selectedStore);
        diaChiDayDu = `Nhận tại: ${store?.address || selectedStore}`;
      } else {
        diaChiDayDu = `${orderForm.dia_chi_cu_the}, ${orderForm.phuong_xa}, ${orderForm.quan_huyen}, ${orderForm.tinh_thanh}`;
      }

      const { data: donHang, error: donHangError } = await supabase
        .from('don_hang')
        .insert({
          khach_hang_id: khachHang.id,
          ma_trang_thai: 'DANGXULY',
          tong_tien: tongTien,
          dia_chi_giao_hang: diaChiDayDu,
          so_dien_thoai_nhan: orderForm.so_dien_thoai_nhan,
          email_nhan: orderForm.email_nhan,
          ghi_chu: orderForm.ghi_chu,
        })
        .select()
        .single();

      if (donHangError) throw donHangError;

      const chiTietItems = cart.map((item) => ({
        don_hang_id: donHang.id,
        dien_thoai_id: item.dien_thoai.id,
        so_luong: item.so_luong,
        gia_ban: item.dien_thoai.gia_tien,
        thanh_tien: item.dien_thoai.gia_tien * item.so_luong,
      }));

      await supabase.from('chi_tiet_don_hang').insert(chiTietItems);

      await supabase.from('hoa_don').insert({
        don_hang_id: donHang.id,
        phuong_thuc_thanh_toan: orderForm.phuong_thuc_thanh_toan,
        trang_thai_thanh_toan: false,
        tong_tien: tongTien,
        phan_loai: 'BAN',
        khach_hang_id: khachHang.id,
      });

      // Không trừ tồn kho ở đây - sẽ tự động trừ khi nhân viên duyệt đơn thành "Đã giao"
      // Điều này đảm bảo tồn kho chỉ giảm khi đơn hàng thực sự được giao

      clearCart();
      alert('Đặt hàng thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.');
      setShowCheckout(false);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingBag size={80} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Giỏ hàng trống</h2>
        <p className="text-slate-600">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
      </div>
    );
  }

  if (showCheckout) {
    return (
      <article itemScope itemType="https://schema.org/CheckoutPage" className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2" itemProp="name">
            Thanh toán
          </h1>
          <nav className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setShowCheckout(false)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Giỏ hàng
            </button>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600">Thanh toán</span>
          </nav>
        </header>

        <form onSubmit={handleCheckout} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section
              itemScope
              itemType="https://schema.org/PostalAddress"
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="text-blue-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Thông tin giao hàng</h2>
                  <p className="text-sm text-slate-600">Điền thông tin để nhận hàng</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`flex items-center justify-center gap-3 p-4 border-2 rounded-lg transition-all ${
                      deliveryType === 'delivery'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Truck size={24} />
                    <span className="font-semibold">Giao hàng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`flex items-center justify-center gap-3 p-4 border-2 rounded-lg transition-all ${
                      deliveryType === 'pickup'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Store size={24} />
                    <span className="font-semibold">Nhận tại cửa hàng</span>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Họ và tên người nhận
                  </label>
                  <input
                    type="text"
                    defaultValue={khachHang?.ho_ten}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    itemProp="name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={orderForm.email_nhan}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, email_nhan: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@example.com"
                      required
                      itemProp="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        type="tel"
                        value={orderForm.so_dien_thoai_nhan}
                        onChange={(e) =>
                          setOrderForm({ ...orderForm, so_dien_thoai_nhan: e.target.value })
                        }
                        className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0912345678"
                        required
                        itemProp="telephone"
                      />
                    </div>
                  </div>
                </div>

                {deliveryType === 'pickup' ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Chọn cửa hàng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedStore}
                      onChange={(e) => setSelectedStore(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Chọn cửa hàng</option>
                      {storeLocations.map((store) => (
                        <option key={store.name} value={store.name}>
                          {store.name} - {store.address}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      Đến cửa hàng trong giờ hành chính để nhận hàng
                    </p>
                  </div>
                ) : (
                  <>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Tỉnh/Thành phố <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={orderForm.tinh_thanh}
                          onChange={(e) => handleProvinceChange(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          itemProp="addressRegion"
                        >
                          <option value="">Chọn Tỉnh/Thành phố</option>
                          {vietnamLocations.map((province) => (
                            <option key={province.name} value={province.name}>
                              {province.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Quận/Huyện <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={orderForm.quan_huyen}
                          onChange={(e) => handleDistrictChange(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          disabled={!orderForm.tinh_thanh}
                          itemProp="addressLocality"
                        >
                          <option value="">Chọn Quận/Huyện</option>
                          {availableDistricts.map((district) => (
                            <option key={district.name} value={district.name}>
                              {district.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Phường/Xã <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={orderForm.phuong_xa}
                        onChange={(e) =>
                          setOrderForm({ ...orderForm, phuong_xa: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        disabled={!orderForm.quan_huyen}
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {availableWards.map((ward) => (
                          <option key={ward} value={ward}>
                            {ward}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Địa chỉ cụ thể <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={orderForm.dia_chi_cu_the}
                        onChange={(e) =>
                          setOrderForm({ ...orderForm, dia_chi_cu_the: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="VD: Số 123, đường Nguyễn Văn A"
                        required
                        itemProp="streetAddress"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Số nhà, tên đường, tên toà nhà (nếu có)
                      </p>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ghi chú đơn hàng (không bắt buộc)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 text-slate-400" size={20} />
                    <textarea
                      value={orderForm.ghi_chu}
                      onChange={(e) => setOrderForm({ ...orderForm, ghi_chu: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Ghi chú thêm cho người giao hàng..."
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="text-green-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Phương thức thanh toán</h2>
                  <p className="text-sm text-slate-600">Chọn cách thanh toán phù hợp</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={orderForm.phuong_thuc_thanh_toan === 'COD'}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, phuong_thuc_thanh_toan: e.target.value })
                    }
                    className="w-5 h-5 text-blue-600"
                  />
                  <Truck size={24} className="text-slate-700" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Thanh toán khi nhận hàng (COD)</p>
                    <p className="text-sm text-slate-600">Thanh toán bằng tiền mặt khi nhận hàng</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="TRANSFER"
                    checked={orderForm.phuong_thuc_thanh_toan === 'TRANSFER'}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, phuong_thuc_thanh_toan: e.target.value })
                    }
                    className="w-5 h-5 text-blue-600"
                  />
                  <CreditCard size={24} className="text-slate-700" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Chuyển khoản ngân hàng</p>
                    <p className="text-sm text-slate-600">Chuyển khoản trước khi giao hàng</p>
                  </div>
                </label>

                <label className="flex items-center gap-4 p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={orderForm.phuong_thuc_thanh_toan === 'CARD'}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, phuong_thuc_thanh_toan: e.target.value })
                    }
                    className="w-5 h-5 text-blue-600"
                  />
                  <ShieldCheck size={24} className="text-slate-700" />
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">Thẻ tín dụng / Ghi nợ</p>
                    <p className="text-sm text-slate-600">Visa, Mastercard, JCB</p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sticky top-6">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Đơn hàng của bạn</h3>

              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.dien_thoai.id}
                    className="flex gap-3 pb-4 border-b border-slate-200 last:border-0"
                    itemScope
                    itemType="https://schema.org/Product"
                  >
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex-shrink-0 overflow-hidden">
                      {item.dien_thoai.hinh_anh ? (
                        <img
                          src={item.dien_thoai.hinh_anh}
                          alt={item.dien_thoai.ten_sp}
                          className="w-full h-full object-cover"
                          itemProp="image"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag size={24} className="text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate" itemProp="name">
                        {item.dien_thoai.ten_sp}
                      </p>
                      <p className="text-xs text-slate-600 mb-1">
                        {item.dien_thoai.mau_sac} - {item.dien_thoai.ram}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">SL: {item.so_luong}</span>
                        <span className="font-semibold text-blue-600 text-sm" itemProp="price">
                          {(item.dien_thoai.gia_tien * item.so_luong).toLocaleString('vi-VN')} đ
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-slate-200">
                <div className="flex justify-between text-slate-700">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{getTotalPrice().toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium text-green-600">Miễn phí</span>
                </div>
              </div>

              <div
                className="flex justify-between items-center mb-6"
                itemScope
                itemType="https://schema.org/PriceSpecification"
              >
                <span className="text-lg font-bold text-slate-900">Tổng cộng:</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600" itemProp="price">
                    {getTotalPrice().toLocaleString('vi-VN')} đ
                  </span>
                  <meta itemProp="priceCurrency" content="VND" />
                  <p className="text-xs text-slate-600">(Đã bao gồm VAT)</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Đang xử lý...
                  </span>
                ) : (
                  'Đặt hàng ngay'
                )}
              </button>

              <p className="text-xs text-center text-slate-500 mt-4">
                Bằng cách đặt hàng, bạn đồng ý với{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Điều khoản dịch vụ
                </a>{' '}
                của chúng tôi
              </p>
            </div>
          </aside>
        </form>
      </article>
    );
  }

  return (
    <article itemScope itemType="https://schema.org/ShoppingCart" className="max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2" itemProp="name">
          Giỏ hàng của bạn
        </h1>
        <p className="text-slate-600">
          Bạn có <span className="font-semibold text-blue-600">{cart.length} sản phẩm</span> trong giỏ hàng
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.dien_thoai.id}
              itemScope
              itemType="https://schema.org/Product"
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-6">
                <div className="w-32 h-32 bg-slate-100 rounded-xl flex-shrink-0 overflow-hidden">
                  {item.dien_thoai.hinh_anh ? (
                    <img
                      src={item.dien_thoai.hinh_anh}
                      alt={item.dien_thoai.ten_sp}
                      className="w-full h-full object-cover"
                      itemProp="image"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={40} className="text-slate-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1" itemProp="name">
                        {item.dien_thoai.ten_sp}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Màu: <span className="font-medium">{item.dien_thoai.mau_sac}</span> |{' '}
                        {item.dien_thoai.ram} | {item.dien_thoai.bo_nho}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.dien_thoai.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-600 font-medium">Số lượng:</span>
                      <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(item.dien_thoai.id, item.so_luong - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center font-bold text-slate-900">
                          {item.so_luong}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.dien_thoai.id, item.so_luong + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-slate-200 rounded transition-colors"
                          disabled={item.so_luong >= item.dien_thoai.so_luong_ton}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-slate-600 mb-1">Thành tiền:</p>
                      <p className="text-2xl font-bold text-blue-600" itemProp="price">
                        {(item.dien_thoai.gia_tien * item.so_luong).toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 sticky top-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Tóm tắt đơn hàng</h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
              <div className="flex justify-between text-slate-700">
                <span>Tạm tính ({cart.length} sản phẩm):</span>
                <span className="font-semibold">{getTotalPrice().toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Phí vận chuyển:</span>
                <span className="font-semibold text-green-600">Miễn phí</span>
              </div>
            </div>

            <div
              className="flex justify-between items-center mb-6"
              itemScope
              itemType="https://schema.org/PriceSpecification"
            >
              <span className="text-lg font-bold text-slate-900">Tổng cộng:</span>
              <div className="text-right">
                <span className="text-3xl font-bold text-blue-600" itemProp="price">
                  {getTotalPrice().toLocaleString('vi-VN')} đ
                </span>
                <meta itemProp="priceCurrency" content="VND" />
                <p className="text-xs text-slate-600">(Đã bao gồm VAT)</p>
              </div>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl mb-4"
            >
              Tiến hành thanh toán
            </button>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <ShieldCheck size={20} className="text-green-600 flex-shrink-0" />
                <span>Thanh toán an toàn và bảo mật</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Truck size={20} className="text-blue-600 flex-shrink-0" />
                <span>Giao hàng toàn quốc</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <ShoppingBag size={20} className="text-orange-600 flex-shrink-0" />
                <span>Đổi trả trong 7 ngày</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
