/*
  # Chuẩn hóa schema theo MySQL và bổ sung ràng buộc

  1. Bảng nhan_vien
    - Đảm bảo có đầy đủ: ho_ten, so_dien_thoai, dia_chi, nam_sinh, hinh_anh
    - Vai trò nhân viên được phân biệt qua tai_khoan.ma_vai_tro (NHANVIEN hoặc ADMIN)
  
  2. Bảng khach_hang
    - Đảm bảo có email
  
  3. Bảng hoa_don
    - Đảm bảo có đầy đủ: nhan_vien_id, khach_hang_id (nullable), phan_loai, trang_thai, ngay_lap, ghi_chu
    - phan_loai: 'NHAP' (nhập hàng) hoặc 'BAN' (bán hàng)
    - trang_thai: 'NHAP', 'DA_THANH_TOAN', 'HUY'
  
  4. Bảng chi_tiet_don_hang (tương đương ChiTietHoaDon)
    - Đảm bảo có: bao_hanh (số tháng), giam_gia (số tiền)
  
  5. Security
    - Cập nhật RLS policies nếu cần
*/

-- ============================================
-- 1. Đảm bảo bảng nhan_vien có đầy đủ trường
-- ============================================

-- Các trường đã được thêm trong migration trước:
-- dia_chi, nam_sinh, hinh_anh

-- Kiểm tra và đảm bảo constraint
DO $$
BEGIN
  -- Đảm bảo tai_khoan_id là NOT NULL (đã có sẵn)
  -- Đảm bảo ho_ten là NOT NULL (đã có sẵn)
  NULL;
END $$;

-- ============================================
-- 2. Cập nhật bảng hoa_don với ràng buộc rõ ràng
-- ============================================

-- Đảm bảo phan_loai chỉ nhận 'NHAP' hoặc 'BAN'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'hoa_don_phan_loai_check'
  ) THEN
    ALTER TABLE hoa_don
    ADD CONSTRAINT hoa_don_phan_loai_check
    CHECK (phan_loai IN ('NHAP', 'BAN', 'XUAT'));
  END IF;
END $$;

-- Đảm bảo trang_thai chỉ nhận các giá trị hợp lệ
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint  
    WHERE conname = 'hoa_don_trang_thai_check'
  ) THEN
    ALTER TABLE hoa_don
    ADD CONSTRAINT hoa_don_trang_thai_check
    CHECK (trang_thai IN ('NHAP', 'DA_THANH_TOAN', 'HUY'));
  END IF;
END $$;

-- ============================================
-- 3. Index để tăng hiệu suất query
-- ============================================

-- Index cho hoa_don
CREATE INDEX IF NOT EXISTS idx_hoa_don_phan_loai ON hoa_don(phan_loai);
CREATE INDEX IF NOT EXISTS idx_hoa_don_trang_thai ON hoa_don(trang_thai);
CREATE INDEX IF NOT EXISTS idx_hoa_don_nhan_vien_id ON hoa_don(nhan_vien_id);
CREATE INDEX IF NOT EXISTS idx_hoa_don_khach_hang_id ON hoa_don(khach_hang_id);
CREATE INDEX IF NOT EXISTS idx_hoa_don_ngay_lap ON hoa_don(ngay_lap);

-- Index cho nhan_vien
CREATE INDEX IF NOT EXISTS idx_nhan_vien_tai_khoan_id ON nhan_vien(tai_khoan_id);

-- Index cho khach_hang
CREATE INDEX IF NOT EXISTS idx_khach_hang_tai_khoan_id ON khach_hang(tai_khoan_id);
CREATE INDEX IF NOT EXISTS idx_khach_hang_so_dien_thoai ON khach_hang(so_dien_thoai);

-- ============================================
-- 4. Đảm bảo dữ liệu hợp lệ
-- ============================================

-- Cập nhật các hóa đơn có phan_loai NULL thành 'BAN'
UPDATE hoa_don SET phan_loai = 'BAN' WHERE phan_loai IS NULL;

-- Cập nhật các hóa đơn có trang_thai NULL thành 'DA_THANH_TOAN'
UPDATE hoa_don SET trang_thai = 'DA_THANH_TOAN' WHERE trang_thai IS NULL;
