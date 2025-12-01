/*
  # Làm sạch schema và policies để khớp MySQL

  1. Drop policies cũ sử dụng trang_thai
  2. Xóa các trường thừa
  3. Tạo lại policies đơn giản hơn (không dùng trang_thai)
  
  MySQL chỉ có:
  - KhachHang: ho_ten, so_dien_thoai, dia_chi, email
  - Hang: ten_hang, hinh_anh  
  - LoaiSanPham: ten_loai
  - SanPham: ten_sp, hinh_anh, tinh_trang, gia_tien, trang_thai, mo_ta, so_luong_ton
*/

-- ============================================
-- 1. Drop policies phụ thuộc vào trang_thai
-- ============================================

DROP POLICY IF EXISTS "Mọi người xem hãng điện thoại" ON hang_dien_thoai;
DROP POLICY IF EXISTS "Mọi người xem điện thoại" ON dien_thoai;
DROP POLICY IF EXISTS "Anyone can view active product categories" ON loai_san_pham;

-- ============================================
-- 2. Xóa trường thừa trong khach_hang
-- ============================================

ALTER TABLE khach_hang DROP COLUMN IF EXISTS ngay_sinh CASCADE;
ALTER TABLE khach_hang DROP COLUMN IF EXISTS ngay_tao CASCADE;

-- ============================================
-- 3. Xóa trường thừa trong hang_dien_thoai
-- ============================================

ALTER TABLE hang_dien_thoai DROP COLUMN IF EXISTS quoc_gia CASCADE;
ALTER TABLE hang_dien_thoai DROP COLUMN IF EXISTS mo_ta CASCADE;
ALTER TABLE hang_dien_thoai DROP COLUMN IF EXISTS logo_url CASCADE;
ALTER TABLE hang_dien_thoai DROP COLUMN IF EXISTS trang_thai CASCADE;
ALTER TABLE hang_dien_thoai DROP COLUMN IF EXISTS ngay_tao CASCADE;

-- ============================================
-- 4. Xóa trường thừa trong loai_san_pham
-- ============================================

ALTER TABLE loai_san_pham DROP COLUMN IF EXISTS ma_loai CASCADE;
ALTER TABLE loai_san_pham DROP COLUMN IF EXISTS mo_ta CASCADE;
ALTER TABLE loai_san_pham DROP COLUMN IF EXISTS trang_thai CASCADE;
ALTER TABLE loai_san_pham DROP COLUMN IF EXISTS ngay_tao CASCADE;

-- ============================================
-- 5. Đổi tên cột trong dien_thoai
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dien_thoai' AND column_name = 'gia_ban'
  ) THEN
    ALTER TABLE dien_thoai RENAME COLUMN gia_ban TO gia_tien;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dien_thoai' AND column_name = 'hinh_anh_url'
  ) THEN
    ALTER TABLE dien_thoai RENAME COLUMN hinh_anh_url TO hinh_anh;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dien_thoai' AND column_name = 'ten_san_pham'
  ) THEN
    ALTER TABLE dien_thoai RENAME COLUMN ten_san_pham TO ten_sp;
  END IF;
END $$;

-- ============================================
-- 6. Xóa các trường chi tiết khỏi dien_thoai
-- ============================================

ALTER TABLE dien_thoai DROP COLUMN IF EXISTS chip CASCADE;
ALTER TABLE dien_thoai DROP COLUMN IF EXISTS ram CASCADE;
ALTER TABLE dien_thoai DROP COLUMN IF EXISTS bo_nho CASCADE;
ALTER TABLE dien_thoai DROP COLUMN IF EXISTS man_hinh CASCADE;
ALTER TABLE dien_thoai DROP COLUMN IF EXISTS camera CASCADE;
ALTER TABLE dien_thoai DROP COLUMN IF EXISTS pin CASCADE;
ALTER TABLE dien_thoai DROP COLUMN IF EXISTS mau_sac CASCADE;
ALTER TABLE dien_thoai DROP COLUMN IF EXISTS ngay_tao CASCADE;
ALTER TABLE dien_thoai DROP COLUMN IF EXISTS ngay_cap_nhat CASCADE;

-- Đổi tên tinh_trang thành tinh_trang để match MySQL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dien_thoai' AND column_name = 'tinh_trang'
  ) THEN
    -- MySQL dùng TINYINT (0: Cũ, 1: Mới, 2: Trưng bày)
    -- Supabase dùng text (MOI, CU, TRUNG_BAY)
    -- Giữ nguyên vì cả hai đều hợp lý
    NULL;
  END IF;
END $$;

-- ============================================
-- 7. Xóa trường thừa trong thuoc_tinh_san_pham
-- ============================================

ALTER TABLE thuoc_tinh_san_pham DROP COLUMN IF EXISTS ngay_tao CASCADE;
ALTER TABLE thuoc_tinh_san_pham DROP COLUMN IF EXISTS camera_truoc CASCADE;
ALTER TABLE thuoc_tinh_san_pham DROP COLUMN IF EXISTS camera_sau CASCADE;

-- ============================================
-- 8. Tạo lại policies đơn giản (không dùng trang_thai)
-- ============================================

-- Policy cho hang_dien_thoai: Mọi người đều xem được
CREATE POLICY "Everyone can view brands"
  ON hang_dien_thoai
  FOR SELECT
  TO public
  USING (true);

-- Policy cho dien_thoai: Mọi người xem sản phẩm có trang_thai = true
CREATE POLICY "Everyone can view active products"
  ON dien_thoai
  FOR SELECT
  TO public
  USING (trang_thai = true);

-- Policy cho loai_san_pham: Mọi người xem được tất cả
CREATE POLICY "Everyone can view product categories"
  ON loai_san_pham
  FOR SELECT
  TO public
  USING (true);