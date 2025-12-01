import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Smartphone } from 'lucide-react';

interface HangDienThoai {
  id: string;
  ten_hang: string;
  quoc_gia: string;
  mo_ta: string;
}

export default function BrandManagement() {
  const [brands, setBrands] = useState<HangDienThoai[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ten_hang: '',
    quoc_gia: '',
    mo_ta: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    const { data } = await supabase
      .from('hang_dien_thoai')
      .select('*')
      .order('ten_hang');
    setBrands(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await supabase
          .from('hang_dien_thoai')
          .update(formData)
          .eq('id', editingId);
      } else {
        await supabase.from('hang_dien_thoai').insert([formData]);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ ten_hang: '', quoc_gia: '', mo_ta: '' });
      loadBrands();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (brand: HangDienThoai) => {
    setEditingId(brand.id);
    setFormData({
      ten_hang: brand.ten_hang,
      quoc_gia: brand.quoc_gia || '',
      mo_ta: brand.mo_ta || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa hãng này?')) return;

    try {
      await supabase.from('hang_dien_thoai').delete().eq('id', id);
      loadBrands();
    } catch (error) {
      console.error('Error:', error);
      alert('Không thể xóa hãng này. Có thể đã có sản phẩm liên kết.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
            <Smartphone size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý hãng sản xuất</h1>
            <p className="text-slate-600 text-sm">Quản lý các hãng điện thoại</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ ten_hang: '', quoc_gia: '', mo_ta: '' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Thêm hãng mới
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingId ? 'Chỉnh sửa hãng' : 'Thêm hãng mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên hãng
                </label>
                <input
                  type="text"
                  value={formData.ten_hang}
                  onChange={(e) => setFormData({ ...formData, ten_hang: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quốc gia
                </label>
                <input
                  type="text"
                  value={formData.quoc_gia}
                  onChange={(e) => setFormData({ ...formData, quoc_gia: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.mo_ta}
                  onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ ten_hang: '', quoc_gia: '', mo_ta: '' });
                  }}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg hover:bg-slate-300 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {brand.ten_hang}
                  </h3>
                  {brand.quoc_gia && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      {brand.quoc_gia}
                    </span>
                  )}
                </div>
                {brand.mo_ta && (
                  <p className="text-slate-600 text-sm">{brand.mo_ta}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(brand)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(brand.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {brands.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Smartphone size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600">Chưa có hãng nào</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Thêm hãng đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
