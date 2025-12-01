/*
  # Cho phép khach_hang_id NULL trong đơn hàng
  
  ## Vấn đề
  Cột khach_hang_id trong bảng don_hang đang có constraint NOT NULL.
  Điều này ngăn không cho tạo đơn nhập/xuất kho (không có khách hàng).
  
  ## Giải pháp
  - Thay đổi cột khach_hang_id thành nullable
  - Đơn hàng của khách: khach_hang_id có giá trị
  - Đơn nhập/xuất kho: khach_hang_id = NULL
  
  ## An toàn dữ liệu
  - Không xóa dữ liệu hiện có
  - Chỉ thay đổi constraint
*/

-- Cho phép khach_hang_id NULL
ALTER TABLE don_hang 
ALTER COLUMN khach_hang_id DROP NOT NULL;
