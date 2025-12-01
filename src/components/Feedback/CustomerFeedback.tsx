import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PhanHoi } from '../../types';
import { MessageSquare, Plus } from 'lucide-react';

export default function CustomerFeedback() {
  const [feedbacks, setFeedbacks] = useState<PhanHoi[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    tieu_de: '',
    noi_dung: '',
  });
  const { khachHang } = useAuth();

  useEffect(() => {
    if (khachHang) {
      loadFeedbacks();
    }
  }, [khachHang]);

  const loadFeedbacks = async () => {
    if (!khachHang) return;

    const { data } = await supabase
      .from('phan_hoi')
      .select('*, nhan_vien(*)')
      .eq('khach_hang_id', khachHang.id)
      .order('ngay_tao', { ascending: false });

    if (data) setFeedbacks(data as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!khachHang) return;

    await supabase.from('phan_hoi').insert({
      khach_hang_id: khachHang.id,
      tieu_de: formData.tieu_de,
      noi_dung: formData.noi_dung,
      trang_thai: 'CHUA_TRA_LOI',
    });

    setFormData({ tieu_de: '', noi_dung: '' });
    setShowModal(false);
    loadFeedbacks();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Phản hồi của tôi</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Gửi phản hồi mới
        </button>
      </div>

      <div className="grid gap-4">
        {feedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-blue-600" size={24} />
                <div>
                  <h3 className="font-semibold text-slate-900">{feedback.tieu_de}</h3>
                  <p className="text-sm text-slate-600">
                    {new Date(feedback.ngay_tao).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  feedback.trang_thai === 'DA_TRA_LOI'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {feedback.trang_thai === 'DA_TRA_LOI' ? 'Đã trả lời' : 'Chưa trả lời'}
              </span>
            </div>
            <p className="text-slate-700 mb-2">{feedback.noi_dung}</p>
            {feedback.tra_loi && (
              <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-semibold text-blue-900">
                    Trả lời từ {feedback.nhan_vien?.ho_ten}
                  </p>
                  <p className="text-xs text-blue-700">
                    {feedback.ngay_tra_loi &&
                      new Date(feedback.ngay_tra_loi).toLocaleString('vi-VN')}
                  </p>
                </div>
                <p className="text-sm text-blue-800">{feedback.tra_loi}</p>
              </div>
            )}
          </div>
        ))}

        {feedbacks.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare size={64} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500">Bạn chưa có phản hồi nào</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Gửi phản hồi mới</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={formData.tieu_de}
                  onChange={(e) => setFormData({ ...formData, tieu_de: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nội dung
                </label>
                <textarea
                  value={formData.noi_dung}
                  onChange={(e) => setFormData({ ...formData, noi_dung: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Gửi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
