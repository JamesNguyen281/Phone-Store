import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { PhanHoi } from '../../types';
import { MessageSquare, Send } from 'lucide-react';

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState<PhanHoi[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<PhanHoi | null>(null);
  const [replyText, setReplyText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { nhanVien } = useAuth();

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const loadFeedbacks = async () => {
    const { data } = await supabase
      .from('phan_hoi')
      .select('*, khach_hang(*), nhan_vien(*)')
      .order('ngay_tao', { ascending: false });

    if (data) setFeedbacks(data as any);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback || !nhanVien) return;

    await supabase
      .from('phan_hoi')
      .update({
        tra_loi: replyText,
        trang_thai: 'DA_TRA_LOI',
        nhan_vien_id: nhanVien.id,
        ngay_tra_loi: new Date().toISOString(),
      })
      .eq('id', selectedFeedback.id);

    setShowModal(false);
    setReplyText('');
    loadFeedbacks();
  };

  const handleViewFeedback = (feedback: PhanHoi) => {
    setSelectedFeedback(feedback);
    setReplyText(feedback.tra_loi || '');
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Quản lý phản hồi</h2>

      <div className="grid gap-4">
        {feedbacks.map((feedback) => (
          <div
            key={feedback.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleViewFeedback(feedback)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-blue-600" size={24} />
                <div>
                  <h3 className="font-semibold text-slate-900">{feedback.tieu_de}</h3>
                  <p className="text-sm text-slate-600">
                    {feedback.khach_hang?.ho_ten} -{' '}
                    {new Date(feedback.ngay_tao).toLocaleDateString('vi-VN')}
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
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-900 mb-1">Trả lời:</p>
                <p className="text-sm text-blue-800">{feedback.tra_loi}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Chi tiết phản hồi</h3>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-slate-600">Tiêu đề</p>
                <p className="font-semibold">{selectedFeedback.tieu_de}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Khách hàng</p>
                <p className="font-semibold">{selectedFeedback.khach_hang?.ho_ten}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Nội dung</p>
                <p className="text-slate-900">{selectedFeedback.noi_dung}</p>
              </div>
            </div>

            <form onSubmit={handleReply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Trả lời
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                  disabled={selectedFeedback.trang_thai === 'DA_TRA_LOI'}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Đóng
                </button>
                {selectedFeedback.trang_thai !== 'DA_TRA_LOI' && (
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Send size={18} />
                    Gửi trả lời
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
