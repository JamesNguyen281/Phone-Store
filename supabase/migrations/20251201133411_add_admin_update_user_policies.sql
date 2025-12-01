/*
  # Thêm policies cho Admin cập nhật thông tin người dùng

  ## Mô tả
  Cho phép admin cập nhật thông tin trong bảng khach_hang và nhan_vien

  ## Policies
  - Admin có thể cập nhật thông tin khách hàng
  - Admin có thể cập nhật trạng thái tài khoản
*/

-- Policy cho admin cập nhật khách hàng
CREATE POLICY "Admin cập nhật khách hàng"
  ON khach_hang FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Policy cho admin cập nhật tài khoản (trạng thái)
CREATE POLICY "Admin cập nhật tài khoản"
  ON tai_khoan FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
