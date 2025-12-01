import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Trash2, ShoppingCart, User, DollarSign, Percent } from 'lucide-react';

interface POSItem {
  dien_thoai_id: string;
  ten_sp: string;
  gia_ban: number;
  so_luong: number;
  giam_gia: number;
  bao_hanh: number;
  thanh_tien: number;
}

export default function POSView() {
  const { nhanVien } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [cartItems, setCartItems] = useState<POSItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    ho_ten: '',
    so_dien_thoai: '',
    dia_chi: '',
    email: '',
  });

  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('dien_thoai')
      .select('*, hang_dien_thoai(*)')
      .eq('trang_thai', true)
      .gt('so_luong_ton', 0)
      .order('ten_sp');
    if (data) setProducts(data);
  };

  const loadCustomers = async () => {
    const { data } = await supabase
      .from('khach_hang')
      .select('*')
      .order('ho_ten');
    if (data) setCustomers(data);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.ten_sp.toLowerCase().includes(searchProduct.toLowerCase()) ||
      p.hang_dien_thoai?.ten_hang.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const filteredCustomers = customers.filter(
    (c) =>
      c.ho_ten.toLowerCase().includes(searchCustomer.toLowerCase()) ||
      c.so_dien_thoai?.includes(searchCustomer)
  );

  const handleAddToCart = (product: any) => {
    const existing = cartItems.find((item) => item.dien_thoai_id === product.id);
    if (existing) {
      if (existing.so_luong >= product.so_luong_ton) {
        alert('Không đủ tồn kho!');
        return;
      }
      setCartItems(
        cartItems.map((item) =>
          item.dien_thoai_id === product.id
            ? {
                ...item,
                so_luong: item.so_luong + 1,
                thanh_tien: (item.so_luong + 1) * item.gia_ban * (1 - item.giam_gia / 100),
              }
            : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          dien_thoai_id: product.id,
          ten_sp: product.ten_sp,
          gia_ban: product.gia_tien,
          so_luong: 1,
          giam_gia: 0,
          bao_hanh: 12,
          thanh_tien: product.gia_tien,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems(cartItems.filter((item) => item.dien_thoai_id !== id));
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.dien_thoai_id === id
          ? {
              ...item,
              so_luong: quantity,
              thanh_tien: quantity * item.gia_ban * (1 - item.giam_gia / 100),
            }
          : item
      )
    );
  };

  const handleUpdateDiscount = (id: string, discount: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.dien_thoai_id === id
          ? {
              ...item,
              giam_gia: discount,
              thanh_tien: item.so_luong * item.gia_ban * (1 - discount / 100),
            }
          : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.dien_thoai_id !== id));
  };

  const getTotalAmount = () => {
    return cartItems.reduce((sum, item) => sum + item.thanh_tien, 0);
  };

  const getTotalDiscount = () => {
    return cartItems.reduce(
      (sum, item) => sum + item.so_luong * item.gia_ban * (item.giam_gia / 100),
      0
    );
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.ho_ten || !newCustomer.so_dien_thoai) {
      alert('Vui lòng nhập họ tên và số điện thoại');
      return;
    }

    const { data, error } = await supabase
      .from('khach_hang')
      .insert({
        ho_ten: newCustomer.ho_ten,
        so_dien_thoai: newCustomer.so_dien_thoai,
        dia_chi: newCustomer.dia_chi || null,
        email: newCustomer.email || null,
      })
      .select()
      .single();

    if (error) {
      alert('Lỗi khi thêm khách hàng: ' + error.message);
      return;
    }

    setSelectedCustomer(data);
    setShowAddCustomer(false);
    setNewCustomer({ ho_ten: '', so_dien_thoai: '', dia_chi: '', email: '' });
    loadCustomers();
  };

  const handleCheckout = async () => {
    if (!selectedCustomer) {
      alert('Vui lòng chọn khách hàng');
      return;
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng trống');
      return;
    }

    if (!nhanVien) {
      alert('Không tìm thấy thông tin nhân viên');
      return;
    }

    setLoading(true);
    try {
      const totalAmount = getTotalAmount();

      const { data: donHang, error: donHangError } = await supabase
        .from('don_hang')
        .insert({
          khach_hang_id: selectedCustomer.id,
          ma_trang_thai: 'DAGIAO',
          tong_tien: totalAmount,
          dia_chi_giao_hang: selectedCustomer.dia_chi || 'Mua tại quầy',
          so_dien_thoai_nhan: selectedCustomer.so_dien_thoai,
          ghi_chu: note || 'Bán tại quầy',
        })
        .select()
        .single();

      if (donHangError) throw donHangError;

      const chiTietItems = cartItems.map((item) => ({
        don_hang_id: donHang.id,
        dien_thoai_id: item.dien_thoai_id,
        so_luong: item.so_luong,
        gia_ban: item.gia_ban,
        thanh_tien: item.thanh_tien,
        giam_gia: item.giam_gia,
        bao_hanh: item.bao_hanh,
      }));

      await supabase.from('chi_tiet_don_hang').insert(chiTietItems);

      await supabase.from('hoa_don').insert({
        don_hang_id: donHang.id,
        phuong_thuc_thanh_toan: paymentMethod,
        trang_thai_thanh_toan: true,
        tong_tien: totalAmount,
        phan_loai: 'BAN',
        ngay_thanh_toan: new Date().toISOString(),
        nhan_vien_id: nhanVien.id,
        khach_hang_id: selectedCustomer.id,
      });

      for (const item of cartItems) {
        const product = products.find((p) => p.id === item.dien_thoai_id);
        if (product) {
          await supabase
            .from('dien_thoai')
            .update({ so_luong_ton: product.so_luong_ton - item.so_luong })
            .eq('id', item.dien_thoai_id);
        }
      }

      alert('Thanh toán thành công!');
      setCartItems([]);
      setSelectedCustomer(null);
      setNote('');
      setSearchProduct('');
      setSearchCustomer('');
      loadProducts();
    } catch (error: any) {
      alert('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleAddToCart(product)}
              className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all text-left"
            >
              <div className="aspect-square bg-slate-100 rounded-lg mb-3 flex items-center justify-center">
                {product.hinh_anh ? (
                  <img src={product.hinh_anh} alt={product.ten_sp} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <ShoppingCart size={40} className="text-slate-400" />
                )}
              </div>
              <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.ten_sp}</h3>
              <p className="text-xs text-slate-600 mb-2">{product.hang_dien_thoai?.ten_hang}</p>
              <div className="flex justify-between items-center">
                <span className="text-blue-600 font-bold">{product.gia_tien.toLocaleString()}đ</span>
                <span className="text-xs text-slate-500">Tồn: {product.so_luong_ton}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User size={18} />
              Khách hàng
            </h3>
            <button
              onClick={() => setShowAddCustomer(true)}
              className="text-blue-600 text-sm font-medium"
            >
              + Thêm mới
            </button>
          </div>

          {selectedCustomer ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-semibold text-blue-900">{selectedCustomer.ho_ten}</p>
              <p className="text-sm text-blue-700">{selectedCustomer.so_dien_thoai}</p>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-xs text-blue-600 hover:underline mt-1"
              >
                Đổi khách hàng
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                placeholder="Tìm khách hàng..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
              {searchCustomer && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setSearchCustomer('');
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b last:border-0"
                    >
                      <p className="font-medium text-sm">{customer.ho_ten}</p>
                      <p className="text-xs text-slate-600">{customer.so_dien_thoai}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ShoppingCart size={18} />
            Giỏ hàng ({cartItems.length})
          </h3>

          <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
            {cartItems.map((item) => (
              <div key={item.dien_thoai_id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-sm flex-1">{item.ten_sp}</p>
                  <button
                    onClick={() => handleRemoveItem(item.dien_thoai_id)}
                    className="text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label>SL:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.so_luong}
                      onChange={(e) => handleUpdateQuantity(item.dien_thoai_id, parseInt(e.target.value))}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1">
                      <Percent size={12} /> Giảm:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={item.giam_gia}
                      onChange={(e) => handleUpdateDiscount(item.dien_thoai_id, parseFloat(e.target.value))}
                      className="w-full px-2 py-1 border rounded"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-600">{item.gia_ban.toLocaleString()}đ x {item.so_luong}</span>
                  <span className="font-bold text-blue-600">{item.thanh_tien.toLocaleString()}đ</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Tạm tính:</span>
              <span className="font-medium">{(getTotalAmount() + getTotalDiscount()).toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Giảm giá:</span>
              <span className="font-medium text-red-600">-{getTotalDiscount().toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="font-bold">Tổng cộng:</span>
              <span className="text-2xl font-bold text-blue-600">{getTotalAmount().toLocaleString()}đ</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Thanh toán</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="CASH">Tiền mặt</option>
              <option value="TRANSFER">Chuyển khoản</option>
              <option value="CARD">Thẻ</option>
            </select>
          </div>

          <div className="mt-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
              rows={2}
            />
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading || cartItems.length === 0 || !selectedCustomer}
            className="w-full mt-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <DollarSign size={20} />
            {loading ? 'Đang xử lý...' : 'Thanh toán'}
          </button>
        </div>
      </div>

      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Thêm khách hàng mới</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomer.ho_ten}
                  onChange={(e) => setNewCustomer({ ...newCustomer, ho_ten: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={newCustomer.so_dien_thoai}
                  onChange={(e) => setNewCustomer({ ...newCustomer, so_dien_thoai: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <textarea
                  value={newCustomer.dia_chi}
                  onChange={(e) => setNewCustomer({ ...newCustomer, dia_chi: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddCustomer}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                Thêm
              </button>
              <button
                onClick={() => setShowAddCustomer(false)}
                className="flex-1 py-2 border text-slate-700 rounded-lg font-medium hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
