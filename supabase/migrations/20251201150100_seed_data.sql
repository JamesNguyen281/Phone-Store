/*
  # Seed data - Dữ liệu mẫu từ MySQL
  
  Insert dữ liệu mẫu cho hệ thống quản lý bán điện thoại
*/

-- ============================================
-- 1. Loại sản phẩm (5 bản ghi)
-- ============================================
INSERT INTO loai_san_pham (ten_loai) VALUES
('Điện thoại'),
('Phụ kiện'),
('Máy tính bảng'),
('Smartwatch'),
('Thiết bị âm thanh')
ON CONFLICT (ten_loai) DO NOTHING;

-- ============================================
-- 2. Hãng điện thoại (5 bản ghi)
-- ============================================
INSERT INTO hang (ten_hang, hinh_anh) VALUES
('Apple', NULL),
('Samsung', NULL),
('Xiaomi', NULL),
('OPPO', NULL),
('Vivo', NULL)
ON CONFLICT (ten_hang) DO NOTHING;

-- ============================================
-- 3. Tạo tài khoản cho nhân viên
-- ============================================

-- Tạo tài khoản admin
DO $$
DECLARE
  admin_account_id UUID;
  nv_account_id UUID;
BEGIN
  -- Tài khoản admin
  INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai, mat_khau)
  VALUES ('admin@example.com', 'ADMIN', true, '123456')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO admin_account_id;

  -- Nếu tài khoản đã tồn tại, lấy id
  IF admin_account_id IS NULL THEN
    SELECT id INTO admin_account_id FROM tai_khoan WHERE email = 'admin@example.com';
  END IF;

  -- Tạo nhân viên admin
  INSERT INTO nhan_vien (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, nam_sinh, vai_tro)
  VALUES (admin_account_id, 'Admin Hệ Thống', '0900000001', 'Hà Nội', 1995, 0)
  ON CONFLICT (tai_khoan_id) DO NOTHING;

  -- Tài khoản nhân viên 1
  INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai, mat_khau)
  VALUES ('nvban1@example.com', 'NHANVIEN', true, '123456')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO nv_account_id;

  IF nv_account_id IS NULL THEN
    SELECT id INTO nv_account_id FROM tai_khoan WHERE email = 'nvban1@example.com';
  END IF;

  INSERT INTO nhan_vien (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, nam_sinh, vai_tro)
  VALUES (nv_account_id, 'Nguyễn Văn B', '0900000002', 'Hà Nội', 1998, 1)
  ON CONFLICT (tai_khoan_id) DO NOTHING;

  -- Tài khoản nhân viên 2
  INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai, mat_khau)
  VALUES ('nvban2@example.com', 'NHANVIEN', true, '123456')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO nv_account_id;

  IF nv_account_id IS NULL THEN
    SELECT id INTO nv_account_id FROM tai_khoan WHERE email = 'nvban2@example.com';
  END IF;

  INSERT INTO nhan_vien (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, nam_sinh, vai_tro)
  VALUES (nv_account_id, 'Trần Thị C', '0900000003', 'Hải Phòng', 1997, 1)
  ON CONFLICT (tai_khoan_id) DO NOTHING;

  -- Tài khoản nhân viên 3
  INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai, mat_khau)
  VALUES ('nvkho1@example.com', 'NHANVIEN', true, '123456')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO nv_account_id;

  IF nv_account_id IS NULL THEN
    SELECT id INTO nv_account_id FROM tai_khoan WHERE email = 'nvkho1@example.com';
  END IF;

  INSERT INTO nhan_vien (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, nam_sinh, vai_tro)
  VALUES (nv_account_id, 'Lê Văn D', '0900000004', 'Đà Nẵng', 1996, 1)
  ON CONFLICT (tai_khoan_id) DO NOTHING;

  -- Tài khoản nhân viên 4
  INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai, mat_khau)
  VALUES ('nvketoan@example.com', 'NHANVIEN', true, '123456')
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO nv_account_id;

  IF nv_account_id IS NULL THEN
    SELECT id INTO nv_account_id FROM tai_khoan WHERE email = 'nvketoan@example.com';
  END IF;

  INSERT INTO nhan_vien (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, nam_sinh, vai_tro)
  VALUES (nv_account_id, 'Phạm Thị E', '0900000005', 'HCM', 1999, 1)
  ON CONFLICT (tai_khoan_id) DO NOTHING;
END $$;

-- ============================================
-- 4. Tạo tài khoản cho khách hàng
-- ============================================

DO $$
DECLARE
  kh_account_id UUID;
BEGIN
  -- Khách hàng 1
  INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai)
  VALUES ('a@example.com', 'KHACHHANG', true)
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO kh_account_id;

  IF kh_account_id IS NULL THEN
    SELECT id INTO kh_account_id FROM tai_khoan WHERE email = 'a@example.com';
  END IF;

  INSERT INTO khach_hang (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, email)
  VALUES (kh_account_id, 'Nguyễn Văn A', '0911111111', 'Hà Nội', 'a@example.com')
  ON CONFLICT (tai_khoan_id) DO NOTHING;

  -- Khách hàng 2
  INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai)
  VALUES ('b@example.com', 'KHACHHANG', true)
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO kh_account_id;

  IF kh_account_id IS NULL THEN
    SELECT id INTO kh_account_id FROM tai_khoan WHERE email = 'b@example.com';
  END IF;

  INSERT INTO khach_hang (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, email)
  VALUES (kh_account_id, 'Trần Thị B', '0922222222', 'Hải Phòng', 'b@example.com')
  ON CONFLICT (tai_khoan_id) DO NOTHING;

  -- Khách hàng 3
  INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai)
  VALUES ('c@example.com', 'KHACHHANG', true)
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO kh_account_id;

  IF kh_account_id IS NULL THEN
    SELECT id INTO kh_account_id FROM tai_khoan WHERE email = 'c@example.com';
  END IF;

  INSERT INTO khach_hang (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, email)
  VALUES (kh_account_id, 'Lê Văn C', '0933333333', 'Đà Nẵng', 'c@example.com')
  ON CONFLICT (tai_khoan_id) DO NOTHING;

  -- Khách hàng 4
  INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai)
  VALUES ('d@example.com', 'KHACHHANG', true)
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO kh_account_id;

  IF kh_account_id IS NULL THEN
    SELECT id INTO kh_account_id FROM tai_khoan WHERE email = 'd@example.com';
  END IF;

  INSERT INTO khach_hang (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, email)
  VALUES (kh_account_id, 'Phạm Thị D', '0944444444', 'HCM', 'd@example.com')
  ON CONFLICT (tai_khoan_id) DO NOTHING;

  -- Khách hàng 5
  INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai)
  VALUES ('e@example.com', 'KHACHHANG', true)
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO kh_account_id;

  IF kh_account_id IS NULL THEN
    SELECT id INTO kh_account_id FROM tai_khoan WHERE email = 'e@example.com';
  END IF;

  INSERT INTO khach_hang (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, email)
  VALUES (kh_account_id, 'Hoàng Văn E', '0955555555', 'Nam Định', 'e@example.com')
  ON CONFLICT (tai_khoan_id) DO NOTHING;
END $$;

-- ============================================
-- 5. Sản phẩm (6 bản ghi)
-- ============================================

DO $$
DECLARE
  apple_id UUID;
  samsung_id UUID;
  xiaomi_id UUID;
  oppo_id UUID;
  vivo_id UUID;
  loai_dt_id UUID;
  loai_pk_id UUID;
BEGIN
  -- Lấy ID của các hãng
  SELECT ma_hang INTO apple_id FROM hang WHERE ten_hang = 'Apple';
  SELECT ma_hang INTO samsung_id FROM hang WHERE ten_hang = 'Samsung';
  SELECT ma_hang INTO xiaomi_id FROM hang WHERE ten_hang = 'Xiaomi';
  SELECT ma_hang INTO oppo_id FROM hang WHERE ten_hang = 'OPPO';
  SELECT ma_hang INTO vivo_id FROM hang WHERE ten_hang = 'Vivo';
  
  -- Lấy ID của loại sản phẩm
  SELECT ma_loai INTO loai_dt_id FROM loai_san_pham WHERE ten_loai = 'Điện thoại';
  SELECT ma_loai INTO loai_pk_id FROM loai_san_pham WHERE ten_loai = 'Phụ kiện';

  -- Insert sản phẩm
  INSERT INTO san_pham (ma_hang, ma_loai, ten_sp, tinh_trang, gia_tien, trang_thai, mo_ta, so_luong_ton)
  VALUES
    (apple_id, loai_dt_id, 'iPhone 13 128GB', 1, 18000000.00, 1, 'iPhone 13 bản 128GB, VN/A', 10),
    (samsung_id, loai_dt_id, 'Samsung Galaxy A54', 1, 8500000.00, 1, 'Galaxy A54 chính hãng', 15),
    (xiaomi_id, loai_dt_id, 'Xiaomi Redmi 12', 1, 4500000.00, 1, 'Redmi 12 8/128GB', 20),
    (oppo_id, loai_dt_id, 'OPPO Reno 10', 1, 11000000.00, 1, 'Reno 10 bản 256GB', 12),
    (vivo_id, loai_dt_id, 'Vivo Y36', 1, 6500000.00, 1, 'Vivo Y36 8/256GB', 18),
    (apple_id, loai_pk_id, 'Tai nghe Apple Earpods', 1, 550000.00, 1, 'Tai nghe có dây Apple', 50)
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- 6. Thuộc tính sản phẩm
-- ============================================

DO $$
DECLARE
  sp_id UUID;
BEGIN
  -- iPhone 13
  SELECT ma_sp INTO sp_id FROM san_pham WHERE ten_sp = 'iPhone 13 128GB';
  IF sp_id IS NOT NULL THEN
    INSERT INTO thuoc_tinh_san_pham (ma_sp, bo_nho, ram, chip_set, he_dieu_hanh, man_hinh, dung_luong_pin, cong_sac, loai_phu_kien)
    VALUES (sp_id, '128GB', '4GB', 'Apple A15 Bionic', 'iOS', '6.1 inch OLED', '3227 mAh', 'Lightning', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Samsung A54
  SELECT ma_sp INTO sp_id FROM san_pham WHERE ten_sp = 'Samsung Galaxy A54';
  IF sp_id IS NOT NULL THEN
    INSERT INTO thuoc_tinh_san_pham (ma_sp, bo_nho, ram, chip_set, he_dieu_hanh, man_hinh, dung_luong_pin, cong_sac, loai_phu_kien)
    VALUES (sp_id, '256GB', '8GB', 'Exynos 1380', 'Android', '6.4 inch AMOLED', '5000 mAh', 'USB Type-C', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Xiaomi Redmi 12
  SELECT ma_sp INTO sp_id FROM san_pham WHERE ten_sp = 'Xiaomi Redmi 12';
  IF sp_id IS NOT NULL THEN
    INSERT INTO thuoc_tinh_san_pham (ma_sp, bo_nho, ram, chip_set, he_dieu_hanh, man_hinh, dung_luong_pin, cong_sac, loai_phu_kien)
    VALUES (sp_id, '128GB', '8GB', 'MediaTek Helio G88', 'Android', '6.79 inch IPS', '5000 mAh', 'USB Type-C', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- OPPO Reno 10
  SELECT ma_sp INTO sp_id FROM san_pham WHERE ten_sp = 'OPPO Reno 10';
  IF sp_id IS NOT NULL THEN
    INSERT INTO thuoc_tinh_san_pham (ma_sp, bo_nho, ram, chip_set, he_dieu_hanh, man_hinh, dung_luong_pin, cong_sac, loai_phu_kien)
    VALUES (sp_id, '256GB', '8GB', 'Snapdragon 778G', 'Android', '6.7 inch AMOLED', '4600 mAh', 'USB Type-C', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Vivo Y36
  SELECT ma_sp INTO sp_id FROM san_pham WHERE ten_sp = 'Vivo Y36';
  IF sp_id IS NOT NULL THEN
    INSERT INTO thuoc_tinh_san_pham (ma_sp, bo_nho, ram, chip_set, he_dieu_hanh, man_hinh, dung_luong_pin, cong_sac, loai_phu_kien)
    VALUES (sp_id, '256GB', '8GB', 'Snapdragon 680', 'Android', '6.64 inch IPS', '5000 mAh', 'USB Type-C', NULL)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Tai nghe Earpods
  SELECT ma_sp INTO sp_id FROM san_pham WHERE ten_sp = 'Tai nghe Apple Earpods';
  IF sp_id IS NOT NULL THEN
    INSERT INTO thuoc_tinh_san_pham (ma_sp, bo_nho, ram, chip_set, he_dieu_hanh, man_hinh, dung_luong_pin, cong_sac, loai_phu_kien)
    VALUES (sp_id, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Tai nghe có dây')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
