import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { DienThoai, HangDienThoai } from '../../types';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCart, Search, Smartphone } from 'lucide-react';
import ProductDetail from '../Products/ProductDetail';

interface LoaiSanPham {
  id: string;
  ten_loai: string;
}

export default function ShopView() {
  const [dienThoais, setDienThoais] = useState<DienThoai[]>([]);
  const [hangs, setHangs] = useState<HangDienThoai[]>([]);
  const [loaiSanPhams, setLoaiSanPhams] = useState<LoaiSanPham[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<DienThoai[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHang, setSelectedHang] = useState('');
  const [selectedLoai, setSelectedLoai] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedHang, selectedLoai, dienThoais]);

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
      .eq('trang_thai', true)
      .gt('so_luong_ton', 0);

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

    if (selectedLoai) {
      filtered = filtered.filter((p) => p.loai_san_pham_id === selectedLoai);
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product: DienThoai) => {
    addToCart(product);
    alert('Đã thêm vào giỏ hàng!');
  };

  if (selectedProductId) {
    return <ProductDetail productId={selectedProductId} onBack={() => setSelectedProductId(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Cửa hàng điện thoại</h1>
        <p className="text-blue-100">Khám phá các sản phẩm điện thoại mới nhất</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedLoai}
          onChange={(e) => setSelectedLoai(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tất cả loại</option>
          {loaiSanPhams.map((loai) => (
            <option key={loai.id} value={loai.id}>
              {loai.ten_loai}
            </option>
          ))}
        </select>
        <select
          value={selectedHang}
          onChange={(e) => setSelectedHang(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tất cả hãng</option>
          {hangs.map((hang) => (
            <option key={hang.id} value={hang.id}>
              {hang.ten_hang}
            </option>
          ))}
        </select>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Smartphone size={64} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg">Không tìm thấy sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group cursor-pointer"
            >
              <div
                className="h-56 bg-slate-100 flex items-center justify-center"
                onClick={() => setSelectedProductId(product.id)}
              >
                {product.hinh_anh ? (
                  <img
                    src={product.hinh_anh}
                    alt={product.ten_sp}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <Smartphone size={80} className="text-slate-400" />
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-xs text-blue-600 font-semibold mb-1">
                  {product.hang_dien_thoai?.ten_hang}
                </div>
                <h3
                  className="font-bold text-slate-900 mb-2 text-lg group-hover:text-blue-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedProductId(product.id)}
                >
                  {product.ten_sp}
                </h3>
                <div className="space-y-1 text-sm text-slate-600 mb-4 flex-1">
                  {product.mo_ta && (
                    <p className="line-clamp-2">{product.mo_ta}</p>
                  )}
                  <p className="text-xs text-slate-500 font-semibold mt-2">
                    Còn {product.so_luong_ton} sản phẩm
                  </p>
                </div>
                <div className="border-t border-slate-100 pt-3 mt-auto">
                  <p className="text-2xl font-bold text-blue-600 mb-3">
                    {product.gia_tien.toLocaleString('vi-VN')} đ
                  </p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <ShoppingCart size={20} />
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
