import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';

interface LoaiDienThoai {
  id: string;
  ten_loai: string;
  mo_ta: string;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<LoaiDienThoai[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    ten_loai: '',
    mo_ta: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('loai_san_pham')
      .select('*')
      .order('ten_loai');
    setCategories(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        await supabase
          .from('loai_san_pham')
          .update(formData)
          .eq('id', editingId);
      } else {
        await supabase.from('loai_san_pham').insert([formData]);
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ ten_loai: '', mo_ta: '' });
      loadCategories();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: LoaiDienThoai) => {
    setEditingId(category.id);
    setFormData({
      ten_loai: category.ten_loai,
      mo_ta: category.mo_ta || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa loại sản phẩm này?')) return;

    try {
      await supabase.from('loai_san_pham').delete().eq('id', id);
      loadCategories();
    } catch (error) {
      console.error('Error:', error);
      alert('Không thể xóa loại sản phẩm này. Có thể đã có sản phẩm liên kết.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <Tag size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Quản lý loại sản phẩm</h1>
            <p className="text-slate-600 text-sm">Quản lý các loại điện thoại</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({ ten_loai: '', mo_ta: '' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm loại mới
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editingId ? 'Chỉnh sửa loại sản phẩm' : 'Thêm loại sản phẩm mới'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tên loại sản phẩm
                </label>
                <input
                  type="text"
                  value={formData.ten_loai}
                  onChange={(e) => setFormData({ ...formData, ten_loai: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.mo_ta}
                  onChange={(e) => setFormData({ ...formData, mo_ta: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Đang xử lý...' : editingId ? 'Cập nhật' : 'Thêm mới'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ ten_loai: '', mo_ta: '' });
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
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  {category.ten_loai}
                </h3>
                {category.mo_ta && (
                  <p className="text-slate-600 text-sm">{category.mo_ta}</p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <Tag size={48} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-600">Chưa có loại sản phẩm nào</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Thêm loại sản phẩm đầu tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
