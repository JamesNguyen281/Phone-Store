/*
  # Sửa lỗi đệ quy vô hạn trong RLS policies

  ## Vấn đề
  Các policies của bảng tai_khoan gây đệ quy vô hạn vì kiểm tra chính bảng tai_khoan
  trong điều kiện của policy.

  ## Giải pháp
  Đơn giản hóa policies, chỉ dùng auth.uid() thay vì query lại bảng tai_khoan
*/

-- =====================================================
-- XÓA CÁC POLICIES CŨ CỦA TAI_KHOAN
-- =====================================================

DROP POLICY IF EXISTS "Cho phép mọi người đăng ký tài khoản" ON tai_khoan;
DROP POLICY IF EXISTS "Người dùng xem tài khoản của mình" ON tai_khoan;
DROP POLICY IF EXISTS "Admin xem tất cả tài khoản" ON tai_khoan;
DROP POLICY IF EXISTS "Admin cập nhật tài khoản" ON tai_khoan;
DROP POLICY IF EXISTS "Admin xóa tài khoản" ON tai_khoan;

-- =====================================================
-- TẠO LẠI POLICIES MỚI CHO TAI_KHOAN
-- =====================================================

CREATE POLICY "Người dùng tạo tài khoản của mình"
  ON tai_khoan FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Người dùng xem tài khoản của mình"
  ON tai_khoan FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Người dùng cập nhật tài khoản của mình"
  ON tai_khoan FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- TẠO FUNCTION ĐỂ KIỂM TRA VAI TRÒ
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT ma_vai_tro FROM tai_khoan WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tai_khoan 
    WHERE id = auth.uid() 
    AND ma_vai_tro = 'ADMIN'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM tai_khoan 
    WHERE id = auth.uid() 
    AND ma_vai_tro IN ('ADMIN', 'NHANVIEN')
  );
$$;

-- =====================================================
-- CẬP NHẬT CÁC POLICIES KHÁC SỬ DỤNG FUNCTION
-- =====================================================

-- Khách hàng: policies
DROP POLICY IF EXISTS "Admin và nhân viên xem tất cả khách hàng" ON khach_hang;

CREATE POLICY "Staff xem tất cả khách hàng"
  ON khach_hang FOR SELECT
  TO authenticated
  USING (is_staff());

-- Nhân viên: policies
DROP POLICY IF EXISTS "Admin tạo nhân viên" ON nhan_vien;
DROP POLICY IF EXISTS "Admin và nhân viên xem nhân viên" ON nhan_vien;
DROP POLICY IF EXISTS "Admin cập nhật nhân viên" ON nhan_vien;
DROP POLICY IF EXISTS "Admin xóa nhân viên" ON nhan_vien;

CREATE POLICY "Admin tạo nhân viên"
  ON nhan_vien FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Staff xem nhân viên"
  ON nhan_vien FOR SELECT
  TO authenticated
  USING (tai_khoan_id = auth.uid() OR is_admin());

CREATE POLICY "Admin cập nhật nhân viên"
  ON nhan_vien FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admin xóa nhân viên"
  ON nhan_vien FOR DELETE
  TO authenticated
  USING (is_admin());

-- Hãng điện thoại: policies
DROP POLICY IF EXISTS "Admin và nhân viên thêm hãng" ON hang_dien_thoai;
DROP POLICY IF EXISTS "Admin và nhân viên cập nhật hãng" ON hang_dien_thoai;
DROP POLICY IF EXISTS "Admin xóa hãng" ON hang_dien_thoai;

CREATE POLICY "Staff thêm hãng"
  ON hang_dien_thoai FOR INSERT
  TO authenticated
  WITH CHECK (is_staff());

CREATE POLICY "Staff cập nhật hãng"
  ON hang_dien_thoai FOR UPDATE
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Admin xóa hãng"
  ON hang_dien_thoai FOR DELETE
  TO authenticated
  USING (is_admin());

-- Điện thoại: policies
DROP POLICY IF EXISTS "Admin và nhân viên thêm điện thoại" ON dien_thoai;
DROP POLICY IF EXISTS "Admin và nhân viên cập nhật điện thoại" ON dien_thoai;
DROP POLICY IF EXISTS "Admin xóa điện thoại" ON dien_thoai;

CREATE POLICY "Staff thêm điện thoại"
  ON dien_thoai FOR INSERT
  TO authenticated
  WITH CHECK (is_staff());

CREATE POLICY "Staff cập nhật điện thoại"
  ON dien_thoai FOR UPDATE
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Admin xóa điện thoại"
  ON dien_thoai FOR DELETE
  TO authenticated
  USING (is_admin());

-- Đơn hàng: policies
DROP POLICY IF EXISTS "Admin và nhân viên xem tất cả đơn hàng" ON don_hang;
DROP POLICY IF EXISTS "Admin và nhân viên cập nhật đơn hàng" ON don_hang;

CREATE POLICY "Staff xem tất cả đơn hàng"
  ON don_hang FOR SELECT
  TO authenticated
  USING (is_staff());

CREATE POLICY "Staff cập nhật đơn hàng"
  ON don_hang FOR UPDATE
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- Chi tiết đơn hàng: policies
DROP POLICY IF EXISTS "Admin và nhân viên xem tất cả chi tiết" ON chi_tiet_don_hang;
DROP POLICY IF EXISTS "Admin và nhân viên cập nhật chi tiết" ON chi_tiet_don_hang;

CREATE POLICY "Staff xem tất cả chi tiết"
  ON chi_tiet_don_hang FOR SELECT
  TO authenticated
  USING (is_staff());

CREATE POLICY "Staff cập nhật chi tiết"
  ON chi_tiet_don_hang FOR UPDATE
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- Hóa đơn: policies
DROP POLICY IF EXISTS "Admin và nhân viên xem tất cả hóa đơn" ON hoa_don;
DROP POLICY IF EXISTS "Admin và nhân viên tạo hóa đơn" ON hoa_don;
DROP POLICY IF EXISTS "Admin và nhân viên cập nhật hóa đơn" ON hoa_don;

CREATE POLICY "Staff xem tất cả hóa đơn"
  ON hoa_don FOR SELECT
  TO authenticated
  USING (is_staff());

CREATE POLICY "Staff tạo hóa đơn"
  ON hoa_don FOR INSERT
  TO authenticated
  WITH CHECK (is_staff());

CREATE POLICY "Staff cập nhật hóa đơn"
  ON hoa_don FOR UPDATE
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- Phản hồi: policies
DROP POLICY IF EXISTS "Admin và nhân viên xem tất cả phản hồi" ON phan_hoi;
DROP POLICY IF EXISTS "Admin và nhân viên trả lời phản hồi" ON phan_hoi;

CREATE POLICY "Staff xem tất cả phản hồi"
  ON phan_hoi FOR SELECT
  TO authenticated
  USING (is_staff());

CREATE POLICY "Staff trả lời phản hồi"
  ON phan_hoi FOR UPDATE
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

-- Thuộc tính sản phẩm: policies
DROP POLICY IF EXISTS "Admin và nhân viên thêm thuộc tính" ON thuoc_tinh_san_pham;
DROP POLICY IF EXISTS "Admin và nhân viên cập nhật thuộc tính" ON thuoc_tinh_san_pham;
DROP POLICY IF EXISTS "Admin xóa thuộc tính" ON thuoc_tinh_san_pham;

CREATE POLICY "Staff thêm thuộc tính"
  ON thuoc_tinh_san_pham FOR INSERT
  TO authenticated
  WITH CHECK (is_staff());

CREATE POLICY "Staff cập nhật thuộc tính"
  ON thuoc_tinh_san_pham FOR UPDATE
  TO authenticated
  USING (is_staff())
  WITH CHECK (is_staff());

CREATE POLICY "Admin xóa thuộc tính"
  ON thuoc_tinh_san_pham FOR DELETE
  TO authenticated
  USING (is_admin());
