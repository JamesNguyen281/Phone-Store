import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { DienThoai, ThuocTinhSanPham } from '../../types';
import { ArrowLeft, ShoppingCart, Cpu, HardDrive, Smartphone, Battery, Monitor } from 'lucide-react';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
}

export default function ProductDetail({ productId, onBack }: ProductDetailProps) {
  const [product, setProduct] = useState<DienThoai | null>(null);
  const [attributes, setAttributes] = useState<ThuocTinhSanPham | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { taiKhoan } = useAuth();
  const { addToCart } = useCart();

  const isKhachHang = taiKhoan?.ma_vai_tro === 'KHACHHANG';

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const { data: productData } = await supabase
        .from('dien_thoai')
        .select('*, hang_dien_thoai(*)')
        .eq('id', productId)
        .single();

      if (productData) {
        setProduct(productData as any);

        const { data: attributesData } = await supabase
          .from('thuoc_tinh_san_pham')
          .select('*')
          .eq('dien_thoai_id', productId)
          .maybeSingle();

        if (attributesData) {
          setAttributes(attributesData);
        }
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
    }
  };

  const getTinhTrangText = (tinhTrang: string) => {
    switch (tinhTrang) {
      case 'MOI':
        return 'Mới 100%';
      case 'CU':
        return 'Đã qua sử dụng';
      case 'TRUNG_BAY':
        return 'Trưng bày';
      default:
        return 'Không rõ';
    }
  };

  const getTinhTrangColor = (tinhTrang: string) => {
    switch (tinhTrang) {
      case 'MOI':
        return 'bg-green-100 text-green-800';
      case 'CU':
        return 'bg-orange-100 text-orange-800';
      case 'TRUNG_BAY':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-4">Không tìm thấy sản phẩm</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="mb-6 px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
      >
        <ArrowLeft size={20} />
        Quay lại
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          <div>
            <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-4">
              {product.hinh_anh ? (
                <img
                  src={product.hinh_anh}
                  alt={product.ten_sp}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Smartphone size={120} className="text-slate-300" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getTinhTrangColor(
                  product.tinh_trang
                )}`}
              >
                {getTinhTrangText(product.tinh_trang)}
              </span>
              {product.so_luong_ton > 0 ? (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Còn hàng ({product.so_luong_ton})
                </span>
              ) : (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  Hết hàng
                </span>
              )}
            </div>
          </div>

          <div>
            <div className="mb-4">
              <p className="text-sm text-slate-600 mb-1">
                {product.hang_dien_thoai?.ten_hang}
              </p>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {product.ten_sp}
              </h1>
              <p className="text-4xl font-bold text-blue-600">
                {product.gia_tien.toLocaleString('vi-VN')} đ
              </p>
            </div>

            {product.mo_ta && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Mô tả sản phẩm</h2>
                <p className="text-slate-700 leading-relaxed">{product.mo_ta}</p>
              </div>
            )}

            {attributes && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Thông số kỹ thuật</h2>

                <div className="space-y-3">
                  {/* Hiển thị loại phụ kiện nếu có */}
                  {attributes.loai_phu_kien && (
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <Smartphone size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">Loại phụ kiện</p>
                        <p className="text-sm text-slate-600">{attributes.loai_phu_kien}</p>
                      </div>
                    </div>
                  )}

                  {/* Chỉ hiển thị thông số điện thoại nếu KHÔNG phải phụ kiện */}
                  {!attributes.loai_phu_kien && (
                    <>
                      {attributes.chip_set && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <Cpu size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">Chipset</p>
                            <p className="text-sm text-slate-600">{attributes.chip_set}</p>
                          </div>
                        </div>
                      )}

                      {attributes.ram && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <HardDrive size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">RAM</p>
                            <p className="text-sm text-slate-600">{attributes.ram}</p>
                          </div>
                        </div>
                      )}

                      {attributes.bo_nho && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <HardDrive size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">Bộ nhớ</p>
                            <p className="text-sm text-slate-600">{attributes.bo_nho}</p>
                          </div>
                        </div>
                      )}

                      {attributes.man_hinh && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <Monitor size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">Màn hình</p>
                            <p className="text-sm text-slate-600">{attributes.man_hinh}</p>
                          </div>
                        </div>
                      )}

                      {attributes.dung_luong_pin && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <Battery size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">Pin</p>
                            <p className="text-sm text-slate-600">{attributes.dung_luong_pin}</p>
                          </div>
                        </div>
                      )}

                      {attributes.he_dieu_hanh && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <Smartphone size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">Hệ điều hành</p>
                            <p className="text-sm text-slate-600">{attributes.he_dieu_hanh}</p>
                          </div>
                        </div>
                      )}

                      {attributes.cong_sac && (
                        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                          <Battery size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">Cổng sạc</p>
                            <p className="text-sm text-slate-600">{attributes.cong_sac}</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {isKhachHang && product.so_luong_ton > 0 && (
              <div className="border-t border-slate-200 pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-medium text-slate-900">Số lượng:</label>
                  <input
                    type="number"
                    min="1"
                    max={product.so_luong_ton}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleAddToCart}
                  className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Thêm vào giỏ hàng
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
