import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Shield, UserCheck, UserPlus, X, Edit2 } from 'lucide-react';

export default function UserManagement() {
  const { taiKhoan } = useAuth();
  const isAdmin = taiKhoan?.ma_vai_tro === 'ADMIN';
  
  const [accounts, setAccounts] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingAccount, setEditingAccount] = useState<any>(null);

  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    hoTen: '',
    vaiTro: 'KHACHHANG',
    soDienThoai: '',
    diaChi: '',
    chucVu: '',
    namSinh: '',
    hinhAnh: '',
  });

  const [editUser, setEditUser] = useState({
    hoTen: '',
    soDienThoai: '',
    diaChi: '',
    chucVu: '',
    trangThai: true,
    namSinh: '',
    hinhAnh: '',
  });

  useEffect(() => {
    loadAccounts();
  }, [filter]);

  const loadAccounts = async () => {
    let query = supabase.from('tai_khoan').select('*').order('ngay_tao', { ascending: false });

    if (filter) {
      query = query.eq('ma_vai_tro', filter);
    }

    const { data: accountData } = await query;

    if (accountData) {
      const accountsWithDetails = await Promise.all(
        accountData.map(async (account) => {
          if (account.ma_vai_tro === 'KHACHHANG') {
            const { data: khData } = await supabase
              .from('khach_hang')
              .select('*')
              .eq('tai_khoan_id', account.id)
              .maybeSingle();
            return { ...account, profile: khData };
          } else if (account.ma_vai_tro === 'NHANVIEN' || account.ma_vai_tro === 'ADMIN') {
            const { data: nvData } = await supabase
              .from('nhan_vien')
              .select('*')
              .eq('tai_khoan_id', account.id)
              .maybeSingle();
            return { ...account, profile: nvData };
          }
          return account;
        })
      );
      setAccounts(accountsWithDetails);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="text-red-600" size={20} />;
      case 'NHANVIEN':
        return <UserCheck className="text-blue-600" size={20} />;
      case 'KHACHHANG':
        return <Users className="text-green-600" size={20} />;
      default:
        return <Users className="text-slate-600" size={20} />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Quản trị viên';
      case 'NHANVIEN':
        return 'Nhân viên';
      case 'KHACHHANG':
        return 'Khách hàng';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800';
      case 'NHANVIEN':
        return 'bg-blue-100 text-blue-800';
      case 'KHACHHANG':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Kiểm tra quyền: Chỉ Admin mới tạo được Admin
      if (newUser.vaiTro === 'ADMIN' && !isAdmin) {
        setError('Bạn không có quyền tạo tài khoản Quản trị viên');
        setLoading(false);
        return;
      }

      // Lưu session hiện tại
      const { data: currentSession } = await supabase.auth.getSession();
      
      // Tạo user mới (sẽ tự động login vào user mới)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        console.log('Creating tai_khoan for user:', authData.user.id);
        const { error: taiKhoanError } = await supabase.from('tai_khoan').insert({
          id: authData.user.id,
          email: newUser.email,
          ma_vai_tro: newUser.vaiTro,
        });

        if (taiKhoanError) {
          console.error('Error creating tai_khoan:', taiKhoanError);
          throw new Error('Không thể tạo tài khoản: ' + taiKhoanError.message);
        }

        if (newUser.vaiTro === 'KHACHHANG') {
          console.log('Creating khach_hang profile...');
          const { error: khError } = await supabase.from('khach_hang').insert({
            tai_khoan_id: authData.user.id,
            ho_ten: newUser.hoTen,
            so_dien_thoai: newUser.soDienThoai || null,
            dia_chi: newUser.diaChi || null,
            email: newUser.email,
          });

          if (khError) {
            console.error('Error creating khach_hang:', khError);
            throw new Error('Không thể tạo thông tin khách hàng: ' + khError.message);
          }
        } else if (newUser.vaiTro === 'NHANVIEN' || newUser.vaiTro === 'ADMIN') {
          console.log('Creating nhan_vien profile with data:', {
            tai_khoan_id: authData.user.id,
            ho_ten: newUser.hoTen,
            so_dien_thoai: newUser.soDienThoai,
            dia_chi: newUser.diaChi,
            chuc_vu: newUser.chucVu,
            nam_sinh: newUser.namSinh,
          });

          const { error: nvError } = await supabase.from('nhan_vien').insert({
            tai_khoan_id: authData.user.id,
            ho_ten: newUser.hoTen,
            so_dien_thoai: newUser.soDienThoai || null,
            dia_chi: newUser.diaChi || null,
            chuc_vu: newUser.chucVu || null,
            nam_sinh: newUser.namSinh ? parseInt(newUser.namSinh) : null,
            hinh_anh: newUser.hinhAnh || null,
          });

          if (nvError) {
            console.error('Error creating nhan_vien:', nvError);
            throw new Error('Không thể tạo thông tin nhân viên: ' + nvError.message);
          }
        }

        // Khôi phục session admin cũ (quan trọng!)
        if (currentSession?.session) {
          await supabase.auth.setSession({
            access_token: currentSession.session.access_token,
            refresh_token: currentSession.session.refresh_token,
          });
        }

        alert('Tạo tài khoản thành công!');
        setShowAddModal(false);
        setNewUser({
          email: '',
          password: '',
          hoTen: '',
          vaiTro: 'KHACHHANG',
          soDienThoai: '',
          diaChi: '',
          chucVu: '',
          namSinh: '',
          hinhAnh: '',
        });
        await loadAccounts();
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
      console.error('Error creating user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (account: any) => {
    setEditingAccount(account);
    setEditUser({
      hoTen: account.profile?.ho_ten || '',
      soDienThoai: account.profile?.so_dien_thoai || '',
      diaChi: account.profile?.dia_chi || '',
      chucVu: account.profile?.chuc_vu || '',
      trangThai: account.trang_thai,
      namSinh: account.profile?.nam_sinh ? account.profile.nam_sinh.toString() : '',
      hinhAnh: account.profile?.hinh_anh || '',
    });
    setShowEditModal(true);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await supabase
        .from('tai_khoan')
        .update({ trang_thai: editUser.trangThai })
        .eq('id', editingAccount.id);

      if (editingAccount.ma_vai_tro === 'KHACHHANG') {
        await supabase
          .from('khach_hang')
          .update({
            ho_ten: editUser.hoTen,
            so_dien_thoai: editUser.soDienThoai || null,
            dia_chi: editUser.diaChi || null,
          })
          .eq('tai_khoan_id', editingAccount.id);
      } else if (editingAccount.ma_vai_tro === 'NHANVIEN' || editingAccount.ma_vai_tro === 'ADMIN') {
        await supabase
          .from('nhan_vien')
          .update({
            ho_ten: editUser.hoTen,
            so_dien_thoai: editUser.soDienThoai || null,
            dia_chi: editUser.diaChi || null,
            chuc_vu: editUser.chucVu || null,
            nam_sinh: editUser.namSinh ? parseInt(editUser.namSinh) : null,
            hinh_anh: editUser.hinhAnh || null,
          })
          .eq('tai_khoan_id', editingAccount.id);
      }

      setShowEditModal(false);
      setEditingAccount(null);
      await loadAccounts();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Quản lý người dùng</h2>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="NHANVIEN">Nhân viên</option>
            <option value="KHACHHANG">Khách hàng</option>
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <UserPlus size={20} />
            Thêm người dùng
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Họ tên</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Vai trò</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                Ngày tạo
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {accounts.map((account) => (
              <tr key={account.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-sm text-slate-900">{account.email}</td>
                <td className="px-4 py-3 text-sm text-slate-900">
                  {account.profile?.ho_ten || 'N/A'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(account.ma_vai_tro)}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                        account.ma_vai_tro
                      )}`}
                    >
                      {getRoleName(account.ma_vai_tro)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.trang_thai
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {account.trang_thai ? 'Hoạt động' : 'Vô hiệu'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {new Date(account.ngay_tao).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleEditClick(account)}
                    className="text-blue-600 hover:text-blue-700 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Thêm người dùng mới</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError('');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
                <p className="text-xs text-slate-500 mt-1">Tối thiểu 6 ký tự</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.hoTen}
                  onChange={(e) => setNewUser({ ...newUser, hoTen: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  value={newUser.vaiTro}
                  onChange={(e) => setNewUser({ ...newUser, vaiTro: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="KHACHHANG">Khách hàng</option>
                  <option value="NHANVIEN">Nhân viên</option>
                  {isAdmin && <option value="ADMIN">Quản trị viên</option>}
                </select>
                {!isAdmin && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Chỉ Admin mới có thể tạo tài khoản Quản trị viên
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={newUser.soDienThoai}
                  onChange={(e) => setNewUser({ ...newUser, soDienThoai: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Địa chỉ
                </label>
                <textarea
                  value={newUser.diaChi}
                  onChange={(e) => setNewUser({ ...newUser, diaChi: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Năm sinh
                </label>
                <input
                  type="number"
                  value={newUser.namSinh}
                  onChange={(e) => setNewUser({ ...newUser, namSinh: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: 1990"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL Hình ảnh
                </label>
                <input
                  type="url"
                  value={newUser.hinhAnh}
                  onChange={(e) => setNewUser({ ...newUser, hinhAnh: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {(newUser.vaiTro === 'NHANVIEN' || newUser.vaiTro === 'ADMIN') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Chức vụ
                  </label>
                  <input
                    type="text"
                    value={newUser.chucVu}
                    onChange={(e) => setNewUser({ ...newUser, chucVu: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError('');
                  }}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                Chỉnh sửa thông tin người dùng
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setError('');
                  setEditingAccount(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getRoleIcon(editingAccount.ma_vai_tro)}
                  <span className="font-medium text-slate-900">
                    {editingAccount.email}
                  </span>
                </div>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                    editingAccount.ma_vai_tro
                  )}`}
                >
                  {getRoleName(editingAccount.ma_vai_tro)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Họ tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editUser.hoTen}
                  onChange={(e) => setEditUser({ ...editUser, hoTen: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={editUser.soDienThoai}
                  onChange={(e) => setEditUser({ ...editUser, soDienThoai: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Địa chỉ
                </label>
                <textarea
                  value={editUser.diaChi}
                  onChange={(e) => setEditUser({ ...editUser, diaChi: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Năm sinh
                </label>
                <input
                  type="number"
                  value={editUser.namSinh}
                  onChange={(e) => setEditUser({ ...editUser, namSinh: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: 1990"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL Hình ảnh
                </label>
                <input
                  type="url"
                  value={editUser.hinhAnh}
                  onChange={(e) => setEditUser({ ...editUser, hinhAnh: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {(editingAccount.ma_vai_tro === 'NHANVIEN' || editingAccount.ma_vai_tro === 'ADMIN') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Chức vụ
                  </label>
                  <input
                    type="text"
                    value={editUser.chucVu}
                    onChange={(e) => setEditUser({ ...editUser, chucVu: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Trạng thái tài khoản
                </label>
                <select
                  value={editUser.trangThai ? 'true' : 'false'}
                  onChange={(e) => setEditUser({ ...editUser, trangThai: e.target.value === 'true' })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">Hoạt động</option>
                  <option value="false">Vô hiệu hóa</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setError('');
                    setEditingAccount(null);
                  }}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
