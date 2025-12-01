/*
  # Điều chỉnh bảng để khớp với schema MySQL
  
  1. Thay đổi bảng nhan_vien
    - Thêm `dia_chi` (text): Địa chỉ nhân viên
    - Thêm `nam_sinh` (integer): Năm sinh
    - Thêm `hinh_anh` (text): URL hình ảnh nhân viên
  
  2. Thay đổi bảng khach_hang
    - Thêm `email` (text): Email khách hàng (nếu chưa có)
  
  3. Thay đổi bảng hang_dien_thoai
    - Đổi tên cột `logo_url` thành `hinh_anh`
    - Xóa cột `quoc_gia` và `mo_ta`
  
  4. Thay đổi bảng dien_thoai (SanPham)
    - Giữ nguyên các trường hiện có
    - Đảm bảo có `loai_san_pham_id`
  
  5. Thay đổi bảng thuoc_tinh_san_pham
    - Thêm `loai_phu_kien` (text): Loại phụ kiện nếu là phụ kiện
  
  6. Thay đổi bảng hoa_don
    - Thêm `nhan_vien_id` (uuid): Nhân viên lập hóa đơn
    - Thêm `khach_hang_id` (uuid): Khách hàng (có thể null)
    - Thêm `ngay_lap` (timestamptz): Ngày lập hóa đơn
    - Thêm `trang_thai` (text): Trạng thái hóa đơn (NHAP, DA_THANH_TOAN, HUY)
    - Thêm `ghi_chu` (text): Ghi chú
*/

-- ============================================
-- 1. Cập nhật bảng nhan_vien
-- ============================================

-- Thêm dia_chi
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nhan_vien' AND column_name = 'dia_chi'
  ) THEN
    ALTER TABLE nhan_vien ADD COLUMN dia_chi text;
  END IF;
END $$;

-- Thêm nam_sinh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nhan_vien' AND column_name = 'nam_sinh'
  ) THEN
    ALTER TABLE nhan_vien ADD COLUMN nam_sinh integer;
  END IF;
END $$;

-- Thêm hinh_anh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nhan_vien' AND column_name = 'hinh_anh'
  ) THEN
    ALTER TABLE nhan_vien ADD COLUMN hinh_anh text;
  END IF;
END $$;

-- ============================================
-- 2. Cập nhật bảng khach_hang
-- ============================================

-- Thêm email (đã có rồi từ migration trước)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'khach_hang' AND column_name = 'email'
  ) THEN
    ALTER TABLE khach_hang ADD COLUMN email text;
  END IF;
END $$;

-- ============================================
-- 3. Cập nhật bảng hang_dien_thoai (Hang)
-- ============================================

-- Thêm hinh_anh nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hang_dien_thoai' AND column_name = 'hinh_anh'
  ) THEN
    ALTER TABLE hang_dien_thoai ADD COLUMN hinh_anh text;
    -- Copy dữ liệu từ logo_url sang hinh_anh
    UPDATE hang_dien_thoai SET hinh_anh = logo_url WHERE logo_url IS NOT NULL;
  END IF;
END $$;

-- ============================================
-- 4. Cập nhật bảng thuoc_tinh_san_pham
-- ============================================

-- Thêm loai_phu_kien
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'thuoc_tinh_san_pham' AND column_name = 'loai_phu_kien'
  ) THEN
    ALTER TABLE thuoc_tinh_san_pham ADD COLUMN loai_phu_kien text;
  END IF;
END $$;

-- ============================================
-- 5. Cập nhật bảng hoa_don
-- ============================================

-- Thêm nhan_vien_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hoa_don' AND column_name = 'nhan_vien_id'
  ) THEN
    ALTER TABLE hoa_don ADD COLUMN nhan_vien_id uuid;
    -- Thêm foreign key
    ALTER TABLE hoa_don
    ADD CONSTRAINT hoa_don_nhan_vien_id_fkey
    FOREIGN KEY (nhan_vien_id)
    REFERENCES nhan_vien(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
  END IF;
END $$;

-- Thêm khach_hang_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hoa_don' AND column_name = 'khach_hang_id'
  ) THEN
    ALTER TABLE hoa_don ADD COLUMN khach_hang_id uuid;
    -- Thêm foreign key
    ALTER TABLE hoa_don
    ADD CONSTRAINT hoa_don_khach_hang_id_fkey
    FOREIGN KEY (khach_hang_id)
    REFERENCES khach_hang(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;
    
    -- Copy dữ liệu từ don_hang
    UPDATE hoa_don
    SET khach_hang_id = don_hang.khach_hang_id
    FROM don_hang
    WHERE hoa_don.don_hang_id = don_hang.id;
  END IF;
END $$;

-- Thêm ngay_lap
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hoa_don' AND column_name = 'ngay_lap'
  ) THEN
    ALTER TABLE hoa_don ADD COLUMN ngay_lap timestamptz DEFAULT now();
    -- Copy từ ngay_tao
    UPDATE hoa_don SET ngay_lap = ngay_tao WHERE ngay_lap IS NULL;
  END IF;
END $$;

-- Thêm trang_thai (NHAP, DA_THANH_TOAN, HUY)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hoa_don' AND column_name = 'trang_thai'
  ) THEN
    ALTER TABLE hoa_don ADD COLUMN trang_thai text DEFAULT 'DA_THANH_TOAN';
    -- Cập nhật dựa vào trang_thai_thanh_toan
    UPDATE hoa_don 
    SET trang_thai = CASE 
      WHEN trang_thai_thanh_toan = true THEN 'DA_THANH_TOAN'
      ELSE 'NHAP'
    END;
  END IF;
END $$;

-- Thêm ghi_chu
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hoa_don' AND column_name = 'ghi_chu'
  ) THEN
    ALTER TABLE hoa_don ADD COLUMN ghi_chu text;
  END IF;
END $$;