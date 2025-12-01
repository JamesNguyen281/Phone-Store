/*
  # Thêm bảng Loại Sản Phẩm
  
  1. Bảng mới
    - `loai_san_pham`
      - `id` (uuid, primary key)
      - `ma_loai` (text, unique): Mã loại (DIENTHOAI, PHUKIEN, TABLET, SMARTWATCH, AMTHANH)
      - `ten_loai` (text, unique): Tên loại sản phẩm
      - `mo_ta` (text): Mô tả loại sản phẩm
      - `trang_thai` (boolean): Trạng thái active/inactive
      - `ngay_tao` (timestamptz): Ngày tạo
  
  2. Thay đổi
    - Thêm cột `loai_san_pham_id` vào bảng `dien_thoai`
    - Thêm foreign key constraint
  
  3. Dữ liệu mẫu
    - 5 loại sản phẩm cơ bản
  
  4. Security
    - Enable RLS
    - Public có thể đọc các loại đang active
    - Chỉ ADMIN có thể thêm/sửa/xóa
*/

-- Tạo bảng loai_san_pham
CREATE TABLE IF NOT EXISTS loai_san_pham (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ma_loai text UNIQUE NOT NULL,
  ten_loai text UNIQUE NOT NULL,
  mo_ta text,
  trang_thai boolean DEFAULT true,
  ngay_tao timestamptz DEFAULT now()
);

-- Thêm cột loai_san_pham_id vào bảng dien_thoai
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dien_thoai' AND column_name = 'loai_san_pham_id'
  ) THEN
    ALTER TABLE dien_thoai ADD COLUMN loai_san_pham_id uuid;
  END IF;
END $$;

-- Thêm foreign key nếu chưa có
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'dien_thoai_loai_san_pham_id_fkey'
  ) THEN
    ALTER TABLE dien_thoai
    ADD CONSTRAINT dien_thoai_loai_san_pham_id_fkey
    FOREIGN KEY (loai_san_pham_id)
    REFERENCES loai_san_pham(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
  END IF;
END $$;

-- Insert dữ liệu mẫu
INSERT INTO loai_san_pham (ma_loai, ten_loai, mo_ta, trang_thai) VALUES
('DIENTHOAI', 'Điện thoại', 'Điện thoại di động smartphone', true),
('PHUKIEN', 'Phụ kiện', 'Phụ kiện điện thoại và thiết bị công nghệ', true),
('TABLET', 'Máy tính bảng', 'Máy tính bảng iPad, Android tablet', true),
('SMARTWATCH', 'Đồng hồ thông minh', 'Smartwatch và thiết bị đeo tay', true),
('AMTHANH', 'Thiết bị âm thanh', 'Tai nghe, loa, thiết bị âm thanh', true)
ON CONFLICT (ma_loai) DO NOTHING;

-- Enable RLS
ALTER TABLE loai_san_pham ENABLE ROW LEVEL SECURITY;

-- Policy: Public có thể xem các loại đang active
CREATE POLICY "Anyone can view active product categories"
  ON loai_san_pham
  FOR SELECT
  USING (trang_thai = true);

-- Policy: Authenticated users có thể xem tất cả
CREATE POLICY "Authenticated users can view all categories"
  ON loai_san_pham
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Chỉ ADMIN có thể insert
CREATE POLICY "Only admins can insert categories"
  ON loai_san_pham
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

-- Policy: Chỉ ADMIN có thể update
CREATE POLICY "Only admins can update categories"
  ON loai_san_pham
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

-- Policy: Chỉ ADMIN có thể delete
CREATE POLICY "Only admins can delete categories"
  ON loai_san_pham
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tai_khoan
      WHERE tai_khoan.id = auth.uid()
      AND tai_khoan.ma_vai_tro = 'ADMIN'
    )
  );

-- Cập nhật loại sản phẩm cho dữ liệu hiện có (gán tất cả là DIENTHOAI)
UPDATE dien_thoai
SET loai_san_pham_id = (SELECT id FROM loai_san_pham WHERE ma_loai = 'DIENTHOAI')
WHERE loai_san_pham_id IS NULL;