/*
  # Thêm policy cho Admin xem tất cả tài khoản

  ## Vấn đề
  Policy "Admin xem tất cả tài khoản" đã bị xóa trong migration trước
  nhưng chưa được tạo lại, dẫn đến admin không thể xem danh sách người dùng.

  ## Giải pháp
  Tạo policy mới sử dụng function is_admin() để admin có thể xem tất cả tài khoản.
*/

-- Tạo policy cho admin xem tất cả tài khoản
CREATE POLICY "Admin xem tất cả tài khoản"
  ON tai_khoan FOR SELECT
  TO authenticated
  USING (is_admin());
