/*
  # Bổ sung tính năng quản lý kho và thuộc tính sản phẩm nâng cao

  ## Tổng quan
  Migration này kết hợp hệ thống hiện tại với các tính năng từ schema MySQL:
  - Thêm phân loại hóa đơn (nhập/bán)
  - Thêm bảng thuộc tính sản phẩm chi tiết
  - Thêm thông tin bảo hành cho chi tiết đơn hàng
  - Thêm trạng thái sản phẩm (mới/cũ/trưng bày)

  ## 1. Cập nhật bảng hóa đơn
  
  ### Thêm cột phân loại vào hoa_don
    - `phan_loai` (text): Phân loại hóa đơn (NHAP, BAN)
  
  ## 2. Thêm bảng thuộc tính sản phẩm chi tiết
  
  ### thuoc_tinh_san_pham
    - `id` (uuid, primary key): ID thuộc tính
    - `dien_thoai_id` (uuid): ID sản phẩm
    - `bo_nho` (text): Bộ nhớ (128GB, 256GB...)
    - `ram` (text): RAM (4GB, 8GB...)
    - `chip_set` (text): Chipset
    - `he_dieu_hanh` (text): Hệ điều hành
    - `man_hinh` (text): Màn hình
    - `dung_luong_pin` (text): Dung lượng pin
    - `cong_sac` (text): Cổng sạc
    - `camera_truoc` (text): Camera trước
    - `camera_sau` (text): Camera sau

  ## 3. Cập nhật bảng chi tiết đơn hàng
  
  ### Thêm cột bảo hành
    - `bao_hanh` (integer): Số tháng bảo hành
    - `giam_gia` (decimal): Số tiền giảm giá

  ## 4. Cập nhật bảng sản phẩm
  
  ### Thêm cột tình trạng
    - `tinh_trang` (text): Tình trạng (MOI, CU, TRUNG_BAY)

  ## 5. Security
  
  Cập nhật RLS policies cho các bảng mới
*/

-- =====================================================
-- 1. THÊM CỘT PHÂN LOẠI VÀO BẢNG HOA_DON
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hoa_don' AND column_name = 'phan_loai'
  ) THEN
    ALTER TABLE hoa_don ADD COLUMN phan_loai text NOT NULL DEFAULT 'BAN';
  END IF;
END $$;

COMMENT ON COLUMN hoa_don.phan_loai IS 'Phân loại: NHAP (hóa đơn nhập hàng), BAN (hóa đơn bán hàng)';

-- =====================================================
-- 2. TẠO BẢNG THUỘC TÍNH SẢN PHẨM CHI TIẾT
-- =====================================================

CREATE TABLE IF NOT EXISTS thuoc_tinh_san_pham (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dien_thoai_id uuid NOT NULL REFERENCES dien_thoai(id) ON DELETE CASCADE,
  bo_nho text,
  ram text,
  chip_set text,
  he_dieu_hanh text,
  man_hinh text,
  dung_luong_pin text,
  cong_sac text,
  camera_truoc text,
  camera_sau text,
  ngay_tao timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_thuoc_tinh_dien_thoai ON thuoc_tinh_san_pham(dien_thoai_id);

-- =====================================================
-- 3. THÊM CỘT BẢO HÀNH VÀ GIẢM GIÁ VÀO CHI_TIET_DON_HANG
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chi_tiet_don_hang' AND column_name = 'bao_hanh'
  ) THEN
    ALTER TABLE chi_tiet_don_hang ADD COLUMN bao_hanh integer NOT NULL DEFAULT 12;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chi_tiet_don_hang' AND column_name = 'giam_gia'
  ) THEN
    ALTER TABLE chi_tiet_don_hang ADD COLUMN giam_gia decimal(15, 2) NOT NULL DEFAULT 0;
  END IF;
END $$;

COMMENT ON COLUMN chi_tiet_don_hang.bao_hanh IS 'Số tháng bảo hành';
COMMENT ON COLUMN chi_tiet_don_hang.giam_gia IS 'Số tiền giảm giá cho sản phẩm';

-- =====================================================
-- 4. THÊM CỘT TÌNH TRẠNG VÀO BẢNG DIEN_THOAI
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dien_thoai' AND column_name = 'tinh_trang'
  ) THEN
    ALTER TABLE dien_thoai ADD COLUMN tinh_trang text NOT NULL DEFAULT 'MOI';
  END IF;
END $$;

COMMENT ON COLUMN dien_thoai.tinh_trang IS 'Tình trạng: MOI (mới), CU (cũ), TRUNG_BAY (trưng bày)';

-- =====================================================
-- 5. TẠO BẢNG LOV CHO TÌNH TRẠNG SẢN PHẨM
-- =====================================================

CREATE TABLE IF NOT EXISTS lov_tinh_trang_san_pham (
  ma_tinh_trang text PRIMARY KEY,
  ten_tinh_trang text NOT NULL,
  mo_ta text
);

INSERT INTO lov_tinh_trang_san_pham (ma_tinh_trang, ten_tinh_trang, mo_ta) VALUES
  ('MOI', 'Mới', 'Sản phẩm mới 100%'),
  ('CU', 'Cũ', 'Sản phẩm đã qua sử dụng'),
  ('TRUNG_BAY', 'Trưng bày', 'Sản phẩm trưng bày, like new')
ON CONFLICT (ma_tinh_trang) DO NOTHING;

-- =====================================================
-- 6. BẬT ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE thuoc_tinh_san_pham ENABLE ROW LEVEL SECURITY;
ALTER TABLE lov_tinh_trang_san_pham ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 7. TẠO POLICIES CHO THUOC_TINH_SAN_PHAM
-- =====================================================

CREATE POLICY "Mọi người xem thuộc tính sản phẩm"
  ON thuoc_tinh_san_pham FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin và nhân viên thêm thuộc tính"
  ON thuoc_tinh_san_pham FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

CREATE POLICY "Admin và nhân viên cập nhật thuộc tính"
  ON thuoc_tinh_san_pham FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro IN ('ADMIN', 'NHANVIEN')
    )
  );

CREATE POLICY "Admin xóa thuộc tính"
  ON thuoc_tinh_san_pham FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

-- =====================================================
-- 8. TẠO POLICIES CHO LOV_TINH_TRANG_SAN_PHAM
-- =====================================================

CREATE POLICY "Mọi người xem tình trạng sản phẩm"
  ON lov_tinh_trang_san_pham FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================
-- 9. THÊM DỮ LIỆU MẪU
-- =====================================================

-- Thêm một số hãng mẫu nếu chưa có
INSERT INTO hang_dien_thoai (ten_hang, quoc_gia, mo_ta, trang_thai) VALUES
  ('Apple', 'Mỹ', 'Thương hiệu công nghệ hàng đầu thế giới', true),
  ('Samsung', 'Hàn Quốc', 'Tập đoàn điện tử lớn nhất Hàn Quốc', true),
  ('Xiaomi', 'Trung Quốc', 'Thương hiệu smartphone phổ biến', true),
  ('OPPO', 'Trung Quốc', 'Chuyên về smartphone camera selfie', true),
  ('Vivo', 'Trung Quốc', 'Thương hiệu smartphone giá tốt', true)
ON CONFLICT (ten_hang) DO NOTHING;
