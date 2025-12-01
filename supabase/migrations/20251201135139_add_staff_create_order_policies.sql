/*
  # Thêm policies cho Staff tạo đơn hàng và chi tiết đơn hàng

  ## Vấn đề
  Staff không thể tạo đơn hàng cho nhập/xuất hàng vì thiếu policies INSERT.
  Hiện tại chỉ có policy cho khách hàng tạo đơn hàng.

  ## Giải pháp
  Thêm policies cho staff tạo đơn hàng và chi tiết đơn hàng (dùng cho nhập/xuất kho)
*/

-- Policy cho staff tạo đơn hàng (nhập/xuất kho)
CREATE POLICY "Staff tạo đơn hàng"
  ON don_hang FOR INSERT
  TO authenticated
  WITH CHECK (is_staff());

-- Policy cho staff tạo chi tiết đơn hàng
CREATE POLICY "Staff tạo chi tiết đơn hàng"
  ON chi_tiet_don_hang FOR INSERT
  TO authenticated
  WITH CHECK (is_staff());
