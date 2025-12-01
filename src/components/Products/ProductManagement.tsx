import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DienThoai, HangDienThoai, ThuocTinhSanPham } from '../../types';
import { Plus, Edit, Trash2, Search, Smartphone } from 'lucide-react';

interface LoaiSanPham {
  id: string;
  ten_loai: string;
}

export default function ProductManagement() {
  const [dienThoais, setDienThoais] = useState<DienThoai[]>([]);
  const [hangs, setHangs] = useState<HangDienThoai[]>([]);
  const [loaiSanPhams, setLoaiSanPhams] = useState<LoaiSanPham[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<DienThoai[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHang, setSelectedHang] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DienThoai | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    hang_id: '',
    loai_san_pham_id: '',
    ten_sp: '',
    mo_ta: '',
    gia_tien: '',
    so_luong_ton: '',
    tinh_trang: 'MOI',
    hinh_anh: '',
  });

  const [attributesData, setAttributesData] = useState({
    bo_nho: '',
    ram: '',
    chip_set: '',
    he_dieu_hanh: '',
    man_hinh: '',
    dung_luong_pin: '',
    cong_sac: '',
    loai_phu_kien: '',
  });



  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedHang, dienThoais]);

  const loadData = async () => {
    const { data: hangData } = await supabase
      .from('hang_dien_thoai')
      .select('*')
      .order('ten_hang');

    const { data: loaiData } = await supabase
      .from('loai_san_pham')
      .select('*')
      .order('ten_loai');

    const { data: phoneData } = await supabase
      .from('dien_thoai')
      .select('*, hang_dien_thoai(*)')
      .order('ten_sp');

    if (hangData) setHangs(hangData);
    if (loaiData) setLoaiSanPhams(loaiData);
    if (phoneData) setDienThoais(phoneData as any);
  };

  const filterProducts = () => {
    let filtered = [...dienThoais];

    if (searchTerm) {
      filtered = filtered.filter((p) =>
        p.ten_sp.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedHang) {
      filtered = filtered.filter((p) => p.hang_id === selectedHang);
    }

    setFilteredProducts(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        hang_id: formData.hang_id,
        loai_san_pham_id: formData.loai_san_pham_id || null,
        ten_sp: formData.ten_sp,
        mo_ta: formData.mo_ta,
        gia_tien: parseFloat(formData.gia_tien),
        so_luong_ton: parseInt(formData.so_luong_ton),
        tinh_trang: formData.tinh_trang,
        hinh_anh: formData.hinh_anh || null,
        trang_thai: true,
      };

      let productId: string;

      if (editingProduct) {
        await supabase
          .from('dien_thoai')
          .update(data)
          .eq('id', editingProduct.id);
        productId = editingProduct.id;

        // Update attributes
        const { data: existingAttr } = await supabase
          .from('thuoc_tinh_san_pham')
          .select('id')
          .eq('dien_thoai_id', productId)
          .maybeSingle();

        const attrData = {
          dien_thoai_id: productId,
          bo_nho: attributesData.bo_nho || null,
          ram: attributesData.ram || null,
          chip_set: attributesData.chip_set || null,
          he_dieu_hanh: attributesData.he_dieu_hanh || null,
          man_hinh: attributesData.man_hinh || null,
          dung_luong_pin: attributesData.dung_luong_pin || null,
          cong_sac: attributesData.cong_sac || null,
          loai_phu_kien: attributesData.loai_phu_kien || null,
        };

        if (existingAttr) {
          await supabase
            .from('thuoc_tinh_san_pham')
            .update(attrData)
            .eq('id', existingAttr.id);
        } else {
          await supabase.from('thuoc_tinh_san_pham').insert(attrData);
        }
      } else {
        const { data: newProduct, error } = await supabase
          .from('dien_thoai')
          .insert(data)
          .select()
          .single();

        if (error) throw error;
        productId = newProduct.id;

        // Insert attributes
        await supabase.from('thuoc_tinh_san_pham').insert({
          dien_thoai_id: productId,
          bo_nho: attributesData.bo_nho || null,
          ram: attributesData.ram || null,
          chip_set: attributesData.chip_set || null,
          he_dieu_hanh: attributesData.he_dieu_hanh || null,
          man_hinh: attributesData.man_hinh || null,
          dung_luong_pin: attributesData.dung_luong_pin || null,
          cong_sac: attributesData.cong_sac || null,
          loai_phu_kien: attributesData.loai_phu_kien || null,
        });
      }

      setShowModal(false);
      resetForm();
      loadData();
      alert('Lưu sản phẩm thành công!');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    await supabase.from('dien_thoai').delete().eq('id', id);
    loadData();
  };

  const handleEdit = async (product: DienThoai) => {
    setEditingProduct(product);
    setFormData({
      hang_id: product.hang_id,
      loai_san_pham_id: product.loai_san_pham_id || '',
      ten_sp: product.ten_sp,
      mo_ta: product.mo_ta || '',
      gia_tien: product.gia_tien.toString(),
      so_luong_ton: product.so_luong_ton.toString(),
      tinh_trang: product.tinh_trang || 'MOI',
      hinh_anh: product.hinh_anh || '',
    });

    // Load attributes
    const { data: attrs } = await supabase
      .from('thuoc_tinh_san_pham')
      .select('*')
      .eq('dien_thoai_id', product.id)
      .maybeSingle();

    if (attrs as ThuocTinhSanPham) {
      setAttributesData({
        bo_nho: attrs.bo_nho || '',
        ram: attrs.ram || '',
        chip_set: attrs.chip_set || '',
        he_dieu_hanh: attrs.he_dieu_hanh || '',
        man_hinh: attrs.man_hinh || '',
        dung_luong_pin: attrs.dung_luong_pin || '',
        cong_sac: attrs.cong_sac || '',
        loai_phu_kien: attrs.loai_phu_kien || '',
      });
    } else {
      setAttributesData({
        bo_nho: '',
        ram: '',
        chip_set: '',
        he_dieu_hanh: '',
        man_hinh: '',
        dung_luong_pin: '',
        cong_sac: '',
        loai_phu_kien: '',
      });
    }

    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      hang_id: '',
      loai_san_pham_id: '',
      ten_sp: '',
      mo_ta: '',
      gia_tien: '',
      so_luong_ton: '',
      tinh_trang: 'MOI',
      hinh_anh: '',
    });
    setAttributesData({
      bo_nho: '',
      ram: '',
      chip_set: '',
      he_dieu_hanh: '',
      man_hinh: '',
      dung_luong_pin: '',
      cong_sac: '',
      loai_phu_kien: '',
    });
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Quản lý sản phẩm</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Thêm sản phẩm
        </button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedHang}
          onChange={(e) => setSelectedHang(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tất cả hãng</option>
          {hangs.map((hang) => (
            <option key={hang.id} value={hang.id}>
              {hang.ten_hang}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const getTinhTrangText = (tinhTrang: string) => {
            switch (tinhTrang) {
              case 'MOI': return 'Mới 100%';
              case 'CU': return 'Đã qua sử dụng';
              case 'TRUNG_BAY': return 'Trưng bày';
              default: return 'Không rõ';
            }
          };

          const getTinhTrangColor = (tinhTrang: string) => {
            switch (tinhTrang) {
              case 'MOI': return 'bg-green-100 text-green-800';
              case 'CU': return 'bg-orange-100 text-orange-800';
              case 'TRUNG_BAY': return 'bg-blue-100 text-blue-800';
              default: return 'bg-slate-100 text-slate-800';
            }
          };

          return (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-slate-100 flex items-center justify-center relative">
                {product.hinh_anh ? (
                  <img src={product.hinh_anh} alt={product.ten_sp} className="h-full w-full object-cover" />
                ) : (
                  <Smartphone size={64} className="text-slate-400" />
                )}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTinhTrangColor(product.tinh_trang)}`}>
                    {getTinhTrangText(product.tinh_trang)}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs text-blue-600 font-medium mb-1">
                  {product.hang_dien_thoai?.ten_hang}
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{product.ten_sp}</h3>
                <div className="space-y-1 text-sm text-slate-600 mb-3">
                  {product.mo_ta && (
                    <p className="line-clamp-2 text-xs">{product.mo_ta}</p>
                  )}
                  <p className="font-semibold text-blue-600 text-lg">
                    {product.gia_tien.toLocaleString('vi-VN')} đ
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span>Tồn kho: <span className="font-semibold">{product.so_luong_ton}</span></span>
                    <span className={`px-2 py-0.5 rounded-full ${product.trang_thai ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.trang_thai ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit size={16} />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại sản phẩm</label>
                  <select
                    value={formData.loai_san_pham_id}
                    onChange={(e) => setFormData({ ...formData, loai_san_pham_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn loại sản phẩm</option>
                    {loaiSanPhams.map((loai) => (
                      <option key={loai.id} value={loai.id}>
                        {loai.ten_loai}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hãng</label>
                  <select
                    value={formData.hang_id}
                    onChange={(e) => setFormData({ ...formData, hang_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Chọn hãng</option>
                    {hangs.map((hang) => (
                      <option key={hang.id} value={hang.id}>
                        {hang.ten_hang}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tên sản phẩm</label>
                  <input
                    type="text"
                    value={formData.ten_sp}
                    onChange={(e) => setFormData({ ...formData, ten_sp: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá bán</label>
                  <input
                    type="number"
                    value={formData.gia_tien}
                    onChange={(e) => setFormData({ ...formData, gia_tien: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng tồn</label>
                  <input
                    type="number"
                    value={formData.so_luong_ton}
                    onChange={(e) => setFormData({ ...formData, so_luong_ton: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tình trạng</label>
                  <select
                    value={formData.tinh_trang}
                    onChange={(e) => setFormData({ ...formData, tinh_trang: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="MOI">Mới 100%</option>
                    <option value="CU">Đã qua sử dụng</option>
                    <option value="TRUNG_BAY">Trưng bày</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">URL hình ảnh</label>
                  <input
                    type="url"
                    value={formData.hinh_anh}
                    onChange={(e) => setFormData({ ...formData, hinh_anh: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                  <textarea
                    value={formData.mo_ta}
                    onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4 mt-4">
                <h4 className="text-lg font-semibold text-slate-900 mb-3">Thông số kỹ thuật</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Chipset</label>
                    <input
                      type="text"
                      value={attributesData.chip_set}
                      onChange={(e) => setAttributesData({ ...attributesData, chip_set: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Apple A15 Bionic"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">RAM</label>
                    <input
                      type="text"
                      value={attributesData.ram}
                      onChange={(e) => setAttributesData({ ...attributesData, ram: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 8GB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bộ nhớ</label>
                    <input
                      type="text"
                      value={attributesData.bo_nho}
                      onChange={(e) => setAttributesData({ ...attributesData, bo_nho: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 256GB"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Hệ điều hành</label>
                    <input
                      type="text"
                      value={attributesData.he_dieu_hanh}
                      onChange={(e) => setAttributesData({ ...attributesData, he_dieu_hanh: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: iOS 17"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Màn hình</label>
                    <input
                      type="text"
                      value={attributesData.man_hinh}
                      onChange={(e) => setAttributesData({ ...attributesData, man_hinh: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 6.7 inch Super Retina XDR"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pin</label>
                    <input
                      type="text"
                      value={attributesData.dung_luong_pin}
                      onChange={(e) => setAttributesData({ ...attributesData, dung_luong_pin: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: 4422 mAh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Cổng sạc</label>
                    <input
                      type="text"
                      value={attributesData.cong_sac}
                      onChange={(e) => setAttributesData({ ...attributesData, cong_sac: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: USB-C"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Loại phụ kiện</label>
                    <input
                      type="text"
                      value={attributesData.loai_phu_kien}
                      onChange={(e) => setAttributesData({ ...attributesData, loai_phu_kien: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="VD: Tai nghe có dây"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
