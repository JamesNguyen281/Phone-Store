-- =====================================================
-- IMPORT DỮ LIỆU TEST TỪ MYSQL VÀO SUPABASE
-- Chạy script này trong Supabase SQL Editor
-- =====================================================

-- Tắt trigger và constraint tạm thời để import nhanh
SET session_replication_role = 'replica';

-- =====================================================
-- 1. LOẠI SẢN PHẨM (loai_san_pham)
-- =====================================================
INSERT INTO loai_san_pham (ten_loai) VALUES
('Điện thoại'),
('Phụ kiện'),
('Máy tính bảng'),
('Smartwatch'),
('Thiết bị âm thanh')
ON CONFLICT (ten_loai) DO NOTHING;

-- =====================================================
-- 2. HÃNG (hang_dien_thoai)
-- =====================================================
INSERT INTO hang_dien_thoai (ten_hang, hinh_anh) VALUES
('Apple', NULL),
('Samsung', NULL),
('Xiaomi', NULL),
('OPPO', NULL),
('Vivo', NULL)
ON CONFLICT (ten_hang) DO NOTHING;

-- =====================================================
-- 3. TÀI KHOẢN VÀ NHÂN VIÊN
-- =====================================================
DO $$
DECLARE
  v_tai_khoan_id UUID;
  v_hang_apple_id UUID;
  v_hang_samsung_id UUID;
  v_hang_xiaomi_id UUID;
  v_hang_oppo_id UUID;
  v_loai_dienthoai_id UUID;
  v_loai_phukien_id UUID;
BEGIN
  -- Lấy ID các hãng
  SELECT id INTO v_hang_apple_id FROM hang_dien_thoai WHERE ten_hang = 'Apple';
  SELECT id INTO v_hang_samsung_id FROM hang_dien_thoai WHERE ten_hang = 'Samsung';
  SELECT id INTO v_hang_xiaomi_id FROM hang_dien_thoai WHERE ten_hang = 'Xiaomi';
  SELECT id INTO v_hang_oppo_id FROM hang_dien_thoai WHERE ten_hang = 'OPPO';
  
  -- Lấy ID loại sản phẩm
  SELECT id INTO v_loai_dienthoai_id FROM loai_san_pham WHERE ten_loai = 'Điện thoại';
  SELECT id INTO v_loai_phukien_id FROM loai_san_pham WHERE ten_loai = 'Phụ kiện';

  -- Tạo tài khoản Admin (nếu chưa có)
  IF NOT EXISTS (SELECT 1 FROM tai_khoan WHERE email = 'admin@phonestore.vn') THEN
    INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai)
    VALUES ('admin@phonestore.vn', 'ADMIN', true)
    RETURNING id INTO v_tai_khoan_id;
    
    INSERT INTO nhan_vien (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, nam_sinh)
    VALUES (v_tai_khoan_id, 'Admin Hệ Thống', '0900000001', 'Hà Nội', 1995);
  END IF;

  -- Tạo tài khoản Nhân viên 1
  IF NOT EXISTS (SELECT 1 FROM tai_khoan WHERE email = 'nvban1@phonestore.vn') THEN
    INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai)
    VALUES ('nvban1@phonestore.vn', 'NHANVIEN', true)
    RETURNING id INTO v_tai_khoan_id;
    
    INSERT INTO nhan_vien (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, nam_sinh)
    VALUES (v_tai_khoan_id, 'Nguyễn Văn B', '0900000002', 'Hà Nội', 1998);
  END IF;

  -- Tạo tài khoản Nhân viên 2
  IF NOT EXISTS (SELECT 1 FROM tai_khoan WHERE email = 'nvban2@phonestore.vn') THEN
    INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai)
    VALUES ('nvban2@phonestore.vn', 'NHANVIEN', true)
    RETURNING id INTO v_tai_khoan_id;
    
    INSERT INTO nhan_vien (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, nam_sinh)
    VALUES (v_tai_khoan_id, 'Trần Thị C', '0900000003', 'Hải Phòng', 1997);
  END IF;

  -- =====================================================
  -- 4. KHÁCH HÀNG
  -- =====================================================
  
  -- Khách hàng 1
  IF NOT EXISTS (SELECT 1 FROM tai_khoan WHERE email = 'nguyenvana@example.com') THEN
    INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai)
    VALUES ('nguyenvana@example.com', 'KHACHHANG', true)
    RETURNING id INTO v_tai_khoan_id;
    
    INSERT INTO khach_hang (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, email)
    VALUES (v_tai_khoan_id, 'Nguyễn Văn A', '0911111111', 'Hà Nội', 'nguyenvana@example.com');
  END IF;

  -- Khách hàng 2
  IF NOT EXISTS (SELECT 1 FROM tai_khoan WHERE email = 'tranthib@example.com') THEN
    INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai)
    VALUES ('tranthib@example.com', 'KHACHHANG', true)
    RETURNING id INTO v_tai_khoan_id;
    
    INSERT INTO khach_hang (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, email)
    VALUES (v_tai_khoan_id, 'Trần Thị B', '0922222222', 'Hải Phòng', 'tranthib@example.com');
  END IF;

  -- Khách hàng 3
  IF NOT EXISTS (SELECT 1 FROM tai_khoan WHERE email = 'levanc@example.com') THEN
    INSERT INTO tai_khoan (email, ma_vai_tro, trang_thai)
    VALUES ('levanc@example.com', 'KHACHHANG', true)
    RETURNING id INTO v_tai_khoan_id;
    
    INSERT INTO khach_hang (tai_khoan_id, ho_ten, so_dien_thoai, dia_chi, email)
    VALUES (v_tai_khoan_id, 'Lê Văn C', '0933333333', 'Đà Nẵng', 'levanc@example.com');
  END IF;

  -- =====================================================
  -- 5. SẢN PHẨM (dien_thoai)
  -- =====================================================
  
  -- Xóa sản phẩm cũ nếu có
  DELETE FROM thuoc_tinh_san_pham;
  DELETE FROM dien_thoai;
  
  -- iPhone 13 128GB
  INSERT INTO dien_thoai (hang_id, loai_san_pham_id, ten_sp, hinh_anh, tinh_trang, gia_tien, trang_thai, mo_ta, so_luong_ton)
  VALUES (
    v_hang_apple_id,
    v_loai_dienthoai_id,
    'iPhone 13 128GB',
    'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500',
    'MOI',
    18000000,
    true,
    'iPhone 13 bản 128GB VN/A',
    10
  );
  
  -- Samsung Galaxy A54
  INSERT INTO dien_thoai (hang_id, loai_san_pham_id, ten_sp, hinh_anh, tinh_trang, gia_tien, trang_thai, mo_ta, so_luong_ton)
  VALUES (
    v_hang_samsung_id,
    v_loai_dienthoai_id,
    'Samsung Galaxy A54',
    'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
    'MOI',
    8500000,
    true,
    'Galaxy A54 chính hãng',
    15
  );
  
  -- Xiaomi Redmi 12
  INSERT INTO dien_thoai (hang_id, loai_san_pham_id, ten_sp, hinh_anh, tinh_trang, gia_tien, trang_thai, mo_ta, so_luong_ton)
  VALUES (
    v_hang_xiaomi_id,
    v_loai_dienthoai_id,
    'Xiaomi Redmi 12',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500',
    'MOI',
    4500000,
    true,
    'Redmi 12 8/128GB',
    20
  );
  
  -- OPPO Reno 10
  INSERT INTO dien_thoai (hang_id, loai_san_pham_id, ten_sp, hinh_anh, tinh_trang, gia_tien, trang_thai, mo_ta, so_luong_ton)
  VALUES (
    v_hang_oppo_id,
    v_loai_dienthoai_id,
    'OPPO Reno 10',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500',
    'MOI',
    11000000,
    true,
    'Reno 10 256GB',
    12
  );
  
  -- Tai nghe Apple Earpods
  INSERT INTO dien_thoai (hang_id, loai_san_pham_id, ten_sp, hinh_anh, tinh_trang, gia_tien, trang_thai, mo_ta, so_luong_ton)
  VALUES (
    v_hang_apple_id,
    v_loai_phukien_id,
    'Tai nghe Apple Earpods',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500',
    'MOI',
    550000,
    true,
    'Tai nghe có dây Apple',
    50
  );

  -- =====================================================
  -- 6. THUỘC TÍNH SẢN PHẨM (thuoc_tinh_san_pham)
  -- =====================================================
  
  -- iPhone 13
  INSERT INTO thuoc_tinh_san_pham (dien_thoai_id, bo_nho, ram, chip_set, he_dieu_hanh, man_hinh, dung_luong_pin, cong_sac, loai_phu_kien)
  SELECT id, '128GB', '4GB', 'Apple A15 Bionic', 'iOS', '6.1" OLED', '3227 mAh', 'Lightning', NULL
  FROM dien_thoai WHERE ten_sp = 'iPhone 13 128GB';
  
  -- Samsung A54
  INSERT INTO thuoc_tinh_san_pham (dien_thoai_id, bo_nho, ram, chip_set, he_dieu_hanh, man_hinh, dung_luong_pin, cong_sac, loai_phu_kien)
  SELECT id, '256GB', '8GB', 'Exynos 1380', 'Android', '6.4" AMOLED', '5000 mAh', 'USB Type-C', NULL
  FROM dien_thoai WHERE ten_sp = 'Samsung Galaxy A54';
  
  -- Xiaomi Redmi 12
  INSERT INTO thuoc_tinh_san_pham (dien_thoai_id, bo_nho, ram, chip_set, he_dieu_hanh, man_hinh, dung_luong_pin, cong_sac, loai_phu_kien)
  SELECT id, '128GB', '8GB', 'Helio G88', 'Android', '6.79" IPS', '5000 mAh', 'USB Type-C', NULL
  FROM dien_thoai WHERE ten_sp = 'Xiaomi Redmi 12';
  
  -- OPPO Reno 10
  INSERT INTO thuoc_tinh_san_pham (dien_thoai_id, bo_nho, ram, chip_set, he_dieu_hanh, man_hinh, dung_luong_pin, cong_sac, loai_phu_kien)
  SELECT id, '256GB', '8GB', 'Snapdragon 778G', 'Android', '6.7" AMOLED', '4600 mAh', 'USB Type-C', NULL
  FROM dien_thoai WHERE ten_sp = 'OPPO Reno 10';
  
  -- Tai nghe Earpods
  INSERT INTO thuoc_tinh_san_pham (dien_thoai_id, bo_nho, ram, chip_set, he_dieu_hanh, man_hinh, dung_luong_pin, cong_sac, loai_phu_kien)
  SELECT id, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Tai nghe có dây'
  FROM dien_thoai WHERE ten_sp = 'Tai nghe Apple Earpods';

  RAISE NOTICE 'Import dữ liệu test thành công!';
END $$;

-- Bật lại trigger và constraint
SET session_replication_role = 'origin';

-- =====================================================
-- KIỂM TRA KẾT QUẢ
-- =====================================================

-- Kiểm tra sản phẩm
SELECT 
  dt.id,
  dt.ten_sp,
  h.ten_hang,
  l.ten_loai,
  dt.gia_tien,
  dt.so_luong_ton
FROM dien_thoai dt
LEFT JOIN hang_dien_thoai h ON dt.hang_id = h.id
LEFT JOIN loai_san_pham l ON dt.loai_san_pham_id = l.id
ORDER BY dt.ten_sp;

-- Kiểm tra thuộc tính
SELECT 
  dt.ten_sp,
  tt.chip_set,
  tt.ram,
  tt.bo_nho,
  tt.loai_phu_kien
FROM thuoc_tinh_san_pham tt
JOIN dien_thoai dt ON tt.dien_thoai_id = dt.id
ORDER BY dt.ten_sp;

-- Kiểm tra tài khoản
SELECT 
  tk.email,
  tk.ma_vai_tro,
  COALESCE(nv.ho_ten, kh.ho_ten) as ho_ten
FROM tai_khoan tk
LEFT JOIN nhan_vien nv ON tk.id = nv.tai_khoan_id
LEFT JOIN khach_hang kh ON tk.id = kh.tai_khoan_id
ORDER BY tk.ma_vai_tro, tk.email;
