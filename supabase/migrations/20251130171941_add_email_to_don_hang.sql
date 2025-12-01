/*
  # Thêm email vào đơn hàng

  1. Thay đổi
    - Thêm cột `email_nhan` vào bảng `don_hang`
    - Cho phép lưu email người nhận hàng
    - Mặc định: NULL (không bắt buộc)
  
  2. Lý do
    - Lưu email để gửi thông báo đơn hàng
    - Hiển thị trên hóa đơn đầy đủ
    - Người nhận có thể khác với người đặt
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'don_hang' AND column_name = 'email_nhan'
  ) THEN
    ALTER TABLE don_hang ADD COLUMN email_nhan text;
  END IF;
END $$;