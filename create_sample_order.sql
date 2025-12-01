-- =====================================================
-- SCRIPT TẠO ĐƠN HÀNG MẪU
-- Chạy script này trong Supabase SQL Editor
-- =====================================================

-- Bước 1: Xóa dữ liệu đơn hàng cũ (nếu muốn)
-- DELETE FROM chi_tiet_don_hang;
-- DELETE FROM don_hang WHERE khach_hang_id IS NOT NULL;

-- Bước 2: Tạo đơn hàng mẫu
-- Thay thế các giá trị sau bằng ID thực tế từ database của bạn:
-- - <KHACH_HANG_ID>: ID của khách hàng (lấy từ bảng khach_hang)
-- - <PRODUCT1_ID>: ID của sản phẩm 1 (lấy từ bảng dien_thoai)
-- - <PRODUCT2_ID>: ID của sản phẩm 2 (lấy từ bảng dien_thoai)

-- Cách lấy ID:
-- 1. Chạy: SELECT id, ho_ten FROM khach_hang LIMIT 5;
-- 2. Chạy: SELECT id, ten_sp, gia_tien FROM dien_thoai WHERE trang_thai = true LIMIT 10;
-- 3. Copy các ID và thay vào script dưới đây

-- =====================================================
-- VÍ DỤ: Tạo đơn hàng với dữ liệu thực tế
-- =====================================================

DO $$
DECLARE
  v_khach_hang_id UUID;
  v_don_hang_id UUID;
  v_product1_id UUID;
  v_product1_price DECIMAL;
  v_product2_id UUID;
  v_product2_price DECIMAL;
BEGIN
  -- Lấy khách hàng đầu tiên
  SELECT id INTO v_khach_hang_id 
  FROM khach_hang 
  ORDER BY ngay_tao DESC 
  LIMIT 1;
  
  -- Lấy 2 sản phẩm
  SELECT id, gia_tien INTO v_product1_id, v_product1_price
  FROM dien_thoai 
  WHERE trang_thai = true 
  ORDER BY gia_tien DESC 
  LIMIT 1;
  
  SELECT id, gia_tien INTO v_product2_id, v_product2_price
  FROM dien_thoai 
  WHERE trang_thai = true AND id != v_product1_id
  ORDER BY gia_tien 
  LIMIT 1;
  
  -- Kiểm tra có dữ liệu không
  IF v_khach_hang_id IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy khách hàng. Vui lòng tạo tài khoản khách hàng trước.';
  END IF;
  
  IF v_product1_id IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy sản phẩm. Vui lòng thêm sản phẩm trước.';
  END IF;
  
  -- Tạo đơn hàng
  INSERT INTO don_hang (
    khach_hang_id,
    ma_trang_thai,
    tong_tien,
    dia_chi_giao_hang,
    so_dien_thoai_nhan,
    email_nhan,
    ghi_chu,
    ngay_dat,
    ngay_cap_nhat
  ) VALUES (
    v_khach_hang_id,
    'DAGIAO',
    0, -- Sẽ cập nhật sau
    'Nhân tài: 789 Láng Hạ, Phường Láng Hạ, Quận Đống Đa, Hà Nội',
    '0987654321',
    NULL,
    'Đơn hàng mẫu - Giao hàng giờ hành chính',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '3 days'
  ) RETURNING id INTO v_don_hang_id;
  
  -- Thêm chi tiết sản phẩm 1
  INSERT INTO chi_tiet_don_hang (
    don_hang_id,
    dien_thoai_id,
    so_luong,
    gia_tien,
    thanh_tien,
    bao_hanh,
    giam_gia
  ) VALUES (
    v_don_hang_id,
    v_product1_id,
    1,
    v_product1_price,
    v_product1_price,
    12,
    0
  );
  
  -- Thêm chi tiết sản phẩm 2 (nếu có)
  IF v_product2_id IS NOT NULL THEN
    INSERT INTO chi_tiet_don_hang (
      don_hang_id,
      dien_thoai_id,
      so_luong,
      gia_tien,
      thanh_tien,
      bao_hanh,
      giam_gia
    ) VALUES (
      v_don_hang_id,
      v_product2_id,
      2,
      v_product2_price,
      v_product2_price * 2,
      12,
      0
    );
  END IF;
  
  -- Cập nhật tổng tiền
  UPDATE don_hang 
  SET tong_tien = (
    SELECT COALESCE(SUM(thanh_tien), 0)
    FROM chi_tiet_don_hang 
    WHERE don_hang_id = v_don_hang_id
  )
  WHERE id = v_don_hang_id;
  
  -- Thông báo thành công
  RAISE NOTICE 'Đã tạo đơn hàng mẫu thành công!';
  RAISE NOTICE 'ID đơn hàng: %', v_don_hang_id;
  RAISE NOTICE 'Khách hàng: %', v_khach_hang_id;
  RAISE NOTICE 'Tổng tiền: %', (SELECT tong_tien FROM don_hang WHERE id = v_don_hang_id);
END $$;

-- Kiểm tra kết quả
SELECT 
  dh.id,
  dh.ngay_dat,
  kh.ho_ten as khach_hang,
  dh.tong_tien,
  dh.ma_trang_thai,
  COUNT(ct.id) as so_san_pham
FROM don_hang dh
LEFT JOIN khach_hang kh ON dh.khach_hang_id = kh.id
LEFT JOIN chi_tiet_don_hang ct ON dh.id = ct.don_hang_id
WHERE dh.khach_hang_id IS NOT NULL
GROUP BY dh.id, dh.ngay_dat, kh.ho_ten, dh.tong_tien, dh.ma_trang_thai
ORDER BY dh.ngay_dat DESC
LIMIT 5;
