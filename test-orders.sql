-- Kiểm tra tất cả đơn hàng
SELECT 
  id,
  khach_hang_id,
  ma_trang_thai,
  tong_tien,
  ngay_tao,
  dia_chi_giao_hang
FROM don_hang
ORDER BY ngay_tao DESC
LIMIT 20;

-- Kiểm tra đơn hàng có khách hàng
SELECT 
  dh.id,
  dh.ma_trang_thai,
  dh.tong_tien,
  dh.ngay_tao,
  kh.ho_ten as ten_khach_hang,
  kh.so_dien_thoai
FROM don_hang dh
LEFT JOIN khach_hang kh ON dh.khach_hang_id = kh.id
WHERE dh.khach_hang_id IS NOT NULL
ORDER BY dh.ngay_tao DESC
LIMIT 20;

-- Đếm tổng số đơn hàng
SELECT 
  COUNT(*) as tong_don_hang,
  COUNT(CASE WHEN khach_hang_id IS NOT NULL THEN 1 END) as don_co_khach_hang,
  COUNT(CASE WHEN khach_hang_id IS NULL THEN 1 END) as don_khong_co_khach_hang
FROM don_hang;
