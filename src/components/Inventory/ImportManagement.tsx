import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { DienThoai } from '../../types';
import { Package, Plus, Save, Trash2, Archive } from 'lucide-react';

interface ImportItem {
  dien_thoai_id: string;
  ten_san_pham: string;
  so_luong: number;
  don_gia: number;
  thanh_tien: number;
}

export default function ImportManagement() {
  const [products, setProducts] = useState<DienThoai[]>([]);
  const [importItems, setImportItems] = useState<ImportItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [note, setNote] = useState('');
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [importHistory, setImportHistory] = useState<any[]>([]);
  const { nhanVien } = useAuth();

  useEffect(() => {
    loadProducts();
    loadImportHistory();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('dien_thoai')
        .select('*, hang_dien_thoai(*)')
        .order('ten_sp');

      if (error) {
        console.error('Error loading products for import:', error);
        alert('Không thể tải danh sách sản phẩm: ' + error.message);
        return;
      }

      console.log('Products loaded for import:', data);
      if (data) setProducts(data as any);
    } catch (error) {
      console.error('Exception loading products:', error);
    }
  };



  const loadImportHistory = async () => {
    const { data } = await supabase
      .from('hoa_don')
      .select('*, don_hang(*, chi_tiet_don_hang(*, dien_thoai(*, hang_dien_thoai(*))))')
      .eq('phan_loai', 'NHAP')
      .order('ngay_tao', { ascending: false })
      .limit(50);

    if (data) setImportHistory(data);
  };

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0 || price <= 0) {
      alert('Vui lòng chọn sản phẩm và nhập đầy đủ thông tin');
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const existingItem = importItems.find((item) => item.dien_thoai_id === selectedProduct);

    if (existingItem) {
      setImportItems(
        importItems.map((item) =>
          item.dien_thoai_id === selectedProduct
            ? {
                ...item,
                so_luong: item.so_luong + quantity,
                thanh_tien: (item.so_luong + quantity) * item.don_gia,
              }
            : item
        )
      );
    } else {
      setImportItems([
        ...importItems,
        {
          dien_thoai_id: selectedProduct,
          ten_san_pham: product.ten_sp,
          so_luong: quantity,
          don_gia: price,
          thanh_tien: quantity * price,
        },
      ]);
    }

    setSelectedProduct('');
    setQuantity(1);
    setPrice(0);
  };

  const handleRemoveItem = (dienThoaiId: string) => {
    setImportItems(importItems.filter((item) => item.dien_thoai_id !== dienThoaiId));
  };

  const getTotalAmount = () => {
    return importItems.reduce((sum, item) => sum + item.thanh_tien, 0);
  };

  const handleSaveImport = async () => {
    if (importItems.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm');
      return;
    }

    if (!nhanVien) {
      alert('Không tìm thấy thông tin nhân viên');
      return;
    }

    console.log('NhanVien info:', nhanVien);

    setLoading(true);
    try {
      const totalAmount = getTotalAmount();

      console.log('Creating don_hang with total:', totalAmount);
      const { data: donHang, error: donHangError } = await supabase
        .from('don_hang')
        .insert({
          khach_hang_id: null,
          ma_trang_thai: 'DAGIAO',
          tong_tien: totalAmount,
          dia_chi_giao_hang: 'Kho hàng',
          so_dien_thoai_nhan: nhanVien.so_dien_thoai || 'N/A',
          ghi_chu: `Nhập hàng - ${note}`,
        })
        .select()
        .single();

      if (donHangError) {
        console.error('Error creating don_hang:', donHangError);
        throw donHangError;
      }

      console.log('Don hang created:', donHang);

      const chiTietItems = importItems.map((item) => ({
        don_hang_id: donHang.id,
        dien_thoai_id: item.dien_thoai_id,
        so_luong: item.so_luong,
        gia_ban: item.don_gia,
        thanh_tien: item.thanh_tien,
        bao_hanh: 12,
        giam_gia: 0,
      }));

      console.log('Inserting chi_tiet_don_hang...', chiTietItems);
      const { error: chiTietError } = await supabase
        .from('chi_tiet_don_hang')
        .insert(chiTietItems);

      if (chiTietError) {
        console.error('Error creating chi_tiet_don_hang:', chiTietError);
        throw chiTietError;
      }

      console.log('Creating hoa_don...');
      const { error: hoaDonError } = await supabase.from('hoa_don').insert({
        don_hang_id: donHang.id,
        phuong_thuc_thanh_toan: 'TRANSFER',
        trang_thai_thanh_toan: true,
        tong_tien: totalAmount,
        phan_loai: 'NHAP',
        ngay_thanh_toan: new Date().toISOString(),
        nhan_vien_id: nhanVien.id,
        ghi_chu: note || 'Nhập hàng vào kho',
      });

      if (hoaDonError) {
        console.error('Error creating hoa_don:', hoaDonError);
        throw hoaDonError;
      }

      console.log('Updating inventory...');
      for (const item of importItems) {
        const product = products.find((p) => p.id === item.dien_thoai_id);
        if (product) {
          const newQuantity = product.so_luong_ton + item.so_luong;
          const { error: updateError } = await supabase
            .from('dien_thoai')
            .update({ so_luong_ton: newQuantity })
            .eq('id', item.dien_thoai_id);

          if (updateError) {
            console.error('Error updating inventory:', updateError);
            throw updateError;
          }
        }
      }

      alert('Nhập hàng thành công!');
      setImportItems([]);
      setNote('');
      loadProducts();
      loadImportHistory();
    } catch (error: any) {
      console.error('Error importing:', error);
      alert(`Có lỗi xảy ra khi nhập hàng: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImport = async (importId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phiếu nhập này?\n\nTồn kho sẽ được điều chỉnh lại.')) {
      return;
    }

    try {
      // Lấy chi tiết phiếu nhập
      const { data: invoice } = await supabase
        .from('hoa_don')
        .select('don_hang(chi_tiet_don_hang(dien_thoai_id, so_luong))')
        .eq('id', importId)
        .single();

      // Trừ lại tồn kho (vì đã cộng khi nhập)
      const details = (invoice?.don_hang as any)?.chi_tiet_don_hang || [];
      for (const detail of details) {
        const { data: product } = await supabase
          .from('dien_thoai')
          .select('so_luong_ton')
          .eq('id', detail.dien_thoai_id)
          .single();

        if (product) {
          const newStock = Math.max(0, product.so_luong_ton - detail.so_luong);
          await supabase
            .from('dien_thoai')
            .update({ so_luong_ton: newStock })
            .eq('id', detail.dien_thoai_id);
        }
      }

      // Xóa hóa đơn
      const { error } = await supabase.from('hoa_don').delete().eq('id', importId);
      if (error) throw error;

      alert('Đã xóa phiếu nhập thành công!');
      setSelectedHistory(null);
      loadProducts();
      loadImportHistory();
    } catch (error: any) {
      console.error('Error deleting import:', error);
      alert('Có lỗi xảy ra khi xóa phiếu nhập: ' + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Quản lý nhập hàng</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái - Các chức năng chính */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Thêm sản phẩm nhập</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Sản phẩm</label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                const product = products.find((p) => p.id === e.target.value);
                if (product) setPrice(product.gia_tien);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn sản phẩm</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.ten_sp} - {product.hang_dien_thoai?.ten_hang}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Đơn giá</label>
            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          onClick={handleAddItem}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm sản phẩm
        </button>
      </div>

          {importItems.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Danh sách nhập hàng</h3>

          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Số lượng
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Đơn giá
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Thành tiền
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {importItems.map((item) => (
                  <tr key={item.dien_thoai_id}>
                    <td className="px-4 py-3 text-sm text-slate-900">{item.ten_san_pham}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{item.so_luong}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {item.don_gia.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                      {item.thanh_tien.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemoveItem(item.dien_thoai_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-200 pt-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Tổng cộng:</span>
              <span className="text-2xl font-bold text-blue-600">
                {getTotalAmount().toLocaleString('vi-VN')} đ
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Ghi chú về đợt nhập hàng..."
              />
            </div>

            <button
              onClick={handleSaveImport}
              disabled={loading}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              {loading ? 'Đang lưu...' : 'Lưu phiếu nhập'}
            </button>
            </div>
          </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Lịch sử nhập hàng</h3>

        {importHistory.length === 0 ? (
          <div className="text-center py-8">
            <Package size={48} className="mx-auto text-slate-300 mb-2" />
            <p className="text-slate-500">Chưa có lịch sử nhập hàng</p>
          </div>
        ) : (
          <div className="space-y-3">
            {importHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setSelectedHistory(item)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm text-slate-600">
                      Ngày: {new Date(item.ngay_tao).toLocaleString('vi-VN')}
                    </p>
                    <p className="text-sm text-slate-600">
                      Số lượng: {item.don_hang?.chi_tiet_don_hang?.reduce((sum: number, ct: any) => sum + ct.so_luong, 0) || 0} sản phẩm
                    </p>
                    <p className="text-sm text-slate-600">
                      Loại: {item.don_hang?.chi_tiet_don_hang?.length || 0} mặt hàng
                    </p>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {item.tong_tien.toLocaleString('vi-VN')} đ
                  </p>
                </div>
                {item.don_hang?.ghi_chu && (
                  <p className="text-sm text-slate-700">Ghi chú: {item.don_hang.ghi_chu}</p>
                )}
              </div>
            ))}
            </div>
          )}
          </div>
        </div>

        {/* Cột phải - Tồn kho */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Archive size={20} />
              Tồn kho hiện tại
            </h3>

            <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-900">Sản phẩm</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-slate-900">SL</th>
                    <th className="px-3 py-2 text-center text-xs font-semibold text-slate-900">TT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-6 text-center text-sm text-slate-500">
                        Không có sản phẩm
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <div className="text-xs text-slate-900 font-medium">{product.ten_sp}</div>
                          <div className="text-xs text-slate-500">{product.hang_dien_thoai?.ten_hang}</div>
                        </td>
                        <td className="px-3 py-2 text-center text-sm font-semibold text-slate-900">
                          {product.so_luong_ton}
                        </td>
                        <td className="px-3 py-2 text-center">
                          {product.so_luong_ton === 0 ? (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                              Hết
                            </span>
                          ) : product.so_luong_ton < 5 ? (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
                              Ít
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Chi tiết phiếu nhập hàng</h3>
              <button
                onClick={() => setSelectedHistory(null)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Package size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Ngày nhập</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(selectedHistory.ngay_tao).toLocaleString('vi-VN')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Tổng tiền</p>
                  <p className="font-semibold text-green-600 text-xl">
                    {selectedHistory.tong_tien.toLocaleString('vi-VN')} đ
                  </p>
                </div>
                {selectedHistory.don_hang?.ghi_chu && (
                  <div className="col-span-2">
                    <p className="text-sm text-slate-600">Ghi chú</p>
                    <p className="font-medium text-slate-900">{selectedHistory.don_hang.ghi_chu}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-slate-900 mb-3">Danh sách sản phẩm nhập</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">STT</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Tên sản phẩm</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Hãng</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Số lượng</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Đơn giá</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedHistory.don_hang?.chi_tiet_don_hang?.map((detail: any, index: number) => (
                        <tr key={detail.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-slate-900">
                            {detail.dien_thoai?.ten_sp || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900">
                            {detail.dien_thoai?.hang_dien_thoai?.ten_hang || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-900">{detail.so_luong}</td>
                          <td className="px-4 py-3 text-sm text-slate-900">
                            {detail.gia_ban.toLocaleString('vi-VN')} đ
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">
                            {detail.thanh_tien.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right font-semibold text-slate-900">
                          Tổng cộng:
                        </td>
                        <td className="px-4 py-3 text-lg font-bold text-green-600">
                          {selectedHistory.tong_tien.toLocaleString('vi-VN')} đ
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Nút xóa phiếu nhập */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleDeleteImport(selectedHistory.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  Xóa phiếu nhập
                </button>
                <button
                  onClick={() => setSelectedHistory(null)}
                  className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
